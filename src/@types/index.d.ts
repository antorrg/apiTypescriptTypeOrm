import { type JwtPayload } from '../Shared/Auth/auth.ts' // Ajusta la ruta si es necesario

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
      userInfo?: { userId?: string, userRole?: number }
    }
  }
}
