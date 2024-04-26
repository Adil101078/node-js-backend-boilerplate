const APP_PORT = parseInt(process.env.DEV_PORT)
const DOMAIN_NAME = process.env.DOMAIN_NAME ?? 'localhost'
const HTTP_PROTOCOL = process.env.HTTP_PROTOCOL ?? 'http'

export default () => ({
	PORT: APP_PORT,
	HOST:
		process.env.HOST ??
		`${HTTP_PROTOCOL}://${DOMAIN_NAME}${APP_PORT == 80 ? '' : `:${APP_PORT}`}`,
	ENVIRONMENT: 'development',

	DB_CONNECTION_STRING: process.env.DEV_DB_CONNECTION_STRING,
	ITEMS_PER_PAGE: Number(process.env.ITEMS_PER_PAGE) || 10,

	OTP_EXPIRES_IN: parseInt(process.env.OTP_EXPIRES_IN),

	JWT_SECRET: process.env.JWT_SECRET,
	JWT_EXPIRY: process.env.JWT_EXPIRY,
  
	DB_CONNECTION_OPTIONS: {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	},
	AWS: {
		SNS_REGION: process.env.SNS_REGION,
	},
	// Gateway SMS
	GATEWAY_SMS: {
		AUTH_TOKEN: process.env.GATEWAY_TOKEN,
		BASE_URL: process.env.GATEWAY_BASE_URL,
	},
})
