import fs from 'fs'
import path, { resolve } from 'path'
import formidable, { File } from 'formidable'
import { Request } from 'express'
import { TEMP_UPLOAD_DIR } from '~/constants/dir'

export const initTempFolder = () => {
	if (!fs.existsSync(TEMP_UPLOAD_DIR)) {
		fs.mkdirSync(TEMP_UPLOAD_DIR, {
			recursive: true
		})
	}
}

export const handleUploadImage = async (req: Request) => {
	const form = formidable({
		uploadDir: TEMP_UPLOAD_DIR,
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

export const getNameFromFullName = (fullname: string) => {
	const nameArr = fullname.split('.')
	nameArr.pop()
	return nameArr.join('')
}
