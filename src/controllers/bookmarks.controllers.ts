import { TokenPayLoad } from '~/models/request/User.requests'
import { BookmarkTweetReqBody } from '~/models/request/bookmark.requests'
import bookmarkService from '~/services/bookmarks.services'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BOOKMARKS_MESSAGES } from '~/constants/messages'

export const bookmarkTweetController = async (
	req: Request<ParamsDictionary, any, BookmarkTweetReqBody>,
	res: Response
) => {
	const { user_id } = req.decoded_authorization as TokenPayLoad
	const result = await bookmarkService.bookmarkTweet(user_id, req.body.tweet_id)
	return res.json({
		message: BOOKMARKS_MESSAGES.CREATE_BOOKMARK_SUCCESSFULLY,
		result
	})
}

export const unbookmarkTweetController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
	const { user_id } = req.decoded_authorization as TokenPayLoad
	const result = await bookmarkService.unbookmarkTweet(user_id, req.params.tweet_id)
	return res.json({
		message: BOOKMARKS_MESSAGES.DELETE_BOOKMARK_SUCCESSFULLY,
		result
	})
}
