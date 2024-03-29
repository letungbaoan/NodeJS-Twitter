import { UpdateMeReqBody, registerReqBody } from '~/models/request/User.requests'
import databaseService from './database.service'
import User from '~/models/schemas/User.schema'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import RefreshToken from '~/models/schemas/RefreshToken.schemas'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import Follower from '~/models/schemas/Follower.schema'
import axios from 'axios'
import { sendForgotPasswordEmail, sendVerifyRegisterEmail } from '~/utils/email'
import { envConfig } from '~/constants/config'
class UsersService {
	private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
		return signToken({
			payload: {
				user_id,
				token_type: TokenType.AccessToken,
				verify: verify
			},
			privateKey: envConfig.jwtSecretAccessToken,
			options: {
				expiresIn: envConfig.accessTokenExpiresIn
			}
		})
	}

	private signRefreshToken({ user_id, verify, exp }: { user_id: string; verify: UserVerifyStatus; exp?: number }) {
		if (exp) {
			return signToken({
				payload: {
					user_id,
					token_type: TokenType.RefreshToken,
					verify: verify,
					exp: exp
				},
				privateKey: envConfig.jwtSecretRefreshToken
			})
		}
		return signToken({
			payload: {
				user_id,
				token_type: TokenType.RefreshToken,
				verify: verify
			},
			privateKey: envConfig.jwtSecretRefreshToken,
			options: {
				expiresIn: envConfig.refreshTokenExpiresIn
			}
		})
	}

	private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
		return signToken({
			payload: {
				user_id,
				token_type: TokenType.EmailVerifyToken,
				verify: verify
			},
			privateKey: envConfig.jwtSecretEmailVerifyToken,
			options: {
				expiresIn: envConfig.emailVerifyTokenExpiresIn
			}
		})
	}

	private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
		return signToken({
			payload: {
				user_id,
				token_type: TokenType.ForgetPasswordToken,
				verify: verify
			},
			privateKey: envConfig.jwtSecretForgotPasswordToken,
			options: {
				expiresIn: envConfig.forgotPasswordTokenExpiresIn
			}
		})
	}

	private signAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
		return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
	}

	private decodeRefreshToken(refresh_token: string) {
		return verifyToken({
			token: refresh_token,
			secretOnPublicKey: envConfig.jwtSecretRefreshToken
		})
	}

	async register(payload: registerReqBody) {
		const user_id = new ObjectId()
		const email_verify_token = await this.signEmailVerifyToken({
			user_id: user_id.toString(),
			verify: UserVerifyStatus.Unverified
		})
		await databaseService.users.insertOne(
			new User({
				...payload,
				_id: user_id,
				username: `user${user_id.toString()}`,
				email_verify_token: email_verify_token,
				date_of_birth: new Date(payload.date_of_birth),
				password: hashPassword(payload.password)
			})
		)
		const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
			user_id: user_id.toString(),
			verify: UserVerifyStatus.Unverified
		})
		const { iat, exp } = await this.decodeRefreshToken(refresh_token)
		await databaseService.refreshTokens.insertOne(
			new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, iat: iat, exp: exp })
		)
		await sendVerifyRegisterEmail(payload.email, email_verify_token)
		return {
			access_token,
			refresh_token
		}
	}

	async checkEmailExist(email: string) {
		const user = await databaseService.users.findOne({ email })
		return Boolean(user)
	}

	async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
		const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
			user_id: user_id.toString(),
			verify: verify
		})
		const { iat, exp } = await this.decodeRefreshToken(refresh_token)
		await databaseService.refreshTokens.insertOne(
			new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, iat, exp })
		)
		return {
			access_token,
			refresh_token
		}
	}

	private async getOauthGoogleToken(code: string) {
		const body = {
			code,
			client_id: envConfig.googleClientId,
			client_secret: envConfig.googleClientSecret,
			redirect_uri: envConfig.googleRedirectUri,
			grant_type: 'authorization_code'
		}
		const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		})
		return data as {
			access_token: string
			id_token: string
		}
	}

	private async getGoolgeUserInfo(access_token: string, id_token: string) {
		const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
			params: {
				access_token,
				alt: 'json'
			},
			headers: {
				Authorization: `Bearer ${id_token}`
			}
		})
		return data as {
			id: string
			email: string
			verified_email: string
			name: string
			given_name: string
			picture: string
			locale: string
		}
	}

	async oauth(code: string) {
		const { id_token, access_token } = await this.getOauthGoogleToken(code)
		const userInfo = await this.getGoolgeUserInfo(access_token, id_token)
		if (!userInfo.verified_email) {
			throw new ErrorWithStatus({
				message: USERS_MESSAGES.EMAIL_NOT_VERIFIED,
				status: HTTP_STATUS.BAD_REQUEST
			})
		}
		const user = await databaseService.users.findOne({ email: userInfo.email })
		if (user) {
			const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
				user_id: user._id.toString(),
				verify: user.verify
			})
			const { iat, exp } = await this.decodeRefreshToken(refresh_token)
			await databaseService.refreshTokens.insertOne(
				new RefreshToken({ user_id: new ObjectId(user._id), token: refresh_token, iat, exp })
			)
			return {
				access_token,
				refresh_token,
				new_user: 0,
				verify: user.verify
			}
		} else {
			const password = Math.random().toString(36).substring(2, 15)
			const { access_token, refresh_token } = await this.register({
				email: userInfo.email,
				name: userInfo.name,
				date_of_birth: new Date().toISOString(),
				password: password,
				confirmPassword: password
			})
			return {
				access_token,
				refresh_token,
				new_user: 1,
				verify: UserVerifyStatus.Unverified
			}
		}
	}

	async logout(refresh_token: string) {
		await databaseService.refreshTokens.deleteOne({ token: refresh_token })
		return {
			message: USERS_MESSAGES.LOGOUT_SUCCESS
		}
	}

	async refreshToken({
		user_id,
		verify,
		refresh_token,
		exp
	}: {
		user_id: string
		verify: UserVerifyStatus | undefined
		refresh_token: string
		exp: number
	}) {
		const new_verify = verify as UserVerifyStatus
		const [new_access_token, new_refresh_token] = await Promise.all([
			this.signAccessToken({ user_id, verify: new_verify }),
			this.signRefreshToken({ user_id, verify: new_verify, exp }),
			databaseService.refreshTokens.deleteOne({ token: refresh_token })
		])
		const decoded_refresh_token = await this.decodeRefreshToken(new_refresh_token)
		await databaseService.refreshTokens.insertOne(
			new RefreshToken({
				user_id: new ObjectId(user_id),
				token: new_refresh_token,
				iat: decoded_refresh_token.iat,
				exp: decoded_refresh_token.exp
			})
		)
		return {
			access_token: new_access_token,
			refresh_token: new_refresh_token
		}
	}

	async verifyEmail(user_id: string) {
		const [token] = await Promise.all([
			this.signAccessAndRefreshToken({
				user_id: user_id.toString(),
				verify: UserVerifyStatus.Verified
			}),
			databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
				{
					$set: {
						email_verify_token: '',
						verify: UserVerifyStatus.Verified,
						updated_at: '$$NOW'
					}
				}
			])
		])
		const [access_token, refresh_token] = token
		const { iat, exp } = await this.decodeRefreshToken(refresh_token)
		await databaseService.refreshTokens.insertOne(
			new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, iat, exp })
		)
		return {
			access_token,
			refresh_token
		}
	}

	async resendEmailVerify(user_id: string, email: string) {
		const email_verify_token = await this.signEmailVerifyToken({
			user_id: user_id.toString(),
			verify: UserVerifyStatus.Unverified
		})

		await sendVerifyRegisterEmail(email, email_verify_token)

		await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
			{
				$set: {
					email_verify_token: email_verify_token,
					updated_at: '$$NOW'
				}
			}
		])

		return {
			message: USERS_MESSAGES.RESEND_EMAIL_VERIFY_SUCCESSED
		}
	}

	async forgotPassword({ user_id, verify, email }: { user_id: string; verify: UserVerifyStatus; email: string }) {
		const forgot_password_token = await this.signForgotPasswordToken({
			user_id: user_id.toString(),
			verify: verify
		})

		await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
			{
				$set: {
					forgot_password_token: forgot_password_token,
					updated_at: '$$NOW'
				}
			}
		])

		await sendForgotPasswordEmail(email, forgot_password_token)

		return {
			message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
		}
	}

	async resetPassword(user_id: string, password: string) {
		await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
			{
				$set: {
					forgot_password_token: '',
					password: hashPassword(password),
					updated_at: '$$NOW'
				}
			}
		])
		return {
			message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
		}
	}

	async getMe(user_id: string) {
		return await databaseService.users.findOne(
			{ _id: new ObjectId(user_id) },
			{
				projection: {
					password: 0,
					forgot_password_token: 0,
					email_verify_token: 0
				}
			}
		)
	}

	async updateMe(user_id: string, payload: UpdateMeReqBody) {
		const _payload = payload.date_of_birth
			? { ...payload, date_of_birth: new Date(payload.date_of_birth) }
			: payload
		const user = await databaseService.users.findOneAndUpdate(
			{
				_id: new ObjectId(user_id)
			},
			{
				$set: {
					...(_payload as UpdateMeReqBody & { date_of_birth: Date })
				},
				$currentDate: {
					updated_at: true
				}
			},
			{
				returnDocument: 'after',
				projection: {
					password: 0,
					forgot_password_token: 0,
					email_verify_token: 0
				}
			}
		)
		return user
	}

	async getProfile(username: string) {
		const user = await databaseService.users.findOne(
			{ username: username },
			{
				projection: {
					password: 0,
					forgot_password_token: 0,
					email_verify_token: 0,
					verify: 0,
					created_at: 0,
					updated_at: 0
				}
			}
		)
		if (user === null) {
			throw new ErrorWithStatus({
				message: USERS_MESSAGES.USER_NOT_FOUND,
				status: HTTP_STATUS.NOT_FOUND
			})
		}
		return user
	}

	async follow(user_id: string, followed_user_id: string) {
		const follower = await databaseService.followers.findOne({
			user_id: new ObjectId(user_id),
			followed_user_id: new ObjectId(followed_user_id)
		})
		if (follower) {
			throw new ErrorWithStatus({
				message: USERS_MESSAGES.ALREADY_FOLLOWED,
				status: HTTP_STATUS.BAD_REQUEST
			})
		}
		await databaseService.followers.insertOne(
			new Follower({
				user_id: new ObjectId(user_id),
				followed_user_id: new ObjectId(followed_user_id)
			})
		)
		return {
			message: USERS_MESSAGES.FOLLOW_SUCCESS
		}
	}

	async unfollow(user_id: string, followed_user_id: string) {
		const follower = await databaseService.followers.findOne({
			user_id: new ObjectId(user_id),
			followed_user_id: new ObjectId(followed_user_id)
		})
		if (!follower) {
			throw new ErrorWithStatus({
				message: USERS_MESSAGES.ALREADY_UNFOLLOWED,
				status: HTTP_STATUS.BAD_REQUEST
			})
		}
		await databaseService.followers.deleteOne({
			user_id: new ObjectId(user_id),
			followed_user_id: new ObjectId(followed_user_id)
		})
		return {
			message: USERS_MESSAGES.UNFOLLOW_SUCCESS
		}
	}

	async changePassword(user_id: string, newPassword: string) {
		await databaseService.users.updateOne(
			{ _id: new ObjectId(user_id) },
			{
				$set: {
					password: hashPassword(newPassword)
				},
				$currentDate: {
					updated_at: true
				}
			}
		)
		return {
			message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS
		}
	}
}

const usersService = new UsersService()
export default usersService
