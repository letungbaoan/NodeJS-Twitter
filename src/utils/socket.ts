import { ObjectId } from 'mongodb'
import { verifyAccessToken } from '~/utils/common'
import { TokenPayLoad } from '~/models/request/User.requests'
import { UserVerifyStatus } from '~/constants/enums'
import { ErrorWithStatus } from '~/models/Errors'
import { USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import { Server } from 'socket.io'
import Conversation from '~/models/schemas/Conversation.schema'
import databaseService from '~/services/database.service'
import { Server as ServerHttp } from 'http'

const initSocket = (httpServer: ServerHttp) => {
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

	io.use(async (socket, next) => {
		const { Authorization } = socket.handshake.auth
		const access_token = Authorization?.split(' ')[1]
		try {
			const decoded_authorization = await verifyAccessToken(access_token)
			const { verify } = decoded_authorization as TokenPayLoad
			if (verify !== UserVerifyStatus.Verified) {
				throw new ErrorWithStatus({
					message: USERS_MESSAGES.USER_NOT_VERIFIED,
					status: HTTP_STATUS.FORBIDDEN
				})
			}
			socket.handshake.auth.decoded_authorization = decoded_authorization as TokenPayLoad
			socket.handshake.auth.access_token = access_token
			next()
		} catch (error) {
			next({
				message: 'Unauthorized',
				name: 'UnauthorizedError',
				data: error
			})
		}
	})
	io.on('connection', (socket) => {
		const { user_id } = socket.handshake.auth.decoded_authorization as TokenPayLoad
		users[user_id] = {
			socket_id: socket.id
		}

		socket.use(async (packet, next) => {
			const { access_token } = socket.handshake.auth
			try {
				await verifyAccessToken(access_token)
				next()
			} catch (error) {
				next(new Error('Unauthorized'))
			}
		})

		socket.on('error', (error) => {
			if (error.message === 'Unauthorized') {
				socket.disconnect()
			}
		})

		socket.on('send_message', async (data) => {
			const { receiver_id, sender_id, content } = data.payload
			const receiver_socket_id = users[receiver_id]?.socket_id
			const conversation = new Conversation({
				sender_id: new ObjectId(sender_id),
				receiver_id: new ObjectId(receiver_id),
				content
			})
			const result = await databaseService.conversations.insertOne(conversation)
			conversation._id = result.insertedId
			if (receiver_socket_id) {
				socket.to(receiver_socket_id).emit('receive_message', {
					payload: conversation
				})
			}
		})
		socket.on('disconnect', () => {
			delete users[user_id]
		})
	})
}

export default initSocket
