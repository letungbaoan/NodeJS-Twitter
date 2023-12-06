import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enums'

export interface registerReqBody {
	name: string
	email: string
	password: string
	confirmPassword: string
	date_of_birth: string
}

export interface LogoutReqBody {
	refresh_token: string
}

export interface TokenPayLoad extends JwtPayload {
	user_id: string
	token_type: TokenType
}
