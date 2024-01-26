import fs from 'fs'
import path from 'path'
export const initFolder = () => {
	const folderPath = path.resolve('uploads')
	if (!fs.existsSync(folderPath)) {
		fs.mkdirSync(folderPath, {
			recursive: true
		})
	}
}
