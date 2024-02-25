import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
config()
const emailTemplate = fs.readFileSync(path.resolve('src/templates/verify-email.html'), 'utf8')
// Create SES service object.
const sesClient = new SESClient({
	region: process.env.AWS_REGION as string,
	credentials: {
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
		accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
	}
})

const createSendEmailCommand = ({
	fromAddress,
	toAddresses,
	ccAddresses = [],
	body,
	subject,
	replyToAddresses = []
}: {
	fromAddress: string
	toAddresses: string | string[]
	ccAddresses?: string | string[]
	body: string
	subject: string
	replyToAddresses?: string | string[]
}) => {
	return new SendEmailCommand({
		Destination: {
			/* required */
			CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
			ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses]
		},
		Message: {
			/* required */
			Body: {
				/* required */
				Html: {
					Charset: 'UTF-8',
					Data: body
				}
			},
			Subject: {
				Charset: 'UTF-8',
				Data: subject
			}
		},
		Source: fromAddress,
		ReplyToAddresses: replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses]
	})
}

const sendVerifyEmail = (toAddress: string, subject: string, body: string) => {
	const sendEmailCommand = createSendEmailCommand({
		fromAddress: process.env.SES_FROM_ADDRESS as string,
		toAddresses: toAddress,
		body,
		subject
	})

	return sesClient.send(sendEmailCommand)
}

export const sendVerifyRegisterEmail = (
	toAddress: string,
	email_verify_token: string,
	template: string = emailTemplate
) => {
	return sendVerifyEmail(
		toAddress,
		'Verify your email',
		template
			.replace('{{title}}', 'Please verify your email')
			.replace('{{content}}', 'Click the button below to verify your email')
			.replace('{{titleLink}}', 'Verify')
			.replace('{{link}}', `${process.env.CLIENT_URL}/verify-email?token=${email_verify_token}`)
	)
}

export const sendForgotPasswordEmail = (
	toAddress: string,
	forgot_password_token: string,
	template: string = emailTemplate
) => {
	return sendVerifyEmail(
		toAddress,
		'Reset password',
		template
			.replace('{{title}}', 'Please reset your password')
			.replace('{{content}}', 'Click the button below to reset your password')
			.replace('{{titleLink}}', 'Reset password')
			.replace('{{link}}', `${process.env.CLIENT_URL}/forgot-password?token=${forgot_password_token}`)
	)
}
