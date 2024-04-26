// config.js
import dotenv from 'dotenv'
dotenv.config()
import moduleAlias from 'module-alias'

// Define module aliases
moduleAlias.addAliases({
	'@core': __dirname + '/src/core',
	'@middlewares': __dirname + '/src/middlewares',
	'@helpers': __dirname + '/src/helpers',
	'@models': __dirname + '/src/models',
	'@modules': __dirname + '/src/modules',
	'@src': __dirname + '/src',	
})

import Application from './app'
import Bootstrap from '@core/bootstrap'
const expressApp = Application.express()

Bootstrap(Application).then(() => {
	expressApp.listen(expressApp.get('port'), async () => {
		Application.onServerStart()
	})
})

process.on('uncaughtException', (err) => {
	Logger.error('UNCAUGHT EXCEPTION!!! Shutting Down...')
	Logger.error(err)
	process.exit(1)
})

process.on('unhandledRejection', (err) => {
	Logger.error('UNHANDLED REJECTION!!! Shutting Down...')
	Logger.error(err)
	process.exit(1)
})
