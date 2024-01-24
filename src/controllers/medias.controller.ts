import { Request, Response, NextFunction } from 'express'
import formidable from 'formidable'
import path from 'path'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
	const form = formidable({
		uploadDir: path.resolve('uploads'),
		maxFiles: 1,
		keepExtensions: true,
		maxFileSize: 500 * 1024
	})
	form.parse(req, (err, fields, files) => {
		if (err) {
			throw err
		}
		return res.json({
			message: 'Success'
		})
	})
}
