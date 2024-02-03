import { Router } from 'express'
import { uploadImageController, uploadVideoController } from '~/controllers/medias.controller'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapResquestHandler } from '~/utils/handlers'
const mediasRouter = Router()

mediasRouter.post(
	'/upload-image',
	accessTokenValidator,
	verifiedUserValidator,
	wrapResquestHandler(uploadImageController)
)

mediasRouter.post(
	'/upload-video',
	accessTokenValidator,
	verifiedUserValidator,
	wrapResquestHandler(uploadVideoController)
)

export default mediasRouter
