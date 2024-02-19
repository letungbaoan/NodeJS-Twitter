import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetType } from '~/constants/enums'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { TweetReqBody } from '~/models/request/Tweet.request'
import { TokenPayLoad } from '~/models/request/User.requests'
import tweetsService from '~/services/tweets.services'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetReqBody>, res: Response) => {
	const { user_id } = req.decoded_authorization as TokenPayLoad
	const result = await tweetsService.createTweet(req.body, user_id)
	return res.json({
		message: TWEETS_MESSAGES.CREATE_TWEET_SUCCESSFULLY,
		result
	})
}

export const getTweetController = async (req: Request, res: Response) => {
	const result = await tweetsService.increaseView(req.params.tweet_id, req.decoded_authorization?.user_id)
	const tweet = {
		...req.tweet,
		guest_views: result.guest_views,
		user_views: result.user_views,
		updated_at: result.updated_at
	}
	return res.json({
		message: TWEETS_MESSAGES.GET_TWEET_SUCCESSFULLY,
		result: tweet
	})
}

export const getTweetChildrenController = async (req: Request, res: Response) => {
	const tweet_type = Number(req.query.tweet_type) as TweetType
	const limit = Number(req.query.limit)
	const page = Number(req.query.page)
	const user_id = req.decoded_authorization?.user_id
	const { tweet_childrens, total } = await tweetsService.getTweetChildren({
		tweet_id: req.params.tweet_id,
		tweet_type,
		limit,
		page,
        user_id
	})
	return res.json({
		message: TWEETS_MESSAGES.GET_TWEET_CHILDREN_SUCCESSFULLY,
		result: {
			tweet_childrens,
			tweet_type,
			limit,
			page,
			total_page: Math.ceil(total / limit)
		}
	})
}
