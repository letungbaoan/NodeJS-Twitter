import { Request } from 'express'
import User from './models/schemas/User.schema'
import { TokenExpiredError } from 'jsonwebtoken'
import { TokenPayLoad } from './models/request/User.requests'
import Tweet from './models/schemas/Tweet.schema'
declare module 'express' {
	interface Request {
		user?: User
		decoded_authorization?: TokenPayLoad
		decoded_refresh_token?: TokenPayLoad
		decoded_email_verify_token?: TokenPayLoad
		decoded_forgot_password_token?: TokenPayLoad
		decoded_reset_password?: TokenPayLoad
		tweet?: Tweet
	}
}
