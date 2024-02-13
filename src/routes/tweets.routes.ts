import { Router } from 'express'
import { createTweetController, getTweetController } from '~/controllers/tweets.controllers'
import { createTweetValidator, tweetIdValidator } from '~/middlewares/tweets.middlewares'
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
	wrapResquestHandler(getTweetController)
)

export default tweetsRouter
