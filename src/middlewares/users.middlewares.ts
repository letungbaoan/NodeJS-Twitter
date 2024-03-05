import { ErrorWithStatus } from 'src/models/Errors'
import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import usersService from '~/services/users.services'
import { validate } from '~/utils/validation'
import { USERS_MESSAGES } from '~/constants/messages'
import databaseService from '~/services/database.service'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import HTTP_STATUS from '~/constants/httpStatus'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { TokenPayLoad } from '~/models/request/User.requests'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import { REGEX_USERNAME } from '~/constants/regex'
import { verifyAccessToken } from '~/utils/common'
import { envConfig } from '~/constants/config'

export const loginValidator = validate(
	checkSchema(
		{
			email: {
				notEmpty: {
					errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
				},
				isString: {
					errorMessage: USERS_MESSAGES.EMAIL_MUST_BE_A_STRING
				},
				isLength: {
					options: {
						min: 8,
						max: 50
					},
					errorMessage: USERS_MESSAGES.EMAIL_LENGTH_MUST_BE_FROM_8_TO_50
				},
				trim: true,
				isEmail: {
					errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
				},
				custom: {
					options: async (value, { req }) => {
						const user = await databaseService.users.findOne({
							email: value,
							password: hashPassword(req.body.password)
						})
						if (user === null) {
							throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORECT)
						}
						req.user = user
						return true
					}
				}
			},
			password: {
				notEmpty: {
					errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
				},
				isString: {
					errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
				},
				isLength: {
					options: {
						min: 8,
						max: 50
					},
					errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
				},
				trim: true
			}
		},
		['body']
	)
)

export const registerValidator = validate(
	checkSchema(
		{
			name: {
				notEmpty: {
					errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
				},
				isString: {
					errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
				},
				isLength: {
					options: {
						min: 5,
						max: 50
					},
					errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_5_TO_50
				},
				trim: true
			},
			email: {
				notEmpty: {
					errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
				},
				isString: {
					errorMessage: USERS_MESSAGES.EMAIL_MUST_BE_A_STRING
				},
				isLength: {
					options: {
						min: 8,
						max: 50
					},
					errorMessage: USERS_MESSAGES.EMAIL_LENGTH_MUST_BE_FROM_8_TO_50
				},
				trim: true,
				isEmail: {
					errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
				},
				custom: {
					options: async (value) => {
						const result = await usersService.checkEmailExist(value)
						if (result) {
							throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
						}
						return true
					}
				}
			},
			password: {
				notEmpty: {
					errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
				},
				isString: {
					errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
				},
				isLength: {
					options: {
						min: 8,
						max: 50
					},
					errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
				},
				trim: true,
				isStrongPassword: {
					options: {
						minLength: 8,
						minLowercase: 1,
						minSymbols: 1,
						minUppercase: 1
					},
					errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
				}
			},
			confirmPassword: {
				notEmpty: {
					errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
				},
				isString: {
					errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
				},
				isLength: {
					options: {
						min: 8,
						max: 50
					},
					errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
				},
				trim: true,
				isStrongPassword: {
					options: {
						minLength: 8,
						minLowercase: 1,
						minSymbols: 1,
						minUppercase: 1
					},
					errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
				},
				custom: {
					options: (value, { req }) => {
						if (value !== req.body.password) {
							throw new Error('Confirm password phai giong voi pass word')
						}
						return true
					},
					errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_NOT_DIFFERENT_FROM_PASSWORD
				}
			},
			date_of_birth: {
				notEmpty: {
					errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_IS_REQUIRED
				},
				isISO8601: {
					options: {
						strict: true,
						strictSeparator: true
					},
					errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601
				}
			}
		},
		['body']
	)
)

export const accessTokenValidator = validate(
	checkSchema(
		{
			Authorization: {
				trim: true,
				custom: {
					options: async (value: string, { req }) => {
						const access_token = (value || '').split(' ')[1]
						return await verifyAccessToken(access_token, req as Request)
					}
				}
			}
		},
		['headers']
	)
)

