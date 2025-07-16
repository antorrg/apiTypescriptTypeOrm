import express, { type Request, type Response, type NextFunction } from 'express'
import eh from '../../../Configs/errorHandlers.js'
import { Auth } from '../auth.js'

const serverTest = express()
serverTest.use(express.json())

serverTest.post('/', Auth.verifyToken, eh.catchController(async (req: Request, res: Response): Promise<void> => {
  const data = req.body
  const decoResponse = (req as any).userInfo
  res.status(200).json({ success: true, message: 'Passed middleware', data, userInfo: decoResponse })
}))

serverTest.post('/roleUser', Auth.verifyToken, Auth.checkRole([1]), eh.catchController(async (req: Request, res: Response): Promise<void> => {
  const data = req.body
  const decoResponse = (req as any).userInfo
  res.status(200).json({ success: true, message: 'Passed middleware', data, userInfo: decoResponse })
}))

serverTest.get('/emailVerify', Auth.verifyEmailToken, eh.catchController(async (req: Request, res: Response): Promise<void> => {
  const decoResponse = (req as any).userInfo
  res.status(200).json({ success: true, message: 'Passed middleware', data: null, userInfo: decoResponse })
}))

serverTest.use((err: Error & { status?: number }, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500
  const message = err.message || 'Internal server error'
  res.status(status).json({
    success: false,
    message,
    data: null
  })
})
export default serverTest
