import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '../Other'

export interface TweetReqBody {
	type: TweetType
	audience: TweetAudience
	content: string
	parent_id: null | string
	hashtags: string[]
	mentions: string[]
	medias: Media[]
}