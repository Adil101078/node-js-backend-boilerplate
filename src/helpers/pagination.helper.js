
class PaginationHelper {
	constructor(model) {
		this.model = model
	}

	async paginate(inputs) {
		try {
			const {
				populate = null,
				startIndex = 1,
				itemsPerPage = +App.Config.ITEMS_PER_PAGE,
				query = {},
				sort = { _id: -1 },
				projection = {},
			} = inputs

			const perPage = +itemsPerPage

			const skipCount = startIndex > 0 ? (startIndex - 1) * perPage : 0
			const totalItems = await this.model.countDocuments(query)
			let items = []
			if (populate) {
				items = await this.model
					.find(query, projection)
					.sort(sort)
					.skip(skipCount)
					.limit(perPage)
					.populate(populate)
					.lean()
			} else {
				items = await this.model
					.find(query, projection)
					.sort(sort)
					.skip(skipCount)
					.limit(perPage)
					.lean()
			}

			return {
				totalItems,
				startIndex: +startIndex || 1,
				itemsPerPage: perPage,
				totalPage: Math.ceil(totalItems / itemsPerPage),
				items,
			}
		} catch (error) {
			Logger.error(error)
		}
		// On Error Return Null
		return null
	}
}

// All Done
export default PaginationHelper
