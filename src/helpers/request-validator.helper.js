const requestValidator = (schema, data = {}) => {
	try {
		const { error } = schema.validate(data, { abortEarly: false })
		if (error) {
			// return error.details[0].message.replace(/"/g, '') + '.'
			return error
		}
	} catch (error) {
		Logger.error(error)
		throw new Error(error)
	}
}
export default requestValidator
