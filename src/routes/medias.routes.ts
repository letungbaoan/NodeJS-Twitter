import { Router } from 'express'
import { uploadImageController } from '~/controllers/medias.controller'
import { wrapResquestHandler } from '~/utils/handlers'
const mediasRouter = Router()

mediasRouter.post('/upload-image', wrapResquestHandler(uploadImageController))

export default mediasRouter
