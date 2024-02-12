import { Router } from 'express'
import { bookmarkTweetController, unbookmarkTweetController } from '~/controllers/bookmarks.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapResquestHandler } from '~/utils/handlers'

const bookmarkRouter = Router()

bookmarkRouter.post('/', accessTokenValidator, verifiedUserValidator, wrapResquestHandler(bookmarkTweetController))

bookmarkRouter.delete(
	'/tweets/:tweet_id',
	accessTokenValidator,
	verifiedUserValidator,
	wrapResquestHandler(unbookmarkTweetController)
)

export default bookmarkRouter
