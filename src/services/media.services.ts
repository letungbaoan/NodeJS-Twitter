import { getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { Request } from 'express'
import sharp from 'sharp'
import { UPLOAD_IMG_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
import fsPromise from 'fs/promises'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { MediaType } from '~/constants/enums'
import { Media } from '~/models/Other'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
config()
class MediaService {
	async uploadImage(req: Request) {
		const files = await handleUploadImage(req)
		const result: Media[] = await Promise.all(
			files.map(async (file) => {
				const newName = getNameFromFullName(file.newFilename)
				const newPath = path.resolve(UPLOAD_IMG_DIR, `${newName}.jpg`)
				sharp.cache(false)
				await sharp(file.filepath).jpeg().toFile(newPath)
				fs.unlinkSync(file.filepath)
				return {
					url: isProduction
						? `${process.env.HOST}/static/image/${newName}.jpg`
						: `http://localhost:${process.env.PORT}/static/image/${newName}.jpg`,
					type: MediaType.Image
				}
			})
		)
		return result
	}

	async uploadVideo(req: Request) {
		const files = await handleUploadVideo(req)
		const result: Media[] = await Promise.all(
			files.map(async (file) => {
				return {
					url: isProduction
						? `${process.env.HOST}/static/video/${file.newFilename}`
						: `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
					type: MediaType.Video
				}
			})
		)
		return result
	}

	async uploadVideoHLS(req: Request) {
		const files = await handleUploadVideo(req)

		const result: Media[] = await Promise.all(
			files.map(async (file) => {
				await encodeHLSWithMultipleVideoStreams(file.filepath)
				const newName = getNameFromFullName(file.newFilename)
				await fsPromise.unlink(file.filepath)
				return {
					url: isProduction
						? `${process.env.HOST}/static/video-hls/${newName}`
						: `http://localhost:${process.env.PORT}/static/video-hls/${newName}`,
					type: MediaType.HLS
				}
			})
		)
		return result
	}
}

const mediaService = new MediaService()

export default mediaService
