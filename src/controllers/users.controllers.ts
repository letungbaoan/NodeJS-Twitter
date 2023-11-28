import { Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.service'
import usersService from '~/services/users.services'
export const loginController = (req: Request, res: Response) => {
	const { email, password } = req.body
	if (email === 'baoan7604' && password === 'Khicon2004.') {
		return res.status(200).json({
			message: 'Login success'
		})
	}
	return res.status(400).json({
		error: 'Login failed'
	})
}

export const registerController = async (req: Request, res: Response) => {
	const { email, password } = req.body
	try {
		const result = await usersService.register({ email, password })
		return res.status(200).json({
			message: 'Register success'
		})
	} catch (error) {
		return res.status(400).json({
			error: 'Register failed'
		})
	}
}
