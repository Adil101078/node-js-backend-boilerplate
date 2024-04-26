
export default function (data = {}) {
	const statusCode = 422
	const {
		error = 'Unprocessable Entity',
		errors = null,
		item = null,
		items = null,
	} = data

	const extractedErrors = errors
		? errors.details.map((error) => ({
				message: error.message.replace(/"/g, ''),
				property: error.context.key,
			}))
		: null
	const resultant = {
		error: {
			message: errors ? errors.details[0].message.replace(/"/g, '') + '.' : error,
			statusCode,
			errors: extractedErrors ? extractedErrors : undefined,
			items: items ? items : item ? [item] : undefined,
		},
	}

	// All Done
	return this.status(statusCode).json(resultant)
}
