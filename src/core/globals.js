import path from 'path'
import _ from 'lodash'
import Config from './config'
import { Logger } from './logger'

import { GenerateCallableMessages } from './utils'
import Messages from '@src/response-messages'

// Database Models
import { UserModel } from '@models/user'
import { NotificationModel } from '@models/notification'
import { CodeVerificationModel } from '@models/code-verification'

// Export Global Variables
export const Globals = global
Globals._ = _
Globals.Logger = Logger
export const App = {
	EXTENSION_ECOSYSTEM: path.extname(__filename) === '.js' ? 'js' : 'ts',
	Http: {
		app: null,
	},
	Config: Config(),
	Messages: GenerateCallableMessages(Messages),
	Models: {
		User: UserModel,
		Notification: NotificationModel,
		CodeVerification: CodeVerificationModel
	},
}
