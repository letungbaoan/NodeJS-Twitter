import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType } from '~/constants/enums'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { numberEnumToArray } from '~/utils/common'
import { validate } from '~/utils/validation'

const tweetTypes = numberEnumToArray(TweetType)
const tweetAudiences = numberEnumToArray(TweetAudience)

export const createTweetValidator = validate(
	checkSchema({
		type: {
			isIn: {
				options: tweetTypes,
				errorMessage: TWEETS_MESSAGES.INVALID_TYPE
			}
		},
		audience: {
			isIn: {
				options: tweetAudiences,
				errorMessage: TWEETS_MESSAGES.INVALID_AUDIENCE
			}
		},
		parent_id: {
			custom: {
				options: (value, { req }) => {
					const type = req.body.type as TweetType
					if (
						[TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) &&
						!ObjectId.isValid(value)
					) {
						throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID)
					}
				}
			}
		}
	})
)
