import { Router } from 'express'
import {
	createTweetController,
	getNewFeedsController,
	getTweetChildrenController,
	getTweetController
} from '~/controllers/tweets.controllers'
import {
	audienceValidator,
	createTweetValidator,
	getTweetChildrenValidator,
	paginationValidator,
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
	paginationValidator,
	isUserLoggedInValidator(accessTokenValidator),
	isUserLoggedInValidator(verifiedUserValidator),
	audienceValidator,
	wrapResquestHandler(getTweetChildrenController)
)

tweetsRouter.get(
	'/',
	paginationValidator,
	accessTokenValidator,
	verifiedUserValidator,
	wrapResquestHandler(getNewFeedsController)
)

export default tweetsRouter
