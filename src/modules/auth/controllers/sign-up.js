import { GenerateRandomNumberOfLength } from '@core/utils'
import { SignUpDTO } from '../dto'
import { App } from '@core/globals'
import SendSMS from '@helpers/sms.helper'
import requestValidator from '@helpers/request-validator.helper'

export default async function SignUp(req, res) {
	const errors = requestValidator(SignUpDTO, req.body)

	if (errors) {
		return res.unprocessableEntity({ errors })
	}

	const { mobile, countryCode } = req.body
	const phoneNumber = `${countryCode}${mobile}`

	const existingUser = await App.Models.User.findOne({ mobile, countryCode }).select(
		'+otp +otpExpiresIn'
	)

	const otp = GenerateRandomNumberOfLength(5)
	const otpExpiresIn = new Date(Date.now() + App.Config.OTP_EXPIRES_IN * 60 * 1000)
	const otpMessage = App.Messages.OTPHelper.Success.OTP({ otp, type: 'login' })

	if (existingUser) {
		existingUser.otp = otp
		existingUser.otpExpiresIn = otpExpiresIn
		await existingUser.save()

		await SendSMS(phoneNumber, otpMessage)
		return res.success({ message: App.Messages.SignUp.Success.OPTSent(), items: req.body })
	} else {
		const newUser = new App.Models.User({
			...req.body,
			otp,
			otpExpiresIn,
		})

		await Promise.allSettled([newUser.save(), SendSMS(phoneNumber, otpMessage)])
		return res.success({ res, message: App.Messages.SignUp.Success.OPTSent(), items: req.body })
	}
}
