import { ifError } from 'assert'
import { error } from 'console'
import { config } from 'dotenv'
import jwt, { Jwt, JwtPayload } from 'jsonwebtoken'
import { reject } from 'lodash'
import { resolve } from 'path'
import { TokenPayLoad } from '~/models/request/User.requests'
config()

export const signToken = ({
	payload,
	privateKey,
	options = {
		algorithm: 'HS256'
	}
}: {
	payload: string | Buffer | object
	privateKey: string
	options?: jwt.SignOptions
}) => {
	return new Promise<string>((resolve, reject) => {
		jwt.sign(payload, privateKey, options, (error, token) => {
			if (error) {
				throw reject(error)
			}
			resolve(token as string)
		})
	})
}

export const verifyToken = ({ token, secretOnPublicKey }: { token: string; secretOnPublicKey: string }) => {
	return new Promise<TokenPayLoad>((resolve, reject) => {
		jwt.verify(token, secretOnPublicKey, (error, decoded) => {
			if (error) {
				throw reject(error)
			}
			resolve(decoded as TokenPayLoad)
		})
	})
}
