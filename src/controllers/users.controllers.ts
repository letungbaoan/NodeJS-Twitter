import { NextFunction, Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import { ParamsDictionary } from 'express-serve-static-core'
import usersService from '~/services/users.services'
import {
	ChangePasswordReqBody,
	FollowReqBody,
	ForgotPasswordReqBody,
	GetProfileReqParams,
	LoginReqBody,
	LogoutReqBody,
	RefreshTokenReqBody,
	ResetPasswordReqBody,
	TokenPayLoad,
	UnfollowReqParams,
	UpdateMeReqBody,
	VerifyEmailReqBody,
	registerReqBody,
	verifyForgotPasswordTokenReqBody
} from '~/models/request/User.requests'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import databaseService from '~/services/database.service'
import HTTP_STATUS from '~/constants/httpStatus'
import { UserVerifyStatus } from '~/constants/enums'
import { envConfig } from '~/constants/config'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
	const user = req.user as User
	const user_id = user._id as ObjectId
	const result = await usersService.login({ user_id: user_id.toString(), verify: user.verify })
	return res.status(200).json({
		message: USERS_MESSAGES.LOGIN_SUCCESS,
		result
	})
}

export const oauthController = async (req: Request, res: Response) => {
	const { code } = req.query
	const result = await usersService.oauth(code as string)
	const urlRedirect = `${envConfig.clientRedirectUri}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&new_user=${result.new_user}`
	return res.redirect(urlRedirect)
}

export const registerController = async (
	req: Request<ParamsDictionary, any, registerReqBody>,
	res: Response,
	next: NextFunction
) => {
	const result = await usersService.register(req.body)
	return res.status(200).json({
		message: USERS_MESSAGES.REGISTER_SUCCESS,
		result
	})
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
	const { refresh_token } = req.body
	const result = await usersService.logout(refresh_token)
	return res.json(result)
}

export const refreshTokenController = async (
	req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
	res: Response
) => {
	const { refresh_token } = req.body
	const { user_id, verify, exp } = req.decoded_refresh_token as TokenPayLoad
	const result = await usersService.refreshToken({ user_id, verify, refresh_token, exp })
	return res.status(HTTP_STATUS.ACCEPTED).json({
		message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
		result: result
	})
}

export const verifyEmailController = async (req: Request<ParamsDictionary, any, VerifyEmailReqBody>, res: Response) => {
	const { user_id } = req.decoded_email_verify_token as TokenPayLoad
	const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
	if (!user) {
		return res.status(HTTP_STATUS.NOT_FOUND).json({
			message: USERS_MESSAGES.USER_NOT_FOUND
		})
	}
	if (user.verify === UserVerifyStatus.Verified) {
		return res.json({
			message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED
		})
	}
	const result = await usersService.verifyEmail(user_id)
	return res.json({
		message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESSED,
		result
	})
}

export const resendVerifyEmailController = async (req: Request, res: Response) => {
	const { user_id } = req.decoded_authorization as TokenPayLoad
	const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
	if (!user) {
		return res.status(HTTP_STATUS.NOT_FOUND).json({
			message: USERS_MESSAGES.USER_NOT_FOUND
		})
	}
	if (user.verify === UserVerifyStatus.Verified) {
		return res.json({
			message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED
		})
	}
	const result = await usersService.resendEmailVerify(user_id, user.email)
	return res.json({
		result
	})
}

export const forgotPasswordController = async (
	req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
	res: Response
) => {
	const { _id, verify, email } = req.user as User
	const result = await usersService.forgotPassword({
		user_id: (_id as ObjectId).toString(),
		verify: verify,
		email
	})
	return res.json(result)
}

export const verifyForgotPasswordTokenController = async (
	req: Request<ParamsDictionary, any, verifyForgotPasswordTokenReqBody>,
	res: Response
) => {
	return res.json({
		message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
	})
}

export const resetPasswordController = async (
	req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
	res: Response
) => {
	const { user_id } = req.decoded_forgot_password_token as TokenPayLoad
	const { password } = req.body
	const result = await usersService.resetPassword(user_id, password)
	return res.json(result)
}

export const getMeController = async (req: Request, res: Response) => {
	const { user_id } = req.decoded_authorization as TokenPayLoad
	const user = await usersService.getMe(user_id)
	return res.json({
		message: USERS_MESSAGES.GET_ME_SUCCESS,
		result: user
	})
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response) => {
	const { user_id } = req.decoded_authorization as TokenPayLoad
	const body = req.body
	const user = await usersService.updateMe(user_id, body)
	return res.json({
		message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
		result: user
	})
}

export const getProfileController = async (req: Request<GetProfileReqParams>, res: Response) => {
	const { username } = req.params
	const user = await usersService.getProfile(username)
	return res.json({
		message: USERS_MESSAGES.GET_PROFILE_SUCCESS,
		result: user
	})
}

export const followController = async (req: Request<ParamsDictionary, any, FollowReqBody>, res: Response) => {
	const { user_id } = req.decoded_authorization as TokenPayLoad
	const { followed_user_id } = req.body
	const result = await usersService.follow(user_id, followed_user_id)
	return res.json(result)
}

export const unfollowController = async (req: Request<UnfollowReqParams>, res: Response) => {
	const { user_id } = req.decoded_authorization as TokenPayLoad
	const { user_id: followed_user_id } = req.params
	const result = await usersService.unfollow(user_id, followed_user_id as string)
	return res.json(result)
}

export const changePasswordController = async (
	req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
	res: Response
) => {
	const { user_id } = req.decoded_authorization as TokenPayLoad
	const { password } = req.body
	const result = await usersService.changePassword(user_id, password)
	return res.json(result)
}
