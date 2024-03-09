import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.service'
import { defaultErrorHandler } from './middlewares/error.middewares'
import mediasRouter from './routes/medias.routes'
import { initTempFolder } from './utils/file'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
import cors, { CorsOptions } from 'cors'
import tweetsRouter from './routes/tweets.routes'
import bookmarkRouter from './routes/bookmarks.routes'
import likeRouter from './routes/likes.routes'
import searchRouter from './routes/search.routes'
import '~/utils/s3'
import { createServer } from 'http'
import conversationsRouter from './routes/conversations.routes'
import YAML from 'yaml'
import fs from 'fs'
import swaggerUi from 'swagger-ui-express'
import path from 'path'
import { envConfig, isProduction } from './constants/config'
import initSocket from './utils/socket'
import helmet from 'helmet'
const file = fs.readFileSync(path.resolve('twitter-swagger.yaml'), 'utf-8')

const swaggerDocument = YAML.parse(file)

const app = express()
const httpServer = createServer(app)
app.use(helmet())
const corsOptions: CorsOptions = {
	origin: isProduction ? envConfig.clientUrl : '*'
}
app.use(cors(corsOptions))
const port = envConfig.port
databaseService.connect().then(() => {
	databaseService.indexUsers()
	databaseService.indexFollowers()
	databaseService.indexRefreshTokens()
	databaseService.indexTweets()
	databaseService.indexVideoStatus()
})
initTempFolder()
app.use(express.json())
app.use('/users', usersRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarkRouter)
app.use('/likes', likeRouter)
app.use('/search', searchRouter)
app.use('/conversations', conversationsRouter)
app.use(defaultErrorHandler)
initSocket(httpServer)

httpServer.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})
