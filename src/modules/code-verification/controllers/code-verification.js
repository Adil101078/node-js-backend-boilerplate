import requestValidator from '@helpers/request-validator.helper'
import { CodeVerificationPurpose, CodeVerificationStatus } from '@models/code-verification'
import { App } from '@core/globals'
import OTPHelper from '@helpers/otp.helper'
import AuthAfterEffectsHelper from '@helpers/auth-after-effects.helper'
import { CodeVerificationDTO } from '../dtos'

export default async function CodeVerification(req, res) {
	const errors = requestValidator(CodeVerificationDTO, req.body)
	if (errors) {
		return res.unprocessableEntity({ errors })
	}
	const { _codeVerification, code } = req.body

	const payload = _.omitBy(
		{
			code,
		},
		_.isNil
	)

	// Find record
	const existingCodeVerification = await App.Models.CodeVerification.findOne({
		_id: _codeVerification,
		status: {
			$in: [CodeVerificationStatus.Pending, CodeVerificationStatus.Failed],
		},
		isActive: true,
		verificationLinkToken: { $exists: false },
	})
		.select('+internalOTP')
		.sort({ _id: -1 })

	if (!existingCodeVerification) {
		return res.badRequest({
			message: App.Messages.CodeVerification.Error.MissingRecordToVerify(),
		})
	}

	payload.existingCodeVerification = existingCodeVerification.toObject()

	// Verify OTP using OTPHelper
	if (existingCodeVerification.email) {
		payload.constructedKey = existingCodeVerification.email
	} else if (existingCodeVerification.phone && existingCodeVerification.countryCode) {
		payload.constructedKey = `+${existingCodeVerification.countryCode}${existingCodeVerification.phone}`
	} else {
		throw Error(App.Messages.Error.GeneralError.SomethingWentWrong())
	}

	const verifyCodeResponse = await OTPHelper.VerifyCode(payload, payload.code)

	const isCodeVerified = verifyCodeResponse.VerificationResponse.Valid ?? false

	if (isCodeVerified) {
		// Verified
		if (existingCodeVerification.purpose === CodeVerificationPurpose.SIGNIN_2FA) {
			existingCodeVerification.isActive = false
		}
		existingCodeVerification.status = CodeVerificationStatus.Passed
		existingCodeVerification.verificationPerformedAt = Date.now()
		await existingCodeVerification.save()

		// All Done
		const existingCodeVerificationJSON = existingCodeVerification.toObject()
		delete existingCodeVerificationJSON.internalOTP
		// if purpose is SIGNIN_2FA send jwt token
		if (existingCodeVerification.purpose === CodeVerificationPurpose.SIGNIN_2FA) {
			if (existingCodeVerification.purpose === CodeVerificationPurpose.SIGNIN_2FA) {
				existingCodeVerification.isActive = false
			}
			existingCodeVerification.status = CodeVerificationStatus.Passed
			existingCodeVerification.verificationPerformedAt = Date.now()
			await existingCodeVerification.save()

			// All Done
			const existingCodeVerificationJSON = existingCodeVerification.toObject()
			delete existingCodeVerificationJSON.internalOTP
			const { token } = await AuthAfterEffectsHelper.GenerateToken({
				_user: existingCodeVerification._user,
			})

			// Issue JWT to the user
			return res.success({
				message: App.Messages.Auth.Success.SigninSuccessful(),
				item: {
					token,
				},
			})
		} else if (existingCodeVerification.purpose === CodeVerificationPurpose.FORGOT_2FA) {
			const secret = await GenerateAuthenticatorSecret(existingCodeVerification.email)
			const _user = await App.Models.User.findOne({
				email: existingCodeVerification.email,
			}).select('+password +parsedFullName twoFactorAuthentication accountMetadata')
			if (!_user) {
				return res.unauthorized({
					message: App.Messages.GeneralError.UserNotExists(),
				})
			}
			_user.twoFactorAuthentication = {
				isActivated: false,
				authenticationType: 'AuthenticatorApp',
				authenticatorSecret: secret?.secret,
			}

			await _user.save()

			return res.success({
				message: App.Messages.Success.Profile.AuthenticatorSecretGeneratedSuccessfully(),
				item: secret,
			})
		}
		return res.success({
			message: App.Messages.CodeVerification.Success.CodeVerified(),
			item: {
				codeVerification: existingCodeVerificationJSON,
			},
		})
	} else {
		// Not Verified
		existingCodeVerification.status = CodeVerificationStatus.Failed
		existingCodeVerification.verificationPerformedAt = Date.now()
		await existingCodeVerification.save()

		// All Done
		const existingCodeVerificationJSON = existingCodeVerification.toObject()
		delete existingCodeVerificationJSON.internalOTP
		return res.badRequest({
			message: App.Messages.CodeVerification.Error.CodeVerificationFailed(),
			item: {
				codeVerification: existingCodeVerificationJSON,
			},
		})
	}
}
