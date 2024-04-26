import mongoose, { connect } from 'mongoose'

mongoose.set('strictQuery', false)

export class Database {
	#url
	#connectionOptions

	constructor(options) {
		const {
			url = 'mongodb://localhost:27017/test',
			connectionOptions = {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			},
		} = options

		this.#url = url
		this.#connectionOptions = connectionOptions
	}

	async connect() {
		connect(this.#url.toString(), this.#connectionOptions)
		Logger.info('Database Connected Successfully.')
	}
}
