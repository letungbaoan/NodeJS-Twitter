import { registerReqBody } from '~/models/request/User.requests'
import databaseService from './database.service'
import User from '~/models/schemas/User.schema'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import RefreshToken from '~/models/schemas/RefreshToken.schemas'
import { ObjectId } from 'mongodb'
import { config } from 'dotenv'
import { USERS_MESSAGES } from '~/constants/messages'
import { verify } from 'crypto'
config()
class UsersService {
	private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
		return signToken({
			payload: {
				user_id,
				token_type: TokenType.AccessToken,
				verify: verify
			},
			privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
			options: {
				expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
			}
		})
	}

	private signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
		return signToken({
			payload: {
				user_id,
				token_type: TokenType.RefreshToken,
				verify: verify
			},
			privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
			options: {
				expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
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
			privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
			options: {
				expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
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
			privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
			options: {
				expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
			}
		})
	}

	private signAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
		return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
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
				email_verify_token: email_verify_token,
				date_of_birth: new Date(payload.date_of_birth),
				password: hashPassword(payload.password)
			})
		)
		const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
			user_id: user_id.toString(),
			verify: UserVerifyStatus.Unverified
		})
		await databaseService.refreshTokens.insertOne(
			new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
		)
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
		await databaseService.refreshTokens.insertOne(
			new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
		)
		return {
			access_token,
			refresh_token
		}
	}

	async logout(refresh_token: string) {
		await databaseService.refreshTokens.deleteOne({ token: refresh_token })
		return {
			message: USERS_MESSAGES.LOGOUT_SUCCESS
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
		return {
			access_token,
			refresh_token
		}
	}

	async resendEmailVarify(user_id: string) {
		const email_verify_token = await this.signEmailVerifyToken({
			user_id: user_id.toString(),
			verify: UserVerifyStatus.Unverified
		})
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

	async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
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
}

const usersService = new UsersService()
export default usersService
