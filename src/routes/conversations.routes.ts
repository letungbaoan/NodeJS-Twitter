import { Router } from 'express'
import { getConversationsController } from '~/controllers/conversations.controllers'
import { getConversationsValidator } from '~/middlewares/conversations.middlewares'
import { paginationValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapResquestHandler } from '~/utils/handlers'

const conversationsRouter = Router()

conversationsRouter.get(
	'/receivers/:receiver_id',
	accessTokenValidator,
	verifiedUserValidator,
	getConversationsValidator,
	paginationValidator,
	wrapResquestHandler(getConversationsController)
)

export default conversationsRouter
