import { Router } from 'express'
import controllers from '../controllers'
import { Wrap } from '@core/utils'
import { dynamic, DynamicRoutes } from '@middlewares/dynamic'

const router = Router()

router.post('/verify', Wrap(controllers.CodeVerification))
router.get('/:_codeVerification', Wrap(controllers.Get))
router.post('/request', dynamic(DynamicRoutes.CodeVerificationRequest), Wrap(controllers.CodeVerificationRequest))

router.post('/resend-request/:_codeVerification', Wrap(controllers.ResendRequest))

export const CodeVerificationRouter = router
