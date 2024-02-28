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
import '~/utils/s3'
import { createServer } from 'http'
import { Server } from 'socket.io'
const options = argv(process.argv.slice(2))
config()

const app = express()
const httpServer = createServer(app)
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

const io = new Server(httpServer, {
	cors: {
		origin: 'http://localhost:3000'
	}
})

const users: {
	[key: string]: {
		socket_id: string
	}
} = {}

io.on('connection', (socket) => {
	console.log(`${socket.id} user connected`)
	const user_id = socket.handshake.auth._id
	users[user_id] = {
		socket_id: socket.id
	}
	console.log(users)
	socket.on('private message', (data) => {
		const receiver_socket_id = users[data.to]?.socket_id
		if (!receiver_socket_id) return
		socket.to(receiver_socket_id).emit('receive private message', {
			content: data.content,
			from: user_id
		})
	})
	socket.on('disconnect', () => {
		delete users[user_id]
		console.log(`${socket.id} disconnected`)
		console.log(users)
	})
})

httpServer.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})
