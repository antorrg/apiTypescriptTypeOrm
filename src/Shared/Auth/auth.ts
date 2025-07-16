import { type Request, type Response, type NextFunction } from 'express'
import pkg, { type Secret } from 'jsonwebtoken'
import crypto from 'crypto'
import eh from '../../Configs/errorHandlers.js'
import envConfig from '../../Configs/envConfig.js'

export interface JwtPayload {
  userId: string
  email: string
  internalData: string
  iat?: number
  exp?: number
}

export class Auth {
  static generateToken (user: { id: string, email: string, role: number }, expiresIn?: string | number): string {
    const intData = disguiseRole(user.role, 5)
    const jwtExpiresIn: string | number = expiresIn ?? Math.ceil(envConfig.ExpiresIn * 60 * 60)
    const secret: Secret = envConfig.Secret
    return pkg.sign(
      { userId: user.id, email: user.email, internalData: intData },
      secret,
      { expiresIn: jwtExpiresIn as any }
    )
  }

  static generateEmailVerificationToken (user: { id: string }, expiresIn?: string | number) {
    const userId = user.id
    const secret: Secret = envConfig.Secret
    const jwtExpiresIn: string | number = expiresIn ?? '8h'
    return pkg.sign(
      { userId, type: 'emailVerification' },
      secret,
      { expiresIn: jwtExpiresIn as any }
    )
  }

  static async verifyToken (req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let token: string | undefined = (req.headers['x-access-token'] as string) || req.headers.authorization
      if (!token) {
        next(eh.middError('Unauthorized access. Token not provided', 401)); return
      }
      if (token.startsWith('Bearer')) {
        token = token.slice(6).trim()
      }
      if (token === '' || token === 'null' || token === 'undefined') {
        next(eh.middError('Missing token!', 401)); return
      }

      const decoded = pkg.verify(token, envConfig.Secret) as JwtPayload

      // req.user = decoded
      const userId = decoded.userId
      const userRole = recoveryRole(decoded.internalData, 5)
      req.userInfo = { userId, userRole }

      next()
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        next(eh.middError('Expired token', 401)); return
      }
      next(eh.middError('Invalid token', 401))
    }
  }

  static async verifyEmailToken (req: Request, res: Response, next: NextFunction): Promise<void> {
    let token = req.query.token as string
    token = token.trim()
    if (token === '' || token === 'null' || token === 'undefined') {
      next(eh.middError('Verification token missing!', 400)); return
    }
    try {
      const decoded = pkg.verify(token, envConfig.Secret) as any
      if (decoded.type !== 'emailVerification') {
        next(eh.middError('Invalid token type', 400)); return
      }
      // Adjunta el userId al request para el siguiente handler/service
      req.userInfo = { userId: decoded.userId }
      next()
    } catch (error) {
      next(eh.middError('Invalid or expired token', 400))
    }
  }

  static checkRole (allowedRoles: number[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const { userRole } = (req.userInfo != null) || {}
      if (typeof userRole === 'number' && allowedRoles.includes(userRole)) {
        next()
      } else {
        next(eh.middError('Access forbidden!', 403))
      }
    }
  }
}

// Funciones auxiliares (pueden ir fuera de la clase)
function disguiseRole (role: number, position: number): string {
  const generateSecret = (): string => crypto.randomBytes(10).toString('hex')
  const str = generateSecret()
  if (position < 0 || position >= str.length) throw new Error('Posición fuera de los límites de la cadena')
  const replacementStr = role.toString()
  return str.slice(0, position) + replacementStr + str.slice(position + 1)
}

function recoveryRole (str: string, position: number): number {
  if (position < 0 || position >= str.length) throw new Error('Posición fuera de los límites de la cadena')
  const recover = str.charAt(position)
  return parseInt(recover)
}

// En recoveryRole str es el dato entrante (string)
// Este es un modelo de como recibe el parámetro checkRole:
// todo   app.get('/ruta-protegida', checkRole([3]),
