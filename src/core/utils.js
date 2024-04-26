import fs from 'fs'
import Mustache from 'mustache'

export const FileExistsSync = (FilePath) =>
	fs.existsSync(`${FilePath}.js`) || fs.existsSync(`${FilePath}.ts`)

export function GenerateCallableMessages(_Messages) {
	const Messages = {}

	function _GenerateCallableMessages(target, values) {
		try {
			for (const key in values) {
				if (typeof values[key] == 'string') {
					target[key] = (params) => {
						return Mustache.render(values[key], params)
					}
				} else {
					target[key] = {}
					_GenerateCallableMessages(target[key], values[key])
				}
			}
		} catch (error) {
			Logger.error(error)
		}
	}

	_GenerateCallableMessages(Messages, _Messages)
	return Messages
}

export function GenerateRandomStringOfLength(length) {
	let result = ''
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	const charactersLength = characters.length
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength))
	}
	return result
}

export function GenerateRandomNumberOfLength(length) {
	let result = ''
	const characters = '0123456789'
	const charactersLength = characters.length
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength))
	}
	return result
}

export function Wrap(controller) {
	return async (req, res, next) => {
		try {
			await controller(req, res, next)
		} catch (error) {
			Logger.error(error)
			return res.internalServerError({ error })
		}
	}
}

export const BasicAuthCredentialFetch = (options) => {
	const { authorization } = options
	if (!authorization || authorization.indexOf('Basic ') === -1) {
		return null
	}

	// verify auth credentials
	const base64Credentials = authorization.split(' ')[1]
	const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
	const [username, password] = credentials.split(':')
	return {
		username,
		password,
	}
}

export async function GenerateNewLoginSession(payload) {
	const { existingLoginSessions, sessionIdentifier } = payload

	const loginSession = {
		signinAt: new Date(),
		sessionIdentifier,
	}

	const _existingLoginSessions = existingLoginSessions
	let newSession = true
	if (sessionIdentifier) {
		for (let i = 0; i < existingLoginSessions.length; i++) {
			const _loginSession = existingLoginSessions[i]
			if (_loginSession.sessionIdentifier == sessionIdentifier) {
				existingLoginSessions[i] = loginSession
				newSession = false
			}
		}
	}

	if (newSession) {
		loginSession.sessionIdentifier = GenerateRandomStringOfLength(100)
		_existingLoginSessions.push(loginSession)
	}

	return {
		all: _existingLoginSessions,
		current: loginSession,
	}
}

export function GenerateRecipientsArray(phoneNumbers) {
	const recipients = phoneNumbers.map((msisdn) => ({ msisdn }))
	return { recipients }
}

export const RequestValidator = (DTO, data = {}) => {
	const validationResult = DTO.validate(data)
	if (validationResult.error) {
		const errors = []
		for (let i = 0; i < validationResult.error.details.length; i++) {
			errors.push(validationResult.error.details[i].message)
		}
		validationResult.errors = errors
	}
	return validationResult
}
