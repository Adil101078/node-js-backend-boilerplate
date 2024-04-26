import * as fs from 'fs'
import { resolve } from 'path'
import _ from 'lodash'

export const _registerResponders = async (response) => {
	try {
		const responseDirectoryPath = resolve(`${__dirname}/../responses`)
		const responses = fs.readdirSync(responseDirectoryPath)
		for (let i = 0; i < responses.length; i++) {
			const responseFileName = responses[i]
			let responseFunctionName = responseFileName.split('.')[0]
			responseFunctionName = responseFunctionName ? _.camelCase(responseFunctionName) : null

			const targetFunction = require(resolve(
				`${responseDirectoryPath}/${responseFileName}`
			)).default
			if (typeof targetFunction === 'function') {
				response[responseFunctionName] = targetFunction
			}
		}
	} catch (error) {
		Logger.error(error)
	}
}
