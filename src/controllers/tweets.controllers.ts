import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
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