import { Schema, model as Model } from 'mongoose'
import { MODELS } from '@core/constant/model'
const ObjectId = Schema.Types.ObjectId

const schema = new Schema(
	{
		firstName: { type: String },
		lastName: { type: String },
		email: { type: String, sparse: true, lowercase: true, trim: true },
		countryCode: { type: String },
		phone: { type: String, required: true },
		accountMetadata: {
			isBlockedByAdmin: { type: Boolean, default: false },
			isDeleted: { type: Boolean, default: false },
			isBlocked: { type: Boolean, default: false },
			blockedAt: Date,
			customBlockMessage: String,
			unblocksAt: Date
		},
		isActive: { type: Boolean, default: true },
		parsedFullName: String,
		twoFactorAuthentication: {
			isActivated: { type: Boolean, default: false },
			authenticationType: { type: String },
			authenticatorSecret: String,
		},
		invalidSigninAttemptsAt: []
	},
	{
		autoIndex: true,
		versionKey: false,
		timestamps: true,
	}
)
schema.pre('save', async function () {
	if (this.isModified('firstName') || this.isModified('lastName')) {
		this.parsedFullName = [this.firstName, this.lastName].filter(Boolean).join(' ')
	}
})

export const UserModel = Model(MODELS.USER, schema)
