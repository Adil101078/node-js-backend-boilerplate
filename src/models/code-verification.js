import { MODELS } from '@core/constant/model'
import { Schema, model as Model } from 'mongoose'
const ObjectId = Schema.Types.ObjectId

export const CodeVerificationPurpose = {
	PRE_SIGNUP: 'PRE_SIGNUP',
	FORGOT_PASSWORD: 'FORGOT_PASSWORD',
	USER_PHONE_UPDATE: 'USER_PHONE_UPDATE',
	SIGNIN_2FA: 'SIGNIN_2FA',
	UPDATE_2FA_SETTING_TO_EMAIL: 'UPDATE_2FA_SETTING_TO_EMAIL',
	UPDATE_2FA_SETTING_TO_PHONE: 'UPDATE_2FA_SETTING_TO_PHONE',
	FORGOT_2FA: 'FORGOT_2FA',
}

export const CodeVerificationStatus = {
	Pending: 'Pending',
	Passed: 'Passed',
	Failed: 'Failed',
}

const schema = new Schema(
	{
		_user: { type: ObjectId },
		phone: String,
		countryCode: String,
		email: { type: String, lowercase: true },
		status: {
			type: String,
			enum: Object.values(CodeVerificationStatus),
			default: CodeVerificationStatus.Pending,
		},
		verificationPerformedAt: Date,
		purpose: {
			type: String,
			enum: Object.keys(CodeVerificationPurpose),
		},
		internalOTP: {
			type: {
				code: String,
				maxRetryAttempt: { type: Number, default: 5 },
				usedRetryAttempt: { type: Number, default: 0 },
				expiresAt: Date,
			},
			select: false,
		},
		verificationLinkToken: {
			type: String,
			select: false,
		},
		resendDuration: {
			type: Number,
		},

		// From Base Model
		isActive: { type: Boolean, default: true },
		_createdBy: { type: ObjectId, ref: MODELS.USER },
		_updatedBy: { type: ObjectId, ref: MODELS.USER },
	},
	{
		autoIndex: true,
		versionKey: false,
		timestamps: true,
	}
)

export const CodeVerificationModel = Model(MODELS.CODE_VERIFICATION, schema)
