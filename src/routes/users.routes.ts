import { Router } from 'express'
import {
	accessTokenValidator,
	emailVerifyTokenValidator,
	forgotPasswordValidator,
	loginValidator,
	refreshTokenValidator,
	registerValidator,
	resetPasswordValidator,
	verifiedUserValidator,
	verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import {
	loginController,
	registerController,
	logoutController,
	verifyEmailController,
	resendVerifyEmailController,
	forgotPasswordController,
	verifyForgotPasswordTokenController,
	resetPasswordController,
	getMeController,
	updateMeController
} from '~/controllers/users.controllers'
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
 * Body: { refresh_token: string }
 */
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapResquestHandler(logoutController))

/**
 * Path: /verify-email
 * Method: POST
 * Body: { email-verify-token: string }
 */
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapResquestHandler(verifyEmailController))

/**
 * Path: /resend-verify-email
 * Method: POST
 * Header: { Authorization: Bearer <accesss_token}
 * Body: {  }
 */
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapResquestHandler(resendVerifyEmailController))

/**
 * Path: /forgot-password
 * Method: POST
 * Body: { email: string }
 */
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapResquestHandler(forgotPasswordController))

/**
 * Path: /verify-forgot-password
 * Method: POST
 * Body: { forgot_password_token }
 */
usersRouter.post(
	'/verify-forgot-password',
	verifyForgotPasswordTokenValidator,
	wrapResquestHandler(verifyForgotPasswordTokenController)
)

/**
 * Path: /reset-password
 * Method: POST
 * Body: { forgot_password_token: string, password: string, confirm_password: string }
 */
usersRouter.post('/reset-password', resetPasswordValidator, wrapResquestHandler(resetPasswordController))

/**
 * Path: /me
 * Method: GET
 * Header: { access_token: string}
 */
usersRouter.get('/me', accessTokenValidator, wrapResquestHandler(getMeController))

/**
 * Path: /me
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token>}
 * Body: UserSchema
 */
usersRouter.patch('/me', accessTokenValidator, verifiedUserValidator, wrapResquestHandler(updateMeController))

export default usersRouter
