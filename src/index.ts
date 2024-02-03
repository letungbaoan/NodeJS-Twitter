import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.service'
import { defaultErrorHandler } from './middlewares/error.middewares'
import mediasRouter from './routes/medias.routes'
import { initTempFolder } from './utils/file'
import { config } from 'dotenv'
import argv from 'minimist'
import path from 'path'
import { UPLOAD_IMG_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
const options = argv(process.argv.slice(2))
config()

const app = express()
const port = process.env.PORT
databaseService.connect()
initTempFolder()

app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)

app.use(defaultErrorHandler)
app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})
