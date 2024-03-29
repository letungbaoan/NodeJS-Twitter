import { Router } from 'express'
import { bookmarkTweetController, unbookmarkTweetController } from '~/controllers/bookmarks.controllers'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapResquestHandler } from '~/utils/handlers'

const bookmarkRouter = Router()

bookmarkRouter.post(
	'/',
	accessTokenValidator,
	verifiedUserValidator,
	tweetIdValidator,
	wrapResquestHandler(bookmarkTweetController)
)

bookmarkRouter.delete(
	'/tweets/:tweet_id',
	accessTokenValidator,
	verifiedUserValidator,
	tweetIdValidator,
	wrapResquestHandler(unbookmarkTweetController)
)

export default bookmarkRouter
