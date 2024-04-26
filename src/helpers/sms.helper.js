import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import { App } from '@core/globals'

const snsClient = new SNSClient({
	region: App.Config.AWS.SNS_REGION,
	credentials: {
		accessKeyId: App.Config.AWS.SNS_ACCESS_KEY_ID,
		secretAccessKey: App.Config.AWS.SNS_SECRET_ACCESS_KEY,
	},
})

const sendSMS = async (mobileNo, body) => {
	try {
		const params = {
			Message: body,
			PhoneNumber: mobileNo,
		}

		const command = new PublishCommand(params)

		const data = await snsClient.send(command)
		Logger.info(JSON.stringify(data))
		return data
	} catch (error) {
		Logger.error(error)
		throw error
	}
}

export default sendSMS
