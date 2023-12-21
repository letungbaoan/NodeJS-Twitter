import { ExpressValidator } from 'express-validator'
import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/constants/enums'

export interface registerReqBody {
	name: string
	email: string
	password: string
	confirmPassword: string
	date_of_birth: string
}

export interface LoginReqBody {
	email: string
	password: string
}
export interface LogoutReqBody {
	refresh_token: string
}

export interface VerifyEmailReqBody {
	email_verify_token: string
}

export interface RefreshTokenReqBody {
	refresh_token: string
}

export interface ForgotPasswordReqBody {
	email: string
}

export interface verifyForgotPasswordTokenReqBody {
	forgot_password_token: string
}
export interface TokenPayLoad extends JwtPayload {
	user_id: string
	token_type: TokenType
	verify?: UserVerifyStatus
}

export interface ResetPasswordReqBody {
	forgot_password_token: string
	password: string
	confirm_password: string
}


