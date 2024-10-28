export enum UserVerifyStatus {
	Unverified,
	Verified,
	Banned
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

export enum PeopleFollowing {
	Anyone = '0',
	Following = '1'
}
