import { model, Schema } from 'mongoose'
import { MODELS } from '@core/constant/model'

const schema = new Schema(
	{
		title: String,
		description: String,
		type: String,
		isRead: { type: Boolean, default: false },
		readAt: Date,
		_user: { type: Schema.Types.ObjectId, ref: MODELS.USER },
		_admin: { type: Schema.Types.ObjectId, ref: MODELS.ADMIN },
	},
	{
		timestamps: true,
		versionKey: false,
		autoIndex: true,
	}
)

export const NotificationModel = model(MODELS.NOTIFICATION, schema)
