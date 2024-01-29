import { Request, Response, NextFunction } from 'express'
import { UPLOAD_DIR } from '~/constants/dir'
import { MEDIA_MESSAGE } from '~/constants/messages'
import mediaService from '~/services/media.services'
import { handleUploadImage } from '~/utils/file'
import path from 'path'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
	const url = await mediaService.handleUploadImage(req)
	return res.json({
		message: MEDIA_MESSAGE.UPLOAD_SUCCESSFULLY,
		result: url
	})
}

export const serveImageController = async (req: Request, res: Response, next: NextFunction) => {
	const { name } = req.params
	return res.sendFile(path.resolve(UPLOAD_DIR, name), (err) => {
		if (err) {
			return res.status(404).send('Image not found')
		}
	})
}
