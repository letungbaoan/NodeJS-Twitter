import { Router } from 'express'
import { bookmarkTweetController } from '~/controllers/bookmarks.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapResquestHandler } from '~/utils/handlers'

const bookmarkRouter = Router()

bookmarkRouter.post('/', accessTokenValidator, verifiedUserValidator, wrapResquestHandler(bookmarkTweetController))

export default bookmarkRouter
