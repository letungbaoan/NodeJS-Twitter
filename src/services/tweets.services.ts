import { config } from 'dotenv'
import { TweetReqBody } from '~/models/request/Tweet.request'
import databaseService from './database.service'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'
import { TweetType } from '~/constants/enums'
import usersService from './users.services'
config()

class TweetsService {
	async checkAndCreateHashtags(hashtags: string[]) {
		const hashtagDocuments = await Promise.all(
			hashtags.map((hashtag) => {
				return databaseService.hashtags.findOneAndUpdate(
					{ name: hashtag },
					{
						$setOnInsert: new Hashtag({ name: hashtag })
					},
					{
						upsert: true,
						returnDocument: 'after'
					}
				)
			})
		)
		return hashtagDocuments.map((hashtag) => hashtag!._id)
	}

	async createTweet(body: TweetReqBody, user_id: string) {
		const hashtags = await this.checkAndCreateHashtags(body.hashtags)
		console.log(hashtags)
		const result = await databaseService.tweets.insertOne(
			new Tweet({
				audience: body.audience,
				content: body.content,
				hashtags,
				mentions: body.mentions,
				medias: body.medias,
				parent_id: body.parent_id,
				type: body.type,
				user_id: new ObjectId(user_id)
			})
		)
		const tweet = await databaseService.tweets.findOne({ _id: result.insertedId })
		return tweet
	}

	async increaseView(tweet_id: string, user_id?: string) {
		const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
		const result = await databaseService.tweets.findOneAndUpdate(
			{
				_id: new ObjectId(tweet_id)
			},
			{
				$inc: inc,
				$currentDate: {
					updated_at: true
				}
			},
			{
				returnDocument: 'after',
				projection: {
					guest_views: 1,
					user_views: 1,
					updated_at: 1
				}
			}
		)
		return result! as WithId<{
			guest_views: number
			user_views: number
			updated_at: Date
		}>
	}

	async getTweetChildren({
		tweet_id,
		tweet_type,
		limit,
		page,
		user_id
	}: {
		tweet_id: string
		tweet_type: TweetType
		limit: number
		page: number
		user_id?: string
	}) {
		const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
		const date = new Date()
		const tweet_childrens = await databaseService.tweets
			.aggregate<Tweet>([
				{
					$match: {
						parent_id: new ObjectId(tweet_id),
						type: tweet_type
					}
				},
				{
					$lookup: {
						from: 'hashtags',
						localField: 'hashtags',
						foreignField: '_id',
						as: 'hashtags'
					}
				},
				{
					$lookup: {
						from: 'users',
						localField: 'mentions',
						foreignField: '_id',
						as: 'mentions'
					}
				},
				{
					$addFields: {
						mentions: {
							$map: {
								input: '$mentions',
								as: 'mention',
								in: {
									_id: '$$mention._id',
									name: '$$mention.name',
									username: '$$mention.username',
									email: '$$mention.email'
								}
							}
						}
					}
				},
				{
					$lookup: {
						from: 'bookmarks',
						localField: '_id',
						foreignField: 'tweet_id',
						as: 'bookmarks'
					}
				},
				{
					$lookup: {
						from: 'likes',
						localField: '_id',
						foreignField: 'tweet_id',
						as: 'likes'
					}
				},
				{
					$lookup: {
						from: 'tweets',
						localField: '_id',
						foreignField: 'parent_id',
						as: 'tweet_children'
					}
				},
				{
					$addFields: {
						bookmarks: {
							$size: '$bookmarks'
						},
						likes: {
							$size: '$likes'
						},
						retweet_count: {
							$size: {
								$filter: {
									input: '$tweet_children',
									as: 'item',
									cond: {
										$eq: ['$$item.type', TweetType.Retweet]
									}
								}
							}
						},
						comment_count: {
							$size: {
								$filter: {
									input: '$tweet_children',
									as: 'item',
									cond: {
										$eq: ['$$item.type', TweetType.Comment]
									}
								}
							}
						},
						quote_count: {
							$size: {
								$filter: {
									input: '$tweet_children',
									as: 'item',
									cond: {
										$eq: ['$$item.type', TweetType.QuoteTweet]
									}
								}
							}
						}
					}
				},
				{
					$project: {
						tweet_children: 0
					}
				},
				{
					$skip: limit * (page - 1)
				},
				{
					$limit: limit
				}
			])
			.toArray()
		const ids = tweet_childrens.map((tweet) => tweet._id as ObjectId)
		const [, total] = await Promise.all([
			databaseService.tweets.updateMany(
				{
					_id: {
						$in: ids
					}
				},
				{
					$inc: inc,
					$set: {
						updated_at: date
					}
				}
			),
			databaseService.tweets.countDocuments({
				parent_id: new ObjectId(tweet_id),
				type: tweet_type
			})
		])
		tweet_childrens.forEach((tweet_childrens) => {
			tweet_childrens.updated_at = date
			if (user_id) {
				tweet_childrens.user_views += 1
			} else {
				tweet_childrens.guest_views += 1
			}
		})
		return { tweet_childrens, total }
	}

	async getNewFeeds({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
		const followed_user_ids = await databaseService.followers
			.find(
				{
					user_id: new ObjectId(user_id)
				},
				{
					projection: {
						followed_user_id: 1,
						_id: 0
					}
				}
			)
			.toArray()
		const ids = followed_user_ids.map((item) => item.followed_user_id)
		ids.push(new ObjectId(user_id))
		return ids
	}
}

const tweetsService = new TweetsService()

export default tweetsService
