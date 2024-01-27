import fs from 'fs'
import path, { resolve } from 'path'
import formidable, { File } from 'formidable'
import { Request } from 'express'
import { TEMP_IMG_FOLDER_DIR } from '~/constants/dir'

export const initTempFolder = () => {
	if (!fs.existsSync(TEMP_IMG_FOLDER_DIR)) {
		fs.mkdirSync(TEMP_IMG_FOLDER_DIR, {
			recursive: true
		})
	}
}

export const handleUploadSingleImage = async (req: Request) => {
	const form = formidable({
		uploadDir: TEMP_IMG_FOLDER_DIR,
		maxFiles: 1,
		keepExtensions: true,
		maxFileSize: 3000 * 1024,
		filter: function ({ name, originalFilename, mimetype }) {
			const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
			if (!valid) {
				form.emit('error' as any, new Error('File type is not valid') as any)
			}
			return valid
		}
	})
	return new Promise<File>((resolve, reject) => {
		form.parse(req, (err, fields, files) => {
			if (err) {
				return reject(err)
			}
			// eslint-disable-next-line no-extra-boolean-cast
			if (!Boolean(files.image)) {
				return reject(new Error('File is empty'))
			}
			resolve((files.image as File[])[0])
		})
	})
}

export const getNameFromFullName = (fullname: string) => {
	const nameArr = fullname.split('.')
	nameArr.pop()
	return nameArr.join('')
}
