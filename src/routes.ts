import { Router } from 'express'
import userRouter from './Features/user/user.route.js'

const mainRouter = Router()

mainRouter.use('/api/v1/user', userRouter)

export default mainRouter
