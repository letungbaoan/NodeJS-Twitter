import { Router } from 'express'
import {
	accessTokenValidator,
	loginValidator,
	refreshTokenValidator,
	registerValidator
} from '~/middlewares/users.middlewares'
import { loginController, registerController, logoutController } from '~/controllers/users.controllers'
import { wrapResquestHandler } from '~/utils/handlers'
const usersRouter = Router()

/**
 * Path: /register
 * Method: POST
 * Body: { name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO8610}
 */
usersRouter.post('/register', registerValidator, wrapResquestHandler(registerController))

/**
 * Path: /login
 * Method: GET
 * Body: { email: string, password: string }
 */
usersRouter.post('/login', loginValidator, wrapResquestHandler(loginController))

/**
 * Path: /logout
 * Method: POST
 * Body: { name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO8610}
 */
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapResquestHandler(logoutController))
export default usersRouter
