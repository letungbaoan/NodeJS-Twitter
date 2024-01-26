import { Router } from 'express'
import { uploadSingleImageController } from '~/controllers/medias.controller'
import { wrapResquestHandler } from '~/utils/handlers'
const mediasRouter = Router()

mediasRouter.post('/upload-image', wrapResquestHandler(uploadSingleImageController))

export default mediasRouter
