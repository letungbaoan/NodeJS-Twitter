import { NextFunction, Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import { ParamsDictionary } from 'express-serve-static-core'
import usersService from '~/services/users.services'
import { registerReqBody } from '~/models/request/User.requests'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'

export const loginController = async (req: Request, res: Response) => {
	const user = req.user as User
	const user_id = user._id as ObjectId
	const result = await usersService.login(user_id.toString())
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