export const refreshTokenValidator = validate(
	checkSchema(
		{
			refresh_token: {
				trim: true,
				custom: {
					options: async (value: string, { req }) => {
						if (!value) {
							throw new ErrorWithStatus({
								message: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
								status: HTTP_STATUS.UNAUTHORIZED
							})
						}
						try {
							const [decoded_refresh_token, refresh_token] = await Promise.all([
								verifyToken({
									token: value,
									secretOnPublicKey: envConfig.jwtSecretRefreshToken
								}),
								databaseService.refreshTokens.findOne({ token: value })
							])
							if (refresh_token === null) {
								throw new ErrorWithStatus({
									message: USERS_MESSAGES.REFRESH_TOKEN_IS_USED_OR_NOT_EXIST,
									status: HTTP_STATUS.UNAUTHORIZED
								})
							}
							;(req as Request).decoded_refresh_token = decoded_refresh_token
						} catch (error) {
							if (error instanceof JsonWebTokenError) {
								throw new ErrorWithStatus({
									message: capitalize(error.message),
									status: HTTP_STATUS.UNAUTHORIZED
								})
							}
							throw error
						}
						return true
					}
				}
			}
		},
		['body']
	)
)

export const emailVerifyTokenValidator = validate(
	checkSchema(
		{
			email_verify_token: {
				trim: true,
				custom: {
					options: async (value: string, { req }) => {
						if (!value) {
							throw new ErrorWithStatus({
								message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
								status: HTTP_STATUS.UNAUTHORIZED
							})
						}
						try {
							const decoded_email_verify_token = await verifyToken({
								token: value,
								secretOnPublicKey: envConfig.jwtSecretEmailVerifyToken
							})

							;(req as Request).decoded_email_verify_token = decoded_email_verify_token
						} catch (error) {
							throw new ErrorWithStatus({
								message: capitalize((error as JsonWebTokenError).message),
								status: HTTP_STATUS.UNAUTHORIZED
							})
						}

						return true
					}
				}
			}
		},
		['body']
	)
)

export const forgotPasswordValidator = validate(
	checkSchema(
		{
			email: {
				notEmpty: {
					errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
				},
				isString: {
					errorMessage: USERS_MESSAGES.EMAIL_MUST_BE_A_STRING
				},
				isLength: {
					options: {
						min: 8,
						max: 50
					},
					errorMessage: USERS_MESSAGES.EMAIL_LENGTH_MUST_BE_FROM_8_TO_50
				},
				trim: true,
				isEmail: {
					errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
				},
				custom: {
					options: async (value, { req }) => {
						const user = await databaseService.users.findOne({
							email: value
						})
						if (user === null) {
							throw new Error(USERS_MESSAGES.USER_NOT_FOUND)
						}
						req.user = user
						return true
					}
				}
			}
		},
		['body']
	)
)

export const verifyForgotPasswordTokenValidator = validate(
	checkSchema(
		{
			forgot_password_token: {
				trim: true,
				custom: {
					options: async (value, { req }) => {
						console.log(req.body)
						if (!value) {
							throw new ErrorWithStatus({
								message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
								status: HTTP_STATUS.UNAUTHORIZED
							})
						}
						try {
							const decoded_forgot_password_token = await verifyToken({
								token: value,
								secretOnPublicKey: envConfig.jwtSecretForgotPasswordToken
							})
							const { user_id } = decoded_forgot_password_token
							const user = await databaseService.users.findOne({
								_id: new ObjectId(user_id)
							})
							if (user === null) {
								throw new ErrorWithStatus({
									message: USERS_MESSAGES.USER_NOT_FOUND,
									status: HTTP_STATUS.UNAUTHORIZED
								})
							}
							if (user.forgot_password_token !== value) {
								throw new ErrorWithStatus({
									message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID,
									status: HTTP_STATUS.UNAUTHORIZED
								})
							}
							;(req as Request).decoded_forgot_password_token = decoded_forgot_password_token
						} catch (error) {
							if (error instanceof JsonWebTokenError) {
								throw new ErrorWithStatus({
									message: capitalize(error.message),
									status: HTTP_STATUS.UNAUTHORIZED
								})
							}
							throw error
						}
						return true
					}
				}
			}
		},
		['body']
	)
)

