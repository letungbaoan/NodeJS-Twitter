export const USERS_MESSAGES = {
	VALIDATION_ERROR: 'Validation error',
	NAME_IS_REQUIRED: 'Name is required',
	NAME_MUST_BE_A_STRING: 'Name must be a string',
	NAME_LENGTH_MUST_BE_FROM_5_TO_50: 'Name length must be from 5 to 50',
	EMAIL_ALREADY_EXISTS: 'Email already exists',
	EMAIL_MUST_BE_A_STRING: 'Email must be a string',
	EMAIL_IS_REQUIRED: 'Email is required',
	EMAIL_IS_INVALID: 'Email is invalid',
	EMAIL_LENGTH_MUST_BE_FROM_8_TO_50: 'Email length must be from 8 to 50',
	PASSWORD_IS_REQUIRED: 'Password is required',
	PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
	PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50: 'Password length must be from 8 to 50',
	PASSWORD_MUST_BE_STRONG:
		'Password must be 8-50 characters long and contains at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 symbol',
	CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
	CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Confirm password must be a string',
	CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50: 'Confirm password length must be from 8 to 50',
	CONFIRM_PASSWORD_MUST_BE_STRONG:
		'Confirm password must be 8-50 characters long and contains at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 symbol',
	CONFIRM_PASSWORD_MUST_BE_NOT_DIFFERENT_FROM_PASSWORD: 'Confirm password must be not different from password',
	DATE_OF_BIRTH_IS_REQUIRED: 'Date of birth is required',
	DATE_OF_BIRTH_MUST_BE_ISO8601: 'Date of birth must be ISO8601',
	EMAIL_OR_PASSWORD_IS_INCORECT: 'Email or password is incorrect',
	LOGIN_SUCCESS: 'Login success',
	REGISTER_SUCCESS: 'Register success',
	ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
	ACCESS_TOKEN_IS_INVALID: 'Access token is invalid',
	REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
	REFRESH_TOKEN_IS_INVALID: 'Refresh token is invalid',
	REFRESH_TOKEN_IS_USED_OR_NOT_EXIST: 'Refresh token is used or not exist',
	LOGOUT_SUCCESS: 'Logout success',
	EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
	USER_NOT_FOUND: 'User not found',
	EMAIL_ALREADY_VERIFIED: 'Email already verified',
	EMAIL_VERIFY_SUCCESSED: 'Email verify successed',
	RESEND_EMAIL_VERIFY_SUCCESSED: 'Resend email verify success',
	CHECK_EMAIL_TO_RESET_PASSWORD: 'Check email to reset password',
	FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
	VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS: 'Verify forgot password token success',
	FORGOT_PASSWORD_TOKEN_IS_INVALID: 'Forgot password token is invalid',
	RESET_PASSWORD_SUCCESS: 'Reset password success',
	GET_ME_SUCCESS: 'Get me success',
	USER_NOT_VERIFIED: 'User not verified',
	UPDATE_ME_SUCCESS: 'Update me success',
	BIO_MUST_BE_STRING: 'Bio must be a string',
	DATE_OF_BIRTH_MUST_BE_STRING: 'Date of birth must be a string',
	BIO_LENGTH_MUST_BE_FROM_1_TO_200: 'Bio length must be from 1 to 200',
	LOCATION_LENGTH_MUST_BE_FROM_1_TO_200: 'Location length must be from 1 to 200',
	LOCATION_MUST_BE_STRING: 'Location must be a string',
	WEBSITE_MUST_BE_STRING: 'Website birth must be a string',
	USERNAME_MUST_BE_STRING: 'Username must be a string',
	AVATAR_MUST_BE_STRING: 'Avatar must be a string',
	COVER_PHOTO_MUST_BE_STRING: 'Cover photo must be a string',
	USERNAME_LENGTH_MUST_BE_FROM_5_TO_50: 'Username length must be from 5 to 50',
	WEBSITE_LENGTH_MUST_BE_FROM_1_TO_200: 'Website length must be from 1 to 200',
	AVATAR_LENGTH_MUST_BE_FROM_1_TO_200: 'Avatar length must be from 1 to 200',
	COVER_PHOTO_LENGTH_MUST_BE_FROM_1_TO_200: 'Cover photo length must be from 1 to 200',
	GET_PROFILE_SUCCESS: 'Get profile success',
	FOLLOW_SUCCESS: 'Follow success',
	ALREADY_FOLLOWED: 'Already followed',
	USERNAME_IS_REQUIRED: 'Username is required',
	USERNAME_IS_INVALID: 'Username is invalid',
	USERNAME_ALREADY_USED: 'Username already used',
	USERNAME_LENGTH_MUST_BE_FROM_4_TO_15: 'Username length must be from 4 to 15 characters',
	ALREADY_UNFOLLOWED: 'Already unfollowed',
	UNFOLLOW_SUCCESS: 'Unfollow success',
	OLD_PASSWORD_IS_REQUIRED: 'Old password is required',
	OLD_PASSWORD_MUST_BE_A_STRING: 'Old password must be a string',
	OLD_PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50: 'Old password length must be from 8 to 50',
	OLD_PASSWORD_NOT_MATCH: 'Old password not match',
	CHANGE_PASSWORD_SUCCESS: 'Change password success',
	EMAIL_NOT_VERIFIED: 'Email not verified',
	REFRESH_TOKEN_SUCCESS: 'Refresh token success'
} as const

export const MEDIA_MESSAGES = {
	UPLOAD_SUCCESSFULLY: 'Upload successfully',
	GET_STATUS_SUCCESS: 'Get status success'
} as const

export const TWEETS_MESSAGES = {
	INVALID_TYPE: 'Invalid type of tweet',
	INVALID_AUDIENCE: 'Invalid audience',
	PARENT_ID_MUST_BE_A_VALID_TWEET_ID: 'Parent id must be a valid tweet id',
	PARENT_ID_MUST_BE_NULL: 'Parent id must be null',
	CONTENT_MUST_BE_A_NON_EMPTY_STRING: 'Content must be a non empty string',
	CONTENT_MUST_BE_A_EMPTY_STRING: 'Content must be a empty string',
	HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING: 'Hashtags must be an array of string',
	MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID: 'Mentions must be an array of user id',
	MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT: 'Medias must be an array of media object',
	CREATE_TWEET_SUCCESSFULLY: 'Create tweet successfully',
	GET_TWEET_SUCCESSFULLY: 'Get tweet successfully',
	INVALID_TWEET_ID: 'Invalid tweet id',
	TWEET_NOT_FOUND: 'Tweet not found',
	TWEET_IS_NOT_PUBLIC: 'Tweet is not public',
	GET_NEW_FEEDS_SUCCESSFULLY: 'Get new feeds successfully',
	GET_TWEET_CHILDREN_SUCCESSFULLY: 'Get tweet children successfully'
} as const

export const BOOKMARKS_MESSAGES = {
	CREATE_BOOKMARK_SUCCESSFULLY: 'Create bookmark successfully',
	DELETE_BOOKMARK_SUCCESSFULLY: 'Delete bookmark successfully'
} as const

export const LIKES_MESSAGES = {
	LIKE_TWEET_SUCCESSFULLY: 'Like tweet successfully'
} as const

export const SEARCH_MESSAGES = {
	SEARCH_SUCCESSFULLY: 'Search successfully'
} as const

export const CONVERSATIONS_MESSAGES = {
	GET_CONVERSATIONS_SUCCESSFULLY: 'Get conversations successfully'
} as const
