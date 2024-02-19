import { Router } from 'express'
import { createTweetController, getTweetChildrenController, getTweetController } from '~/controllers/tweets.controllers'
import {
	audienceValidator,
	createTweetValidator,
	getTweetChildrenValidator,
	tweetIdValidator
} from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapResquestHandler } from '~/utils/handlers'

const tweetsRouter = Router()

tweetsRouter.post(
	'/',
	accessTokenValidator,
	verifiedUserValidator,
	createTweetValidator,
	wrapResquestHandler(createTweetController)
)

tweetsRouter.get(
	'/:tweet_id',
	tweetIdValidator,
	isUserLoggedInValidator(accessTokenValidator),
	isUserLoggedInValidator(verifiedUserValidator),
	audienceValidator,
	wrapResquestHandler(getTweetController)
)

tweetsRouter.get(
	'/:tweet_id/children',
	tweetIdValidator,
	getTweetChildrenValidator,
	isUserLoggedInValidator(accessTokenValidator),
	isUserLoggedInValidator(verifiedUserValidator),
	audienceValidator,
	wrapResquestHandler(getTweetChildrenController)
)

export default tweetsRouter
