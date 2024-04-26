import JWTHelper from '@helpers/jwt.helper'

export default async (app) => {
	try {
		// #1 Do stuff that needs to be done before server start

		// #2 Generate Public and Private Keys if don't exist
		JWTHelper.GenerateKeys()
	} catch (error) {
		Logger.error(error)
	}
}

// const CreateDefaultSubscription = async () => {
// 	const subscriptions = await App.Models.Subscription.countDocuments()
// 	if (subscriptions <= 0) {
// 		const names = Object.values(SubscriptionName)
// 		const inputs = names.map((name, index) => {
// 			const price = 1
// 			return {
// 				name,
// 				price: {
// 					value: price * index * App.Config.APPROX_ETH_PRICE,
// 				},
// 			}
// 		})
// 		await App.Models.Subscription.insertMany(inputs)
// 	}
// }