export const resetPasswordValidator = validate(
	checkSchema(
		{
			forgot_password_token: {
				trim: true,
				custom: {
					options: async (value, { req }) => {
						console.log(req.body)
						if (!value) {
							throw new ErrorWithStatus({
								message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
								status: HTTP_STATUS.UNAUTHORIZED
							})
						}
						try {
							const decoded_forgot_password_token = await verifyToken({
								token: value,
								secretOnPublicKey: envConfig.jwtSecretForgotPasswordToken
							})
							const { user_id } = decoded_forgot_password_token
							const user = await databaseService.users.findOne({
								_id: new ObjectId(user_id)
							})
							if (user === null) {
								throw new ErrorWithStatus({
									message: USERS_MESSAGES.USER_NOT_FOUND,
									status: HTTP_STATUS.UNAUTHORIZED
								})
							}
							if (user.forgot_password_token !== value) {
								throw new ErrorWithStatus({
									message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID,
									status: HTTP_STATUS.UNAUTHORIZED
								})
							}
							;(req as Request).decoded_forgot_password_token = decoded_forgot_password_token
						} catch (error) {
							if (error instanceof JsonWebTokenError) {
								throw new ErrorWithStatus({
									message: capitalize(error.message),
									status: HTTP_STATUS.UNAUTHORIZED
								})
							}
							throw error
						}
						return true
					}
				}
			},
			password: {
				notEmpty: {
					errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
				},
				isString: {
					errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
				},
				isLength: {
					options: {
						min: 8,
						max: 50
					},
					errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
				},
				trim: true,
				isStrongPassword: {
					options: {
						minLength: 8,
						minLowercase: 1,
						minSymbols: 1,
						minUppercase: 1
					},
					errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
				}
			},
			confirmPassword: {
				notEmpty: {
					errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
				},
				isString: {
					errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
				},
				isLength: {
					options: {
						min: 8,
						max: 50
					},
					errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
				},
				trim: true,
				isStrongPassword: {
					options: {
						minLength: 8,
						minLowercase: 1,
						minSymbols: 1,
						minUppercase: 1
					},
					errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
				},
				custom: {
					options: (value, { req }) => {
						if (value !== req.body.password) {
							throw new Error('Confirm password phai giong voi pass word')
						}
						return true
					},
					errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_NOT_DIFFERENT_FROM_PASSWORD
				}
			}
		},
		['body']
	)
)

export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
	const { verify } = req.decoded_authorization as TokenPayLoad
	if (verify !== UserVerifyStatus.Verified) {
		return next(
			new ErrorWithStatus({
				message: USERS_MESSAGES.USER_NOT_VERIFIED,
				status: HTTP_STATUS.FORBIDDEN
			})
		)
	}
	next()
}

export const updateMeValidator = validate(
	checkSchema(
		{
			name: {
				optional: true,
				isString: {
					errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
				},
				isLength: {
					options: {
						min: 5,
						max: 50
					},
					errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_5_TO_50
				},
				trim: true
			},
			date_of_birth: {
				optional: true,
				isString: {
					errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_MUST_BE_STRING
				},
				trim: true
			},
			bio: {
				optional: true,
				isString: {
					errorMessage: USERS_MESSAGES.BIO_MUST_BE_STRING
				},
				trim: true,
				isLength: {
					options: {
						min: 1,
						max: 200
					},
					errorMessage: USERS_MESSAGES.BIO_LENGTH_MUST_BE_FROM_1_TO_200
				}
			},
			location: {
				optional: true,
				isString: {
					errorMessage: USERS_MESSAGES.LOCATION_MUST_BE_STRING
				},
				trim: true,
				isLength: {
					options: {
						min: 1,
						max: 200
					},
					errorMessage: USERS_MESSAGES.LOCATION_LENGTH_MUST_BE_FROM_1_TO_200
				}
			},
			website: {
				optional: true,
				isString: {
					errorMessage: USERS_MESSAGES.WEBSITE_MUST_BE_STRING
				},
				trim: true,
				isLength: {
					options: {
						min: 1,
						max: 200
					},
					errorMessage: USERS_MESSAGES.WEBSITE_LENGTH_MUST_BE_FROM_1_TO_200
				}
			},
			username: {
				notEmpty: {
					errorMessage: USERS_MESSAGES.USERNAME_IS_REQUIRED
				},
				isString: {
					errorMessage: USERS_MESSAGES.USERNAME_MUST_BE_STRING
				},
				isLength: {
					options: {
						min: 4,
						max: 15
					},
					errorMessage: USERS_MESSAGES.USERNAME_LENGTH_MUST_BE_FROM_4_TO_15
				},
				trim: true,
				custom: {
					options: async (value: string, { req }) => {
						if (!REGEX_USERNAME.test(value)) {
							throw Error(USERS_MESSAGES.USERNAME_IS_INVALID)
						}
						const user = await databaseService.users.findOne({ username: value })
						if (user) {
							throw Error(USERS_MESSAGES.USERNAME_ALREADY_USED)
						}
					}
				}
			},
			avatar: {
				optional: true,
				isString: {
					errorMessage: USERS_MESSAGES.AVATAR_MUST_BE_STRING
				},
				trim: true,
				isLength: {
					options: {
						min: 1,
						max: 200
					},
					errorMessage: USERS_MESSAGES.AVATAR_LENGTH_MUST_BE_FROM_1_TO_200
				}
			},
			cover_photo: {
				optional: true,
				isString: {
					errorMessage: USERS_MESSAGES.COVER_PHOTO_MUST_BE_STRING
				},
				trim: true,
				isLength: {
					options: {
						min: 1,
						max: 200
					},
					errorMessage: USERS_MESSAGES.COVER_PHOTO_LENGTH_MUST_BE_FROM_1_TO_200
				}
			}
		},
		['body']
	)
)

