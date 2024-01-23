import { Router } from 'express'
import {
	accessTokenValidator,
	changePasswordValidator,
	emailVerifyTokenValidator,
	followValidator,
	forgotPasswordValidator,
	loginValidator,
	refreshTokenValidator,
	registerValidator,
	resetPasswordValidator,
	unfollowValidator,
	updateMeValidator,
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
	updateMeController,
	getProfileController,
	followController,
	unfollowController,
	changePasswordController
} from '~/controllers/users.controllers'
import { wrapResquestHandler } from '~/utils/handlers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { UpdateMeReqBody } from '~/models/request/User.requests'
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
usersRouter.patch(
	'/me',
	accessTokenValidator,
	verifiedUserValidator,
	filterMiddleware<UpdateMeReqBody>([
		'name',
		'date_of_birth',
		'bio',
		'location',
		'avatar',
		'website',
		'username',
		'cover_photo'
	]),
	updateMeValidator,
	wrapResquestHandler(updateMeController)
)

/**
 * Path: /:username
 * Method: GET
 * Header: { access_token: string}
 */
usersRouter.get('/:username', wrapResquestHandler(getProfileController))

/**
 * Path: /follow/user_id
 * Method: POST
 * Header: { access_token: string}
 * Body: { user_id: string}
 */
usersRouter.post(
	'/follow',
	accessTokenValidator,
	verifiedUserValidator,
	followValidator,
	wrapResquestHandler(followController)
)

/**
 * Path: /:username
 * Method: GET
 * Header: { access_token: string}
 */
usersRouter.get('/:username', wrapResquestHandler(getProfileController))

/**
 * Path: /follow/:user_id
 * Method: DELETE
 * Header: { access_token: string}
 * Body: { user_id: string}
 */
usersRouter.delete(
	'/follow/:user_id',
	accessTokenValidator,
	verifiedUserValidator,
	unfollowValidator,
	wrapResquestHandler(unfollowController)
)

usersRouter.put(
	'/change-password',
	accessTokenValidator,
	verifiedUserValidator,
	changePasswordValidator,
	wrapResquestHandler(changePasswordController)
)

export default usersRouter
