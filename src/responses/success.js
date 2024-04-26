export default function (_data = {}) {
	const statusCode = 200
	const {
		message = null,
		item = null,
		items = null,
		// Pagination Related Fields
		totalItems,
		startIndex,
		itemsPerPage,
		unreadCounts = null,
	} = _data

	const resultant = {
		data: {
			message: message ? message : 'Success',
			statusCode,
			// Pagination Related Fields
			totalItems,
			startIndex,
			itemsPerPage,
			totalPage:
				totalItems && itemsPerPage ? Math.ceil(totalItems / itemsPerPage) : undefined,
			unreadCounts: unreadCounts ? +unreadCounts : undefined,
			items: items ? items : item ? item : undefined,
		},
	}

	// All Done
	return this.status(statusCode).json(resultant)
}