export const followValidator = validate(
	checkSchema(
		{
			followed_user_id: {
				custom: {
					options: async (value, { req }) => {
						if (!ObjectId.isValid(value)) {
							throw new ErrorWithStatus({
								message: USERS_MESSAGES.USER_NOT_FOUND,
								status: HTTP_STATUS.NOT_FOUND
							})
						}
						const followed_used = await databaseService.users.findOne({
							_id: new ObjectId(value)
						})
						if (followed_used === null) {
							throw new ErrorWithStatus({
								message: USERS_MESSAGES.USER_NOT_FOUND,
								status: HTTP_STATUS.NOT_FOUND
							})
						}
					}
				}
			}
		},
		['body']
	)
)

export const unfollowValidator = validate(
	checkSchema(
		{
			user_id: {
				custom: {
					options: async (value, { req }) => {
						if (!ObjectId.isValid(value)) {
							throw new ErrorWithStatus({
								message: USERS_MESSAGES.USER_NOT_FOUND,
								status: HTTP_STATUS.NOT_FOUND
							})
						}
						const followed_used = await databaseService.users.findOne({
							_id: new ObjectId(value)
						})
						if (followed_used === null) {
							throw new ErrorWithStatus({
								message: USERS_MESSAGES.USER_NOT_FOUND,
								status: HTTP_STATUS.NOT_FOUND
							})
						}
					}
				}
			}
		},
		['params']
	)
)

export const changePasswordValidator = validate(
	checkSchema(
		{
			oldPassword: {
				notEmpty: {
					errorMessage: USERS_MESSAGES.OLD_PASSWORD_IS_REQUIRED
				},
				isString: {
					errorMessage: USERS_MESSAGES.OLD_PASSWORD_MUST_BE_A_STRING
				},
				isLength: {
					options: {
						min: 8,
						max: 50
					},
					errorMessage: USERS_MESSAGES.OLD_PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
				},
				trim: true,
				custom: {
					options: async (value: string, { req }) => {
						const { user_id } = (req as Request).decoded_authorization as TokenPayLoad
						const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
						if (!user) {
							throw new ErrorWithStatus({
								message: USERS_MESSAGES.USER_NOT_FOUND,
								status: HTTP_STATUS.NOT_FOUND
							})
						}
						const { password } = user
						const isMatch = hashPassword(value) === password
						if (!isMatch) {
							throw new ErrorWithStatus({
								message: USERS_MESSAGES.OLD_PASSWORD_NOT_MATCH,
								status: HTTP_STATUS.UNAUTHORIZED
							})
						}
					}
				}
			},
			password: {
				notEmpty: {
					errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
				},
				isString: {
					errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
				},
				isLength: {
					options: {
						min: 8,
						max: 50
					},
					errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
				},
				trim: true,
				isStrongPassword: {
					options: {
						minLength: 8,
						minLowercase: 1,
						minSymbols: 1,
						minUppercase: 1
					},
					errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
				}
			},
			confirmPassword: {
				notEmpty: {
					errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
				},
				isString: {
					errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
				},
				isLength: {
					options: {
						min: 8,
						max: 50
					},
					errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
				},
				trim: true,
				isStrongPassword: {
					options: {
						minLength: 8,
						minLowercase: 1,
						minSymbols: 1,
						minUppercase: 1
					},
					errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
				},
				custom: {
					options: (value, { req }) => {
						if (value !== req.body.password) {
							throw new Error('Confirm password phai giong voi pass word')
						}
						return true
					},
					errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_NOT_DIFFERENT_FROM_PASSWORD
				}
			}
		},
		['body']
	)
)

export const isUserLoggedInValidator = (middleware: (req: Request, res: Response, next: NextFunction) => void) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (req.headers.authorization) {
			return middleware(req, res, next)
		}
		next()
	}
}
