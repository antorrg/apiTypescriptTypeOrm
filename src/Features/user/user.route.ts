import { Router } from 'express'
import { UserService } from './UserService.js'
import { UserController } from './UserController.js'
import { MiddlewareHandler } from '../../Shared/Middlewares/MiddlewareHandler.js'
import { UserDto, create, update } from './userDto.js'
import { Auth } from '../../Shared/Auth/auth.js'

export const userService = new UserService()
const user = new UserController(userService)

const password: RegExp = /^(?=.*[A-Z]).{8,}$/
const email: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const userRouter = Router()

userRouter.get(
  '/',
  Auth.verifyToken,
  user.getAll
)

userRouter.get(
  '/:id',
  Auth.verifyToken,
  MiddlewareHandler.middUuid('id'),
  user.getById
)

userRouter.post(
  '/create',
  Auth.verifyToken,
  MiddlewareHandler.validateFields(create),
  MiddlewareHandler.validateRegex(
    email,
    'email',
    'Enter a valid email'
  ),
  MiddlewareHandler.validateRegex(
    password,
    'password',
    'Enter a valid password'
  ),
  user.create
)

userRouter.post(
  '/login',
  MiddlewareHandler.validateFields(create),
  MiddlewareHandler.validateRegex(
    email,
    'email',
    'Enter a valid email'
  ),
  MiddlewareHandler.validateRegex(
    password,
    'password',
    'Enter a valid password'
  ),
  user.login
)

userRouter.put(
  '/:id',
  Auth.verifyToken,
  MiddlewareHandler.middUuid('id'),
  MiddlewareHandler.validateFields(update),
  UserDto.parsedUser,
  user.update
)

userRouter.delete(
  '/:id',
  Auth.verifyToken,
  MiddlewareHandler.middUuid('id'),
  user.delete
)

export default userRouter
