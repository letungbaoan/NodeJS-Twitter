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

class Queue {
	items: string[]
	encoding: boolean
	constructor() {
		this.items = []
		this.encoding = false
	}
	enqueue(item: string) {
		this.items.push(item)
		this.processEncode()
	}
	async processEncode() {
		if (this.encoding) return
		if (this.items.length > 0) {
			this.encoding = true
			const videoPath = this.items[0]
			try {
				await encodeHLSWithMultipleVideoStreams(videoPath)
				this.items.shift()
				await fsPromise.unlink(videoPath)
				console.log('Encode video success')
			} catch (error) {
				console.log('Encode video error', error)
			}
			this.encoding = false
			this.processEncode()
		} else {
			console.log('Encode video queue is empty')
		}
	}
}

const queue = new Queue()
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
				const newName = getNameFromFullName(file.newFilename)
				queue.enqueue(file.filepath)
				return {
					url: isProduction
						? `${process.env.HOST}/static/video-hls/${newName}/master.m3u8`
						: `http://localhost:${process.env.PORT}/static/video-hls/${newName}/master.m3u8`,
					type: MediaType.HLS
				}
			})
		)
		return result
	}
}

const mediaService = new MediaService()

export default mediaService
