import { getNameFromFullName, handleUploadSingleImage } from '~/utils/file'
import { Request } from 'express'
import sharp from 'sharp'
import { IMG_FOLDER_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
class MediaService {
	async handleUploadSingleImage(req: Request) {
		const file = await handleUploadSingleImage(req)
		const newName = getNameFromFullName(file.newFilename)
		const newPath = path.resolve(IMG_FOLDER_DIR, `${newName}.jpg`)
		await sharp(file.filepath).jpeg().toFile(newPath)
		fs.unlinkSync(file.filepath)
		return `http://localhost:4000/uploads/images/${newName}.jpg`
	}
}

const mediaService = new MediaService()

export default mediaService
