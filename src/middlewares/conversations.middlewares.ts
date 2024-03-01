import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.service'
import { validate } from '~/utils/validation'

export const getConversationsValidator = validate(
	checkSchema(
		{
			receiver_id: {
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
