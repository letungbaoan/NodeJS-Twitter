import { getFiles, getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { Request } from 'express'
import sharp from 'sharp'
import { UPLOAD_IMG_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import path from 'path'
import { rimrafSync } from 'rimraf'
import fsPromise from 'fs/promises'
import { envConfig, isProduction } from '~/constants/config'
import { EncodingStatus, MediaType } from '~/constants/enums'
import { Media } from '~/models/Other'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import databaseService from './database.service'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import { uploadFileToS3 } from '~/utils/s3'
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'

class Queue {
	items: string[]
	encoding: boolean
	constructor() {
		this.items = []
		this.encoding = false
	}
	async enqueue(item: string) {
		this.items.push(item)
		const idName = getNameFromFullName(item.split('\\').pop() as string)

		await databaseService.videoStatus.insertOne(
			new VideoStatus({
				name: idName,
				status: EncodingStatus.Pending
			})
		)
		this.processEncode()
	}
	async processEncode() {
		if (this.encoding) return
		if (this.items.length > 0) {
			this.encoding = true
			const videoPath = this.items[0]
			const idName = getNameFromFullName(videoPath.split('\\').pop() as string)
			await databaseService.videoStatus.updateOne(
				{
					name: idName
				},
				{
					$set: {
						status: EncodingStatus.Processing
					},
					$currentDate: {
						updated_at: true
					}
				}
			)
			try {
				await encodeHLSWithMultipleVideoStreams(videoPath)
				this.items.shift()
				const idName = getNameFromFullName(videoPath.split('\\').pop() as string)
				const files = getFiles(path.resolve(UPLOAD_VIDEO_DIR, idName))
				await Promise.all(
					files.map((filepath) => {
						const filename = 'videos-hls/' + filepath.replace(path.resolve(UPLOAD_VIDEO_DIR) + '\\', '')
						return uploadFileToS3({
							filepath,
							filename,
							contentType: 'video/MP2T'
						})
					})
				)

				rimrafSync(path.resolve(UPLOAD_VIDEO_DIR, idName))

				await databaseService.videoStatus.updateOne(
					{
						name: idName
					},
					{
						$set: {
							status: EncodingStatus.Succeed
						},
						$currentDate: {
							updated_at: true
						}
					}
				)
				console.log('Encode video success')
			} catch (error) {
				const idName = getNameFromFullName(videoPath.split('\\').pop() as string)
				await databaseService.videoStatus
					.updateOne(
						{
							name: idName
						},
						{
							$set: {
								status: EncodingStatus.Failed
							},
							$currentDate: {
								updated_at: true
							}
						}
					)
					.catch((err) => {
						console.log('Update video status failed')
						console.log(err)
					})
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
				const newFullFileName = `${newName}.jpg`
				const newPath = path.resolve(UPLOAD_IMG_DIR, newFullFileName)
				sharp.cache(false)
				await sharp(file.filepath).jpeg().toFile(newPath)
				const s3Result = await uploadFileToS3({
					filename: 'images/' + newFullFileName,
					filepath: newPath,
					contentType: 'image/jpeg'
				})
				Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])
				return {
					url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
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
				const s3Result = await uploadFileToS3({
					filename: 'videos/' + file.newFilename,
					filepath: file.filepath,
					contentType: 'video/mp4'
				})
				fsPromise.unlink(file.filepath)
				return {
					url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
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
						? `${envConfig.host}/static/video-hls/${newName}/master.m3u8`
						: `http://localhost:${envConfig.port}/static/video-hls/${newName}/master.m3u8`,
					type: MediaType.HLS
				}
			})
		)
		return result
	}

	async getVideoStatus(id: string) {
		const data = await databaseService.videoStatus.findOne({
			name: id
		})
		return data
	}
}

const mediaService = new MediaService()

export default mediaService
