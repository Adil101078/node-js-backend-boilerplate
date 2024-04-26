export default function (data = {}) {
	const statusCode = 500
	const {
		message = 'Internal Server Error.',
		error = null,
		errors = null,
		item = null,
		items = null,
	} = data

	const resultant = {
		error: {
			message,
			statusCode,
			errors: errors ? errors : error ? [error.toString()] : undefined,
			items: items ? items : item ? [item] : undefined,
		},
	}

	// All Done
	return this.status(statusCode).json(resultant)
}
