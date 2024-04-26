// import '@core/declarations'
import { resolve } from 'path'
import { App } from '@core/globals'
import jwt from 'jsonwebtoken'
import { generateKeyPairSync } from 'crypto'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'

class JWTHelper {
	JWT_SECRET = process.env.JWT_SECRET
	JWT_EXPIRY = process.env.JWT_EXPIRY
	keyDir = resolve(`${__dirname}/../../keys`)
	publicKeyPath = resolve(`${this.keyDir}/rsa.pub`)
	privateKeyPath = resolve(`${this.keyDir}/rsa`)

	/**
	 * Get token user
	 * @param {string} token
	 * @returns
	 */
	async GetUser(payload) {
		const { token } = payload
		const verification = this.VerifyToken(token)

		if (verification.sub) {
			const user = await App.Models.User.findOne({
				_id: verification.sub,
				// isActive: true,
				// 'loginSessions.sessionIdentifier': verification?.sessionIdentifier,
			})

			// delete user?.password
			return {
				user,
				sessionIdentifier: verification?.sessionIdentifier,
			}
		}

		// error handling if token is expired
		if (verification?.name == 'TokenExpiredError') {
			return {
				error: {
					message: 'Token Expired',
					name: verification.name,
				},
			}
		}
		return null
	}

	/**
	 * Verify the token with rsa public key.
	 * @param {string} token
	 * @returns string | JwtPayload
	 */
	VerifyToken(token) {
		try {
			const publicKey = readFileSync(this.publicKeyPath)
			return jwt.verify(token, publicKey, {
				algorithms: ['RS256'],
			})
		} catch (error) {
			return error
		}
	}

	/**
	 * Create a signed JWT with the rsa private key.
	 * @param {*} payload
	 * @returns token
	 */
	GenerateToken(payload) {
		const { _id: _user } = payload

		const privateKey = readFileSync(this.privateKeyPath)

		const jwtPayload = {
			roles: payload.roles,
		}
		return jwt.sign(
			jwtPayload,
			{ key: privateKey.toString(), passphrase: this.JWT_SECRET },
			{
				algorithm: 'RS256',
				expiresIn: this.JWT_EXPIRY,
				subject: _user,
			}
		)
	}

	/**
	 * Generates RSA Key Pairs for JWT authentication
	 * It will generate the keys only if the keys are not present.
	 */
	GenerateKeys() {
		try {
			const keyDir = this.keyDir
			const publicKeyPath = this.publicKeyPath
			const privateKeyPath = this.privateKeyPath

			const JWT_SECRET = this.JWT_SECRET

			// Throw error if JWT_SECRET is not set
			if (!JWT_SECRET) {
				throw new Error('JWT_SECRET is not defined.')
			}

			// Check if config/keys exists or not
			if (!existsSync(keyDir)) {
				mkdirSync(keyDir)
			}

			// Check if PUBLIC and PRIVATE KEY exists else generate new
			if (!existsSync(publicKeyPath) && !existsSync(privateKeyPath)) {
				const result = generateKeyPairSync('rsa', {
					modulusLength: 4096,
					publicKeyEncoding: {
						type: 'spki',
						format: 'pem',
					},
					privateKeyEncoding: {
						type: 'pkcs8',
						format: 'pem',
						cipher: 'aes-256-cbc',
						passphrase: JWT_SECRET,
					},
				})

				const { publicKey, privateKey } = result
				writeFileSync(`${keyDir}/rsa.pub`, publicKey, { flag: 'wx' })
				writeFileSync(`${keyDir}/rsa`, privateKey, { flag: 'wx' })
				Logger.warn('New public and private key generated.')
			}
		} catch (error) {
			Logger.error(error)
		}
	}
}

// All Done
export const JwtHelper = new JWTHelper()
export default new JWTHelper()
