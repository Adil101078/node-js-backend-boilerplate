import { codeVerificationRequest } from './code-verification-request'

export const DynamicRoutes = {
	CodeVerificationRequest: 'CodeVerificationRequest',
}

const defaultHandler = async (req, res, next) => {
	try {
		return next()
	} catch (error) {
		Logger.error(error)
		return res.internalServerError({ error })
	}
}

export const dynamic = (routeName) => {
	if (routeName === DynamicRoutes.CodeVerificationRequest) {
		return codeVerificationRequest
	}
	return defaultHandler
}
