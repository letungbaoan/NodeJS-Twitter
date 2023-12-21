import { NextFunction, Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import { ParamsDictionary } from 'express-serve-static-core'
import usersService from '~/services/users.services'
import {
	ForgotPasswordReqBody,
	LoginReqBody,
	LogoutReqBody,
	RefreshTokenReqBody,
	ResetPasswordReqBody,
	TokenPayLoad,
	VerifyEmailReqBody,
	registerReqBody,
	verifyForgotPasswordTokenReqBody
} from '~/models/request/User.requests'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import exp from 'constants'
import { TokenExpiredError } from 'jsonwebtoken'
import databaseService from '~/services/database.service'
import HTTP_STATUS from '~/constants/httpStatus'
import { UserVerifyStatus } from '~/constants/enums'
import { json } from 'stream/consumers'
import { result } from 'lodash'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
	const user = req.user as User
	const user_id = user._id as ObjectId
	const result = await usersService.login({ user_id: user_id.toString(), verify: user.verify })
	return res.status(200).json({
		message: USERS_MESSAGES.LOGIN_SUCCESS,
		result
	})
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
	const result = await usersService.resendEmailVarify(user_id)
	return res.json({
		result
	})
}

export const forgotPasswordController = async (
	req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
	res: Response
) => {
	const { _id, verify } = req.user as User
	const result = await usersService.forgotPassword({
		user_id: (_id as ObjectId).toString(),
		verify: verify
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
		user
	})
}

export const updateMeController = async (req: Request, res: Response) => {
	//const { user_id } = req.decoded_authorization as TokenPayLoad
	//const user = await usersService.getMe(user_id)
	return res.json({
		message: USERS_MESSAGES.UPDATE_ME_SUCCESS
		//user
	})
}
