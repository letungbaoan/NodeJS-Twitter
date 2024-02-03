import { Request, Response, NextFunction } from 'express'
import { UPLOAD_IMG_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { MEDIA_MESSAGE } from '~/constants/messages'
import mediaService from '~/services/media.services'
import { handleUploadImage } from '~/utils/file'
import path from 'path'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
	const url = await mediaService.uploadImage(req)
	return res.json({
		message: MEDIA_MESSAGE.UPLOAD_SUCCESSFULLY,
		result: url
	})
}

export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
	const { name } = req.params
	return res.sendFile(path.resolve(UPLOAD_IMG_DIR, name), (err) => {
		if (err) {
			res.status(404).send('Image not found')
		}
	})
}

export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
	const url = await mediaService.uploadVideo(req)
	return res.json({
		message: MEDIA_MESSAGE.UPLOAD_SUCCESSFULLY,
		result: url
	})
}

export const serveVideoController = (req: Request, res: Response, next: NextFunction) => {
	const { name } = req.params
	return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, name), (err) => {
		if (err) {
			res.status(404).send('Video not found')
		}
	})
}
