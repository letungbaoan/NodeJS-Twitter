export enum UserVerifyStatus {
	Unverified, // chưa xác thực email, mặc định = 0
	Verified, // đã xác thực email
	Banned // bị khóa
}

export enum TokenType {
	AccessToken,
	RefreshToken,
	ForgetPasswordToken,
	EmailVerifyToken
}

export enum MediaType {
	Image,
	Video,
	HLS
}

export enum EncodingStatus {
	Pending,
	Processing,
	Succeed,
	Failed
}

export enum TweetAudience {
	Everyone,
	TwitterCircle
}

export enum TweetType {
	Tweet,
	Retweet,
	Comment,
	QuoteTweet
}

export enum MediaTypeQuery {
	Image = 'image',
	Video = 'video'
}
