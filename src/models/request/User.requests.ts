import exp from 'constants'
import { ExpressValidator } from 'express-validator'
import { JwtPayload } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { ParamsDictionary } from 'express-serve-static-core'
export interface UpdateMeReqBody {
	name?: string
	date_of_birth?: string
	bio?: string
	location?: string
	website?: string
	username?: string
	avatar?: string
	cover_photo?: string
}

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

export interface GetProfileReqParams {
	username: string
}

export interface FollowReqBody {
	followed_user_id: string
}

export interface UnfollowReqParams extends ParamsDictionary {
	user_id: string
}

export interface ChangePasswordReqBody {
	oldPassword: string
	password: string
	confirmPassword: string
}
