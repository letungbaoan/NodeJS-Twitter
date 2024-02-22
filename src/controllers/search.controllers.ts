import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { json } from 'stream/consumers'
import { PeopleFollowing } from '~/constants/enums'
import { SEARCH_MESSAGES } from '~/constants/messages'
import { SearchQuery } from '~/models/request/search.requests'
import searchService from '~/services/search.services'

export const searchController = async (req: Request<ParamsDictionary, any, any, SearchQuery>, res: Response) => {
	const limit = Number(req.query.limit)
	const page = Number(req.query.page)
	const content = req.query.content
	const result = await searchService.search({
		limit,
		page,
		content,
		media_type: req.query.media_type,
		people_following: req.query.people_following,
		user_id: req.decoded_authorization?.user_id as string
	})
	return res.json({
		message: SEARCH_MESSAGES.SEARCH_SUCCESSFULLY,
		result: {
			tweets: result.tweets,
			limit,
			page,
			total_page: Math.ceil(result.total / limit)
		}
	})
}
