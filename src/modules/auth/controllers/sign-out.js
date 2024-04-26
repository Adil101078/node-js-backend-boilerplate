import { App } from '@core/globals'

export default async function SignOut(req, res) {
	return res.success({ res, message: App.Messages.SingOut.Success.Logout() })
}
