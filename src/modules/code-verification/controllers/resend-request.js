import requestValidator from '@helpers/request-validator.helper'
import { ResendRequestDTO } from '../dtos'
import { GenerateRandomNumberOfLength } from '@core/utils'
// import SendSMS from '@helpers/sms.helper'
// import mailHelper from '@helpers/mail.helper'
// import constant from '@core/constants'
import { App } from '@core/globals'

export default async function CodeVerificationResendRequest(req, res) {
	const errors = requestValidator(ResendRequestDTO, req.params)
	if (errors) {
		return res.unprocessableEntity({ errors })
	}

	const { _codeVerification } = req.params

	const payload = _.omitBy(
		{
			_codeVerification,
		},
		_.isNil
	)
	const codeVerification = await App.Models.CodeVerification.findOne({
		_id: payload._codeVerification,
		isActive: true,
	})

	if (!codeVerification) {
		return res.notFound({
			message: App.Messages.Error.CodeVerification.CodeVerificationNotFound(),
		})
	}
	const OTP = GenerateRandomNumberOfLength(6)
	codeVerification.internalOTP = {
		code: OTP.toString(),
	}
	if (codeVerification.email) {
		// await mailHelper.sendEmail(
		// 	[codeVerification.email],
		// 	constant.EMAIL.SUBJECT.VERIFY_CODE,
		// 	constant.EMAIL.TEMPLATE.VERIFY_OTP,
		// 	{ otp: OTP }
		// )
	}
	if (codeVerification.phone && codeVerification.countryCode) {
		// await SendSMS(
		// 	[`${codeVerification.countryCode}${codeVerification.phone}`],
		// 	App.Messages.Helpers.OTPHelper.CodeSentSuccessFullyOverEmail({
		// 		OTP,
		// 		BrandName: App.Config.BRAND_NAME,
		// 	})
		// )
	}

	await codeVerification.save()

	// All Done
	const codeVerificationJSON = codeVerification.toObject()
	delete codeVerificationJSON.internalOTP
	delete codeVerificationJSON.verificationLinkToken
	return res.success({
		message: App.Messages.Success.CodeVerification.CodeResent({
			type: payload.verificationLinkToken ? 'link' : 'code',
			to: payload.email ? 'email' : 'phone number',
		}),
		item: {
			codeVerification,
		},
	})
}
