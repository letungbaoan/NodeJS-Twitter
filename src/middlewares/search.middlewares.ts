import { checkSchema } from 'express-validator'
import { MediaTypeQuery, PeopleFollowing } from '~/constants/enums'
import { validate } from '~/utils/validation'

export const searchValidator = validate(
	checkSchema(
		{
			content: {
				isString: true,
				errorMessage: 'Content must be string'
			},
			media_type: {
				optional: true,
				isIn: {
					options: [Object.values(MediaTypeQuery)]
				},
				errorMessage: `Meida type must be one of ${Object.values(MediaTypeQuery).join(', ')}`
			},
			people_following: {
				optional: true,
				isIn: {
					options: [Object.values(PeopleFollowing)],
					errorMessage: 'People following must be 0 or 1'
				}
			}
		},
		['query']
	)
)
