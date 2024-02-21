import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.service'
import { defaultErrorHandler } from './middlewares/error.middewares'
import mediasRouter from './routes/medias.routes'
import { initTempFolder } from './utils/file'
import { config } from 'dotenv'
import argv from 'minimist'
import { UPLOAD_IMG_DIR, UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
import cors from 'cors'
import tweetsRouter from './routes/tweets.routes'
import bookmarkRouter from './routes/bookmarks.routes'
import likeRouter from './routes/likes.routes'
import searchRouter from './routes/search.routes'
//import '~/utils/fake'
const options = argv(process.argv.slice(2))
config()

const app = express()
app.use(cors())
const port = process.env.PORT
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
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarkRouter)
app.use('/likes', likeRouter)
app.use('/search', searchRouter)

app.use(defaultErrorHandler)
app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})
