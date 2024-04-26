import { App } from '@core/globals'
import { SignInDTO } from '../dto'
import AuthAfterEffectsHelper from '@helpers/auth-after-effects.helper'
import requestValidator from '@helpers/request-validator.helper'

export default async function VerifyOTP(req, res) {
	const errors = requestValidator(SignInDTO, req.body)

	if (errors) {
		return res.unprocessableEntity({ errors })
	}

	const { mobile, countryCode, otp } = req.body

	const existingUser = await App.Models.User.findOne({ mobile, countryCode, otp }).select(
		'+otp +otpExpiresIn'
	)

	if (!existingUser || existingUser.otp !== otp) {
		return res.forbidden({ message: App.Messages.SingIn.Error.InvalidOtp() })
	}

	if (existingUser.otpExpiresIn < Date.now()) {
		return res.forbidden({ message: App.Messages.SingIn.Error.OTPExpires() })
	}

	const { token } = await AuthAfterEffectsHelper.GenerateToken({
		_user: existingUser._id.toString(),
	})

	existingUser.otpExpiresIn = undefined
	existingUser.otp = undefined
	await existingUser.save()

	return res.success({
		message: App.Messages.SingIn.Success.SignInSuccess(),
		items: { token },
	})
}
