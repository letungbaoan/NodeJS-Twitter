import { Router } from 'express'
import { uploadImageController, uploadVideoController, uploadVideoHLSController } from '~/controllers/medias.controller'
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

mediasRouter.post(
	'/upload-video-hls',
	accessTokenValidator,
	verifiedUserValidator,
	wrapResquestHandler(uploadVideoHLSController)
)

export default mediasRouter
