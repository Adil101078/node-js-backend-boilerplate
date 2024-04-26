import { Router } from 'express'
import AuthController from '../controllers'
import { Wrap } from '@core/utils'
import { authorize } from '@middlewares/authorizer'

const controller = new AuthController()

const router = Router()

router.post('/sign-up', Wrap(controller.SignUp))
router.post('/verify-otp', Wrap(controller.VerifyOTP))
router.post('/resend-otp', Wrap(controller.ResendOTP))
router.post('/sign-out', authorize, Wrap(controller.SignOut))

export const AuthRouter = router
