# Twitter Clone

This project is a Twitter clone developed in TypeScript, utilizing Node.js and Express.js framework. MongoDB is used as the database for data storage. Authentication is implemented using JWT Tokens for access and refresh token management, along with Google OAuth2.0 for user authentication. Media serving capabilities include downsizing images using the Sharp library and handling video content with HLS Encode. Additionally, AWS SES (Simple Email Service) is used for sending emails, and AWS S3 (Simple Storage Service) is employed to store uploaded images and videos.

## Features

- User authentication using JWT Tokens and Google OAuth2.0
- Posting tweets
- Following other users
- Bookmark, like, comment, quote and retweet tweets
- Get new feeds
- Media upload support with image downsizing and video encoding
- Advance search
- Email notifications using AWS SES
- Storage of media files on AWS S3

## Usage

- Register/Login using your Twitter clone credentials or through Google OAuth2.0.
- Post tweets, images, or videos.
- Follow other users to see their tweets on your new feed.
- Like, comment, quote and retweet posts.
- Manage your profile settings.
- Receive email notifications for certain events.
