import { TokenPayLoad } from '~/models/request/User.requests'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BOOKMARKS_MESSAGES, LIKES_MESSAGES } from '~/constants/messages'
import { LikeTweetReqBody } from '~/models/request/like.requests'
import likeService from '~/services/likes.services'

export const likeTweetController = async (req: Request<ParamsDictionary, any, LikeTweetReqBody>, res: Response) => {
	const { user_id } = req.decoded_authorization as TokenPayLoad
	const result = await likeService.likeTweet(user_id, req.body.tweet_id)
	return res.json({
		message: LIKES_MESSAGES.LIKE_TWEET_SUCCESSFULLY,
		result
	})
}

export const unlikeTweetController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
	const { user_id } = req.decoded_authorization as TokenPayLoad
	const result = await likeService.unlikeTweet(user_id, req.params.tweet_id)
	return res.json({
		message: BOOKMARKS_MESSAGES.DELETE_BOOKMARK_SUCCESSFULLY,
		result
	})
}
