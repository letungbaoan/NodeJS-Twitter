import { Router } from 'express'
import { createTweetController } from '~/controllers/tweets.controllers'
import { createTweetValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapResquestHandler } from '~/utils/handlers'

const tweetsRouter = Router()

tweetsRouter.post(
	'/',
	accessTokenValidator,
	verifiedUserValidator,
	createTweetValidator,
	wrapResquestHandler(createTweetController)
)

export default tweetsRouter
