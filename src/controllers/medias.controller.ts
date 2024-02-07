import { Request, Response, NextFunction } from 'express'
import { UPLOAD_IMG_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { MEDIA_MESSAGE } from '~/constants/messages'
import mediaService from '~/services/media.services'
import { handleUploadImage } from '~/utils/file'
import path from 'path'
import HTTP_STATUS from '~/constants/httpStatus'
import fs from 'fs'

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

export const uploadVideoHLSController = async (req: Request, res: Response, next: NextFunction) => {
	const url = await mediaService.uploadVideoHLS(req)
	return res.json({
		message: MEDIA_MESSAGE.UPLOAD_SUCCESSFULLY,
		result: url
	})
}

export const serveVideoStreamController = async (req: Request, res: Response, next: NextFunction) => {
	const mime = (await import('mime')).default
	const range = req.headers.range
	if (!range) {
		return res.status(HTTP_STATUS.BAD_REQUEST).send('Requires Range header')
	}
	const { name } = req.params
	const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)
	const videoSize = fs.statSync(videoPath).size
	const chunkSize = 10 ** 6
	const start = Number(range.replace(/\D/g, ''))
	const end = Math.min(start + chunkSize, videoSize - 1)
	const contentLength = end - start + 1
	const contentType = mime.getType(videoPath) || 'video/*'
	const headers = {
		'Content-Range': `bytes ${start}-${end}/${videoSize}`,
		'Accept-Ranges': 'bytes',
		'Content-Length': contentLength,
		'Content-Type': contentType
	}
	res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)
	const videoStreams = fs.createReadStream(videoPath, { start, end })
	videoStreams.pipe(res)
}
