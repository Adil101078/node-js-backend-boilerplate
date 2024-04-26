import requestValidator from '@helpers/request-validator.helper'
import { SignUpDTO } from '../dto'
import { App } from '@core/globals'
import { GenerateRandomNumberOfLength } from '@core/utils'
import sendSMS from '@helpers/sms.helper'

export default async function ResendOTP(req, res) {
	const errors = requestValidator(SignUpDTO, req.body)
	if (errors) {
		return res.unprocessableEntity({ errors })
	}
	const { mobile, countryCode } = req.body
	const payload = _.omitBy(
		{
			isActive: true,
			mobile: mobile.trim(),
			countryCode: countryCode.trim(),
		},
		_.isNil
	)
	const existingUser = await App.Models.User.findOne(payload).select('+otp +otpExpiresIn')

	if (!existingUser) {
		return res.notFound({
			message: App.Messages.GeneralError.UserNotFound(),
		})
	}
	const otp = GenerateRandomNumberOfLength(5)
	const otpExpiresIn = new Date(Date.now() + App.Config.OTP_EXPIRES_IN * 60 * 1000)
	existingUser.otp = otp
	existingUser.otpExpiresIn = otpExpiresIn

	const phoneNumber = `${countryCode}${mobile}`
	const otpMessage = App.Messages.OTPHelper.Success.OTP({ otp, type: 'login' })

	await Promise.allSettled([existingUser.save(), sendSMS(phoneNumber, otpMessage)])
	return res.success({
		message: App.Messages.SignUp.Success.OTPResent(),
		items: req.body,
	})
}
