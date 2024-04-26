const Messages = {
	GeneralError: {
		UserNotFound: 'User not found.',
		AccountBlockedByAdmin: `Your account has been deactivated by the administrator, for more updates kindly contact ${process.env.SUPPORT_EMAIL}.`,
	},
	CodeVerification: {
		Success: {
			GetSuccess: 'Verification status fetched successfully.',
			CodeSent: 'Verification {{type}} has been sent to your {{to}}.',
			CodeVerified: 'Verification code verified successfully.',
			CodeResent: 'Verification {{type}} has been re-sent to your {{to}}.',
		},
		Error: {
			CodeVerificationNotFound: 'Code verification request is not found.',
			InvalidLink: 'Invalid Link!',
			UserNotExists: 'Sorry, we could not find your account.',
			ForgotPasswordSocialAccountNotAllowed:
				'Your account is created with Social Signup, please try with Social Login!',
			UserEmailUpdateInSocialAccountNotAllowed:
				"Your account is created with Social Signup, can't update email!",
			TwoFactorAuthenticationSettingsNotAvailable: 'Your account did not have 2FA Settings.',
			TwoFactorAuthenticationAlreadySet: '2FA Already Set.',
			RequiredDetailFor2FANotAvailable: 'Please set your {{detail}} first.',
			ResendLimitExceeded: 'You have exceeded the limits, please try again in some time.',
			ResendIsNotAvailable:
				'You are allowed to resend after {{resendShouldGetAllowedInSeconds}} seconds.',
			SessionExpired: 'This session has expired!',
			CodeVerificationExpired: 'Verification {{type}} has expired.',
			CodeVerificationFailed: 'Verification code is invalid.',
			IncorrectCode: 'The verification code password is incorrect. Please try again',
			MissingRecordToVerify: 'No record found for verification.',
			AccountBlockedDueToMultipleAttempts:
				'Your account has been blocked for {{timeLeftToUnblock}}. Please try again later.',
			DisabledAccount: 'Your account has been disabled.',
			EmailAlreadyInUse: 'Email is already in use.',
			PhoneAlreadyInUse: 'Phone is already in use.',
		},
	},
	Helpers: {
		OTPHelper: {
			CodeSentSuccessFullyOverEmail:
				'This is your One Time Password: {{OTP}} from {{BrandName}}',
		},
		VerifyLinkHelper: {
			ForgotPasswordSMS: 'Link {{verifyLink}} from {{BrandName}}',
		},
		JWTHelper: {
			TokenExpired: 'Token Expired! Please signin again.',
		},
	},
	Auth: {
		Success: {
			SigninSuccessful: 'Logged in successfully.'
		},
		Error: {},
	},
}
export default Messages
