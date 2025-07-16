import { type Request, type Response, type NextFunction } from 'express'
import { type User } from '../../Shared/Entities/user.entity.js'

export type UserInfo = Pick<User, 'id' | 'email' | 'nickname' | 'picture' | 'name' | 'surname' | 'country' | 'role' | 'isVerify' | 'isRoot' | 'enabled'>

interface FieldItem { name: string, type: 'string' | 'int' | 'float' | 'boolean' | 'array' }

export interface ParsedUserInfo {
  id: string
  email: string
  nickname: string
  picture: string
  name?: string
  surname?: string
  country?: string
  isVerify: boolean
  role: string
  isRoot: boolean
  enabled: boolean
}

export class UserDto {
  static infoClean (data: UserInfo): ParsedUserInfo {
    return {
      id: data.id,
      email: data.email,
      nickname: data.nickname,
      picture: data.picture,
      name: data.name || '',
      surname: data.surname || '',
      country: data.country || '',
      role: roleScope(data.role),
      isVerify: data.isVerify,
      isRoot: data.isRoot,
      enabled: data.enabled
    }
  }

  static parsedUser (req: Request, res: Response, next: NextFunction) {
    const newNickname = req.body.email.split('@')[0]
    const numberRole = revertScope(req.body.role)
    req.body.nickname = newNickname
    req.body.role = numberRole
    next()
  }
}
export const create: FieldItem[] = [
  { name: 'email', type: 'string' },
  { name: 'password', type: 'string' }
]
export const update: FieldItem[] = [
  { name: 'email', type: 'string' },
  { name: 'password', type: 'string' },
  { name: 'picture', type: 'string' },
  { name: 'name', type: 'string' },
  { name: 'surname', type: 'string' },
  { name: 'country', type: 'string' },
  { name: 'role', type: 'string' },
  { name: 'enabled', type: 'boolean' }
]
function roleScope (data: number): string {
  const cases: Record<number, string> = {
    1: 'User',
    2: 'Moderator',
    3: 'Admin',
    9: 'SuperAdmin'
  }
  return cases[data] || 'User'
}
export function revertScope (data: string): number {
  const cases: Record<string, number> = {
    User: 1,
    Moderator: 2,
    Admin: 3
  }
  return cases[data] || 1
}
