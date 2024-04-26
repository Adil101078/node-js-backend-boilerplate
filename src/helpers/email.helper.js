import { SESClient, SendEmailCommand, ListIdentitiesCommand } from '@aws-sdk/client-ses'
import { App } from '@core/globals'

class _SESHelper {
	#SES

	constructor() {
		this.#SES = new SESClient({
			region: App.Config.AWS.SNS_REGION,
			credentials: {
				accessKeyId: App.Config.AWS.SNS_ACCESS_KEY_ID,
				secretAccessKey: App.Config.AWS.SNS_SECRET_ACCESS_KEY,
			},
		})
	}

	async checkIdentities() {
		const command = new ListIdentitiesCommand({})
		const response = await this.#SES.send(command)
		const identities = response.Identities

		if (!identities.includes(App.Config.AWS.SES_EMAIL_ID)) {
			throw new Error(
				`Configured AWS_SES_EMAIL_ID isn't verified on the console. Add the identity and try again.`
			)
		}
	}

	async send({
		to,
		cc,
		from = App.Config.AWS.SES_EMAIL_ID,
		replyTo = App.Config.AWS.SES_EMAIL_ID,
		subject,
		templateName,
		data = {},
	}) {
		const { returnTemplate } = await import(`../templates/${templateName}.js`)
		const parsedHTML = returnTemplate(data)

		const toAddresses = Array.isArray(to) ? to : [to]
		const ccAddresses = cc ? (Array.isArray(cc) ? cc : [cc]) : []

		const params = {
			Destination: {
				ToAddresses: toAddresses,
				CcAddresses: ccAddresses,
			},
			Message: {
				Body: {
					Html: {
						Charset: 'UTF-8',
						Data: parsedHTML,
					},
				},
				Subject: {
					Charset: 'UTF-8',
					Data: subject,
				},
			},
			Source: from,
		}

		if (replyTo) {
			params['ReplyToAddresses'] = [replyTo]
		}

		const command = new SendEmailCommand(params)
		try {
			const response = await this.#SES.send(command)
			return response
		} catch (error) {
			throw new Error(`Error sending email: ${error.message}`)
		}
	}
}

export const SESHelper = new _SESHelper()
