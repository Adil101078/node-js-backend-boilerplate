import { App } from '@core/globals'
import { JwtHelper } from '@helpers/jwt.helper'

export class AuthAfterEffectsHelper {
	async GenerateToken(payload) {
		const { _user } = payload

		const existingUser = await App.Models.User.findOne(_.omitBy({ _id: _user }, _.isNil))

		const token = JwtHelper.GenerateToken({
			_id: existingUser._id.toString(),
		})

		return {
			token,
		}
	}
}

// All Done
export default new AuthAfterEffectsHelper()
