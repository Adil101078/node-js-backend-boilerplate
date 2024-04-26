import Joi from 'joi'

export const SignUpDTO = Joi.object({
	countryCode: Joi.string().required(),
	mobile: Joi.string().required(),
})

export const SignInDTO = Joi.object({
	countryCode: Joi.string().required(),
	mobile: Joi.string().required(),
	otp: Joi.string().length(5).required(),
})
