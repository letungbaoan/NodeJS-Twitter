import Bookmark from '~/models/schemas/Bookmark.schema'
import databaseService from './database.service'
import { ObjectId } from 'mongodb'

class LikeService {
	async likeTweet(user_id: string, tweet_id: string) {
		const result = await databaseService.likes.findOneAndUpdate(
			{
				user_id: new ObjectId(user_id),
				tweet_id: new ObjectId(tweet_id)
			},
			{
				$setOnInsert: new Bookmark({
					user_id: new ObjectId(user_id),
					tweet_id: new ObjectId(tweet_id)
				})
			},
			{
				upsert: true,
				returnDocument: 'after'
			}
		)
		return result
	}

	async unlikeTweet(user_id: string, tweet_id: string) {
		const result = await databaseService.likes.findOneAndDelete({
			user_id: new ObjectId(user_id),
			tweet_id: new ObjectId(tweet_id)
		})
		return result
	}
}
const likeService = new LikeService()

export default likeService
