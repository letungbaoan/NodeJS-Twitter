import fs from 'fs'
import path, { resolve } from 'path'
import formidable, { File } from 'formidable'
import { Request } from 'express'
import { TEMP_UPLOAD_IMG_DIR, TEMP_UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'

export const initTempFolder = () => {
	if (!fs.existsSync(TEMP_UPLOAD_IMG_DIR)) {
		fs.mkdirSync(TEMP_UPLOAD_IMG_DIR, {
			recursive: true
		})
	}
	if (!fs.existsSync(TEMP_UPLOAD_VIDEO_DIR)) {
		fs.mkdirSync(TEMP_UPLOAD_VIDEO_DIR, {
			recursive: true
		})
	}
}

export const handleUploadImage = async (req: Request) => {
	const form = formidable({
		uploadDir: TEMP_UPLOAD_IMG_DIR,
		maxFiles: 4,
		keepExtensions: true,
		maxFileSize: 300 * 1024,
		maxTotalFileSize: 300 * 1024 * 4,
		filter: function ({ name, originalFilename, mimetype }) {
			const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
			if (!valid) {
				form.emit('error' as any, new Error('File type is not valid') as any)
			}
			return valid
		}
	})
	return new Promise<File[]>((resolve, reject) => {
		form.parse(req, (err, fields, files) => {
			if (err) {
				return reject(err)
			}
			// eslint-disable-next-line no-extra-boolean-cast
			if (!Boolean(files.image)) {
				return reject(new Error('File is empty'))
			}
			resolve(files.image as File[])
		})
	})
}

export const handleUploadVideo = async (req: Request) => {
	const form = formidable({
		uploadDir: UPLOAD_VIDEO_DIR,
		maxFiles: 1,
		maxFileSize: 50 * 1024 * 1024,
		filter: function ({ name, originalFilename, mimetype }) {
			const valid = name === 'video' && Boolean(mimetype?.includes('mp4') || mimetype?.includes('quicktime'))
			if (!valid) {
				form.emit('error' as any, new Error('File type is not valid') as any)
			}
			return valid
		}
	})
	return new Promise<File[]>((resolve, reject) => {
		form.parse(req, (err, fields, files) => {
			if (err) {
				return reject(err)
			}
			// eslint-disable-next-line no-extra-boolean-cast
			if (!Boolean(files.video)) {
				return reject(new Error('File is empty'))
			}
			const videos = files.video as File[]
			videos.forEach((video) => {
				const ext = getExtension(video.originalFilename as string)
				fs.renameSync(video.filepath, video.filepath + '.' + ext)
				video.newFilename = video.newFilename + '.' + ext
			})
			resolve(files.video as File[])
		})
	})
}

export const getNameFromFullName = (fullname: string) => {
	const nameArr = fullname.split('.')
	nameArr.pop()
	return nameArr.join('')
}

export const getExtension = (fullname: string) => {
	const nameArr = fullname.split('.')
	return nameArr[nameArr.length - 1]
}
