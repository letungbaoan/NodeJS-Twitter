import fs from 'fs'
import path, { resolve } from 'path'
import formidable from 'formidable'
import { Request } from 'express'
export const initFolder = () => {
	const folderPath = path.resolve('uploads/images')
	if (!fs.existsSync(folderPath)) {
		fs.mkdirSync(folderPath, {
			recursive: true
		})
	}
}

export const handleUploadSingleImage = async (req: Request) => {
	const form = formidable({
		uploadDir: path.resolve('uploads/images'),
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
	return new Promise((resolve, reject) => {
		form.parse(req, (err, fields, files) => {
			if (err) {
				return reject(err)
			}
			// eslint-disable-next-line no-extra-boolean-cast
			if (!Boolean(files.image)) {
				return reject(new Error('File is empty'))
			}
			resolve(files)
		})
	})
}
