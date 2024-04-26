class OTP {
	async VerifyCode(payload, code) {
		const verifyCodeResponse = null
		if (payload.existingCodeVerification.internalOTP) {
			const outputResponse = {
				VerificationResponse: {
					Valid: false,
				},
			}

			outputResponse.VerificationResponse.Valid = false
			const existingCodeVerification = payload.existingCodeVerification
			if (existingCodeVerification.internalOTP.code == code) {
				outputResponse.VerificationResponse.Valid = true
			} else {
				existingCodeVerification.internalOTP.usedRetryAttempt++
			}

			return outputResponse
		}

		return verifyCodeResponse
	}
}

export default new OTP()
