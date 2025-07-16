import { expect } from '@jest/globals'
import { type User } from '../../Entities/user.entity'

export interface IUser {
  id: string
  email: string
  password: string
  nickname: string
  picture: string
  name: string
  surname: string
  country: string
  role: number
  isVerify: boolean
  isRoot: boolean
  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date
  enabled: boolean

}

export interface ParsedInfo {
  id: string
  email: string
  picture: string
  role: number
  isVerify: boolean
  isRoot: boolean
  enabled: boolean
}

export const infoClean = (data: User): ParsedInfo => {
  return {
    id: data.id,
    email: data.email,
    picture: data.picture,
    role: data.role,
    isVerify: data.isVerify,
    isRoot: data.isRoot,
    enabled: data.enabled
  }
}
export const createUser: Partial<User> = {
  email: 'userejemplo@example.com',
  password: 'password1',
  nickname: 'userejemplo',
  picture: 'https://pics.com/u1.jpg',
  name: 'Jose',
  surname: 'Ejemplo',
  country: 'Argentina',
  isVerify: true,
  role: 1,
  isRoot: false,
  enabled: true
}

export const newData: Omit<ParsedInfo, 'id'> = {
  email: 'userejemplo@example.com',
  picture: 'https:donJose.jpg',
  isVerify: true,
  role: 1,
  isRoot: false,
  enabled: true
}

export const responseNewData: any = {
  id: expect.any(String),
  email: 'userejemplo@example.com',
  picture: 'https:donJose.jpg',
  isVerify: true,
  role: 1,
  isRoot: false,
  enabled: true
}
