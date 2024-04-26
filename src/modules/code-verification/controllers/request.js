import requestValidator from '@helpers/request-validator.helper'
import {
	RequestDTO,
	RequestByPhoneDTO,
	RequestByEmailOrPhoneDTO,
	RequestByEmailForgotPasswordDTO,
	RequestForSignin2FADTO,
} from '../dtos'
import { CodeVerificationPurpose, CodeVerificationStatus } from '@models/code-verification'
import Dayjs from 'dayjs'
// import SendSMS from '@helpers/sms.helper'
import { GenerateRandomNumberOfLength } from '@core/utils'
// import { phone as Phone } from 'phone'
import { App } from '@core/globals'

export const CodeVerificationVia = {
	code: 'code',
	link: 'link',
}

const { RESEND_LIMIT_IN_SESSION, RESEND_SESSION_DURATION, RESEND_SESSION_DURATION_UNIT } =
	App.Config.CODE_VERIFICATION

const { INVALID_SIGNIN_ATTEMPTS_LIMIT } = App.Config.SIGNIN

export default async function CodeVerificationRequest(req, res) {
	const errors = requestValidator(RequestDTO, req.body)
	if (errors) {
		return res.unprocessableEntity({ errors })
	}

	const { email, phone, countryCode, purpose, _user, twoFactorAuthenticationCode } = req.body

	const payload = _.omitBy(
		{
			email,
			phone,
			countryCode,
			purpose,
		},
		_.isNil
	)

	let existingUser = null

	// if (payload.phone) {
	// 	const isPhoneValid = Phone(`${countryCode}${phone}`)
	// 	if (!isPhoneValid.isValid) {
	// 		return res.forbidden({
	// 			message: App.Messages.CodeVerification.Error.InvalidPhone(),
	// 		})
	// 	}
	// }
	// validations by purpose type PRE_SIGNUP
	if (purpose === CodeVerificationPurpose.PRE_SIGNUP) {
		const errors = requestValidator(RequestByEmailOrPhoneDTO, req.body)
		if (errors) {
			return res.unprocessableEntity({ errors })
		}
	}

	// validations by purpose type FORGOT_PASSWORD
	if (
		purpose === CodeVerificationPurpose.FORGOT_PASSWORD ||
		purpose === CodeVerificationPurpose.FORGOT_2FA
	) {
		const errors = requestValidator(RequestByEmailForgotPasswordDTO, req.body)
		if (errors) {
			return res.unprocessableEntity({ errors })
		}

		// Fetch the user with email id
		if (payload.email) {
			existingUser = await App.Models.User.findByEmail(payload.email.toLowerCase()).select(
				'+socialId'
			)
		}
		// Fetch the user with mobile
		else if (payload.phone) {
			existingUser = await App.Models.User.findByPhone(payload.phone).select('+socialId')
		} else {
			return res.badRequest()
		}

		// Abort if user not exists
		if (!existingUser) {
			return res.unauthorized({
				message: App.Messages.CodeVerification.Error.UserNotExists(),
			})
		}

		// Abort if user has social account/id
		if (existingUser.socialId) {
			return res.unauthorized({
				message:
					App.Messages.CodeVerification.Error.ForgotPasswordSocialAccountNotAllowed(),
			})
		}

		if (payload.phone) {
			payload.countryCode = existingUser.countryCode
		}
	}

	// validations by purpose type USER_PHONE_UPDATE
	if (purpose === CodeVerificationPurpose.USER_PHONE_UPDATE) {
		const errors = requestValidator(RequestByPhoneDTO, {
			phone,
			countryCode,
		})
		if (errors) {
			return res.unprocessableEntity({ errors })
		}

		const existingUserCount = await App.Models.User.countDocuments({
			phone,
			isActive: true,
		})
		if (existingUserCount) {
			return res.conflict({
				message: App.Messages.CodeVerification.Error.PhoneAlreadyInUse(),
			})
		}
	}

	// validations by purpose type SIGNIN_2FA
	if (purpose === CodeVerificationPurpose.SIGNIN_2FA) {
		const errors = requestValidator(RequestForSignin2FADTO, {
			_user,
			twoFactorAuthenticationCode,
		})
		if (errors) {
			return res.unprocessableEntity({ errors })
		}

		existingUser = await App.Models.User.findOne({
			_id: _user,
			'twoFactorAuthentication.code': twoFactorAuthenticationCode,
			'twoFactorAuthentication.isActivated': true,
			isActive: true,
		})

		// Abort if user not exists
		if (!existingUser) {
			return res.unauthorized({
				message: App.Messages.CodeVerification.Error.UserNotExists(),
			})
		}

		// Check twoFactorAuthentication code expiration
		if (Dayjs().isAfter(Dayjs(existingUser.twoFactorAuthentication.expiresAt))) {
			return res.unauthorized({
				message: App.Messages.CodeVerification.Error.SessionExpired(),
			})
		}

		payload._user = existingUser._id
	}

	// Check if user is blocked by admin
	if (existingUser?.accountMetadata?.isBlockedByAdmin) {
		return res.unauthorized({
			message:
				existingUser.accountMetadata.customBlockMessage ||
				App.Messages.GeneralError.AccountBlockedByAdmin(),
		})
	}

	// Check if user is blocked by system
	if (existingUser?.accountMetadata?.isBlocked) {
		//Blocked User
		if (
			existingUser.accountMetadata.unblocksAt &&
			Dayjs().isAfter(Dayjs(existingUser.accountMetadata.unblocksAt))
		) {
			//User unblocking
			existingUser.accountMetadata.isBlocked = false
			existingUser.accountMetadata.unblocksAt = undefined
			existingUser.accountMetadata.customBlockMessage = undefined
			existingUser.invalidSigninAttemptsAt = []
			await existingUser.save()
		} else {
			const timeLeftToUnblock = Math.ceil(
				Dayjs(existingUser.accountMetadata.unblocksAt).diff(Date.now(), 'hour', true)
			)
			const ON_BLOCK_ERROR_MESSAGE =
				existingUser.invalidSigninAttemptsAt.length >= INVALID_SIGNIN_ATTEMPTS_LIMIT
					? App.Messages.CodeVerification.Error.AccountBlockedDueToMultipleAttempts({
							timeLeftToUnblock: `${timeLeftToUnblock} hr${
								timeLeftToUnblock > 1 ? 's' : ''
							}`,
					  })
					: App.Messages.CodeVerification.Error.DisabledAccount()

			return res.unauthorized({
				message: existingUser.accountMetadata.customBlockMessage || ON_BLOCK_ERROR_MESSAGE,
			})
		}
	}

	/* OTP Resend Validation START */
	// Find previous OTP resend counts
	const _payload = JSON.parse(JSON.stringify(payload))
	delete _payload.constructedKey

	const filterFunction = () => {
		if (existingUser && purpose === CodeVerificationPurpose.SIGNIN_2FA) {
			return {
				createdAt: {
					$gt: existingUser.lastSigninAt,
				},
			}
		}
		return
	}
	const previousCodeVerificationAttempts = await App.Models.CodeVerification.find({
		..._payload,
		status: {
			$in: Object.keys(CodeVerificationStatus),
		},
		$and: [
			{
				createdAt: {
					$gt: Dayjs()
						.subtract(RESEND_SESSION_DURATION, RESEND_SESSION_DURATION_UNIT)
						.toDate(),
				},
			},
			filterFunction(),
		].filter((e) => e != undefined),
	})
		.select('+verificationLinkToken +internalOTP')
		.sort({ _id: -1 })

	// last code sent record
	const lastCodeVerification = previousCodeVerificationAttempts.length
		? previousCodeVerificationAttempts[0]
		: null

	if (previousCodeVerificationAttempts.length >= RESEND_LIMIT_IN_SESSION) {
		return res.tooManyRequests({
			message: App.Messages.CodeVerification.Error.ResendLimitExceeded(),
		})
	}

	if (lastCodeVerification) {
		const resendShouldGetAllowedAfter = Dayjs(lastCodeVerification.createdAt).add(
			lastCodeVerification.resendDuration,
			'second'
		)
		if (Dayjs().isBefore(resendShouldGetAllowedAfter)) {
			const resendShouldGetAllowedInSeconds = resendShouldGetAllowedAfter.diff(
				Dayjs(),
				'seconds'
			)
			return res.badRequest({
				message: App.Messages.CodeVerification.Error.ResendIsNotAvailable({
					resendShouldGetAllowedInSeconds,
				}),
			})
		}
	}

	const OTP = GenerateRandomNumberOfLength(6)
	const codeVerification = await App.Models.CodeVerification.create({
		...payload,
		internalOTP: {
			code: OTP.toString(),
		},
	})

	if (payload.phone && payload.countryCode) {
		// Send SMS on Phone
		// await SendSMS(
		// 	[`${countryCode}${phone}`],
		// 	App.Messages.Helpers.OTPHelper.CodeSentSuccessFullyOverEmail({
		// 		OTP,
		// 		BrandName: App.Config.BRAND_NAME,
		// 	})
		// )
	}
	if (payload.email) {
		// MailHelper.sendEmail(
		// 	[payload.email],
		// 	constant.EMAIL.SUBJECT.VERIFY_CODE,
		// 	constant.EMAIL.TEMPLATE.VERIFY_OTP,
		// 	{ otp: OTP, name: existingUser ? existingUser.firstName : 'User' }
		// )
	}

	// All Done
	const codeVerificationJSON = codeVerification.toObject()
	delete codeVerificationJSON.internalOTP
	delete codeVerificationJSON.verificationLinkToken
	return res.success({
		message: App.Messages.CodeVerification.Success.CodeSent({
			type: payload.verificationLinkToken ? 'link' : 'code',
			to: payload.email ? 'email' : 'phone number',
		}),
		item: codeVerification,
	})
}
