export default function (data = {}) {
	const statusCode = 201
	const { message = 'Created.', item = null, items = null } = data

	const resultant = {
		data: { message, statusCode, items: items ? items : item ? item : undefined },
	}

	// All Done
	return this.status(statusCode).json(resultant)
}
