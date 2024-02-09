import { MongoClient, Db, Collection } from 'mongodb'
import dotenv from 'dotenv'
import User from 'src/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schemas'
import Follower from '~/models/schemas/Follower.schema'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
dotenv.config()

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.ufcaelj.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
	private client: MongoClient
	private db: Db
	constructor() {
		this.client = new MongoClient(uri)
		this.db = this.client.db(process.env.DB_NAME)
	}

	async connect() {
		try {
			// Send a ping to confirm a successful connection
			await this.db.command({ ping: 1 })
			console.log('Pinged your deployment. You successfully connected to MongoDB!')
		} catch (error) {
			console.log('Error:', error)
			throw error
		}
	}

	async indexUsers() {
		const exists = await this.users.indexExists(['email_1_password_1', 'email_1', 'username_1'])
		if (!exists) {
			this.users.createIndex({ email: 1, password: 1 })
			this.users.createIndex({ email: 1 }, { unique: true })
			this.users.createIndex({ username: 1 }, { unique: true })
		}
	}

	async indexFollowers() {
		const exists = await this.followers.indexExists(['user_id_1_followed_user_id_1'])
		if (!exists) {
			this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
		}
	}

	async indexRefreshTokens() {
		const exists = await this.refreshTokens.indexExists(['exp_1', 'token_1'])
		if (!exists) {
			this.refreshTokens.createIndex({ token: 1 })
			this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
		}
	}

	// async indexVideoStatus() {
	// 	const exists = await this.videoStatus.indexExists(['name_1'])
	// 	if (!exists) {
	// 		this.videoStatus.createIndex({ name: 1 })
	// 	}
	// }

	get users(): Collection<User> {
		return this.db.collection(process.env.DB_USERS_COLLECTION as string)
	}

	get refreshTokens(): Collection<RefreshToken> {
		return this.db.collection(process.env.DB_REFRESH_TOKEN_COLLECTION as string)
	}

	get followers(): Collection<Follower> {
		return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string)
	}

	get videoStatus(): Collection<VideoStatus> {
		return this.db.collection(process.env.DB_VIDEO_STATUS_COLLECTION as string)
	}
}

const databaseService = new DatabaseService()
export default databaseService
