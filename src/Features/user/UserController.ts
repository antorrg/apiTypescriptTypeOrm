import { type Request, type Response } from 'express'
import { BaseController } from '../../Shared/Controllers/BaseController.js'
import { type UserService } from './UserService.js'
import { type User } from '../../Shared/Entities/user.entity.js'
import { catchController } from '../../Configs/errorHandlers.js'

export class UserController extends BaseController<User> {
  private readonly userService: UserService

  constructor (userService: UserService) {
    super(userService)
    this.userService = userService
  }

  login = catchController(async (req: Request, res: Response) => {
    const data = req.body
    const response = await this.userService.login(data)
    return BaseController.responder(res, 200, true, response.message, response.results)
  })
}
