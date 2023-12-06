import { error } from 'console'
import { ErrorWithStatus } from 'src/models/Errors'
import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import usersService from '~/services/users.services'
import { validate } from '~/utils/validation'
import { USERS_MESSAGES } from '~/constants/messages'
import databaseService from '~/services/database.service'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { decode } from 'punycode'
import HTTP_STATUS from '~/constants/httpStatus'
import exp from 'constants'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { TokenPayLoad } from '~/models/request/User.requests'

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
				notEmpty: {
					errorMessage: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
				},
				custom: {
					options: async (value: string, { req }) => {
						const access_token = value.split(' ')[1]
						if (!access_token) {
							throw new ErrorWithStatus({
								message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
								status: HTTP_STATUS.UNAUTHORIZED
							})
						}
						try {
							const decoded_authorization = await verifyToken({ token: access_token })
							;(req as TokenPayLoad).decoded_authorization = decoded_authorization
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
		['headers']
	)
)

export const refreshTokenValidator = validate(
	checkSchema(
		{
			refresh_token: {
				notEmpty: {
					errorMessage: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED
				},
				custom: {
					options: async (value: string, { req }) => {
						try {
							const [decoded_refresh_token, refresh_token] = await Promise.all([
								verifyToken({ token: value }),
								databaseService.refreshTokens.findOne({ token: value })
							])
							if (refresh_token === null) {
								throw new ErrorWithStatus({
									message: USERS_MESSAGES.REFRESH_TOKEN_IS_USED_OR_NOT_EXIST,
									status: HTTP_STATUS.UNAUTHORIZED
								})
							}
							;(req as TokenPayLoad).decoded_refresh_token = decoded_refresh_token
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
