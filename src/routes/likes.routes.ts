import { Router } from 'express'
import { likeTweetController, unlikeTweetController } from '~/controllers/likes.controllers'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapResquestHandler } from '~/utils/handlers'

const likeRouter = Router()

likeRouter.post(
	'/',
	accessTokenValidator,
	verifiedUserValidator,
	tweetIdValidator,
	wrapResquestHandler(likeTweetController)
)

likeRouter.delete(
	'/tweets/:tweet_id',
	accessTokenValidator,
	verifiedUserValidator,
	tweetIdValidator,
	wrapResquestHandler(unlikeTweetController)
)

export default likeRouter
