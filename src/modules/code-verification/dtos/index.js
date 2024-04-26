import {constants} from '@core/constant/constant'
import joi from 'joi'
import objectId from 'joi-objectid'

const mongoId = objectId(joi)

export const CodeVerificationDTO = joi.object({
	sessionIdentifier: joi.string().optional(),
	code: joi.string().required(),
	_codeVerification: mongoId().required(),
})

export const LinkVerificationDTO = joi.object({
	token: joi.string().required(),
})

export const ResendRequestDTO = joi.object({
	_codeVerification: mongoId().required(),
})

export const RequestDTO = joi.object({
	email: joi.string().email().optional(),
	via: joi
		.string()
		.valid(...constants.CODE_VERIFICATION.VIA)
		.required(),
	purpose: joi
		.string()
		.valid(...constants.CODE_VERIFICATION.PURPOSE)
		.required(),
	phone: joi.string().min(3).max(15).optional(),
	countryCode: joi.string().min(1).max(3).optional(),
	_user: mongoId().optional(),
	twoFactorAuthenticationCode: joi.string().optional().min(3),
})

export const RequestForSignin2FADTO = joi.object({
	_user: mongoId().required(),
	twoFactorAuthenticationCode: joi.string().required().min(3),
})
export const RequestByEmailForgotPasswordDTO = joi.object({
	email: joi.string().email().required(),
	via: joi
		.string()
		.valid(...constants.CODE_VERIFICATION.VIA)
		.optional(),
	purpose: joi
		.string()
		.valid(...constants.CODE_VERIFICATION.PURPOSE)
		.optional(),
	phone: joi.string().min(3).max(15).optional(),
	countryCode: joi.string().min(1).max(3).optional(),
})
export const RequestByPhoneDTO = joi.object({
	phone: joi.string().min(3).max(15).required(),
	countryCode: joi.string().min(1).max(3).required(),
})
export const RequestByEmailOrPhoneDTO = joi.object({
	email: joi.when(joi.exist(), {
		then: joi.string().email(),
		otherwise: joi.forbidden(),
	}),

	phone: joi.when(joi.exist(), {
		then: joi.string().min(3).max(15).message('Invalid phone number'),
		otherwise: joi.forbidden(),
	}),

	countryCode: joi.when('phone', {
		is: joi.exist(),
		then: joi.string().min(1).max(3).message('Invalid country code'),
		otherwise: joi.forbidden(),
	}),
	via: joi
		.string()
		.valid(...constants.CODE_VERIFICATION.VIA)
		.required(),
	purpose: joi
		.string()
		.valid(...constants.CODE_VERIFICATION.PURPOSE)
		.required(),
})

export const RequestForUpdate2FAByEmail = joi.object({
	email: joi.string().email().required(),
	via: joi
		.string()
		.valid(...constants.CODE_VERIFICATION.VIA)
		.required(),
	purpose: joi
		.string()
		.valid(...constants.CODE_VERIFICATION.PURPOSE)
		.required(),
})
