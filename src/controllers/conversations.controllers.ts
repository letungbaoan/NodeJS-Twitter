import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import conversationService from '~/services/conversations.services'
import { CONVERSATIONS_MESSAGES } from '~/constants/messages'
import { GetConversationsParams } from '~/models/request/conversations.requests'

export const getConversationsController = async (req: Request<GetConversationsParams>, res: Response) => {
	const { receiver_id } = req.params
	const limit = Number(req.query.limit)
	const page = Number(req.query.page)
	const sender_id = req.decoded_authorization?.user_id as string
	const result = await conversationService.getConversations({
		receiver_id,
		sender_id,
		limit,
		page
	})
	return res.json({
		result: {
			conversations: result.conversations,
			limit,
			page,
			total_page: Math.ceil(result.total / limit)
		},

		message: CONVERSATIONS_MESSAGES.GET_CONVERSATIONS_SUCCESSFULLY
	})
}
