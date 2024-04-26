import { Router } from 'express'
import { AuthRouter } from './modules/auth/routes'
import { authorize } from './middlewares/authorizer'
import { CodeVerificationRouter } from '@modules/code-verification/routes'
const router = Router()

router.use('/auth', AuthRouter)
router.use('/code-verification', CodeVerificationRouter)
router.use(authorize)

export const AppRoutes = router
