import express from 'express'
import { App } from '@core/globals'
import cors from 'cors'
import helmet from 'helmet'
import morganLogger from 'morgan'
import { _registerResponders } from '@core/response-handler'
import { Database } from '@core/database'
import { AppRoutes } from './app.routes'

class Application {
	constructor() {
		this.app = express()
		App.Http.app = this.app
		this.middleware()
		this.config()
		this.connectDatabase()
		this.registerResponders()
		this.registerRoutes()
		// this.cron()
	}

	express() {
		return this.app
	}

	config() {
		this.app.set('port', App.Config.PORT || 9000)
		this.app.set('env', App.Config.ENVIRONMENT || 'development')
		this.app.disable('x-powered-by')
	}

	middleware() {
		if (App.Config.ENVIRONMENT !== 'test') {
			this.app.use(
				morganLogger('dev', {
					stream: {
						write: (message) => Logger.info(message.slice(0, -1)),
					},
				})
			)
		}
		this.app.use(cors())
		this.app.use(helmet())
		this.app.use(express.json())
		this.app.use(express.urlencoded({ extended: true }))
	}

	async registerResponders() {
		this.app.use(async (_request, response, next) => {
			await _registerResponders(response)
			next()
		})
	}

	async registerRoutes() {
		// this.app.put('*', maintenanceMode)
		// this.app.post('*', maintenanceMode)
		// this.app.patch('*', maintenanceMode)
		// this.app.delete('*', maintenanceMode)

		this.app.use('/api/v1', AppRoutes)

		this.app.get('/', (_req, res) => {
			return res.success({ message: 'Welcome' })
		})

		this.app.use((_req, res) => {
			return res.notFound()
		})
	}

	async connectDatabase() {
		const database = new Database({
			url: App.Config.DB_CONNECTION_STRING,
			connectionOptions: App.Config.DB_CONNECTION_OPTIONS,
		})
		await database.connect()
		App.Database = database
	}

	async onServerStart() {
		Logger.info(`App is running at ${App.Config.HOST} in ${App.Config.ENVIRONMENT} mode.`)
		Logger.info('Press CTRL-C to stop')
	}

	// async cron() {
	// 	Logger.warn(App.Messages.Success.GeneralSuccess.CronServiceStarted())
	// 	await CronHelper.CronJob()
	// }
}

export default new Application()
