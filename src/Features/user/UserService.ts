import bcrypt from 'bcrypt'
import { BaseService } from '../../Shared/Services/BaseService.js'
import { throwError } from '../../Configs/errorHandlers.js'
import { Auth } from '../../Shared/Auth/auth.js'
import { User } from '../../Shared/Entities/user.entity.js'
import { UserDto } from './userDto.js'
import envConfig from '../../Configs/envConfig.js'
import { BaseRepository } from '../../Shared/Repositories/BaseRepository.js'

interface loginResponse { user: any, token: string }

const userRepository = new BaseRepository<User>(User, 'User', 'email')
type createUser = Pick<User, 'email' | 'password' | 'role' | 'isRoot'>
type login = Pick<User, 'email' | 'password'>

export class UserService extends BaseService<User> {
  constructor () {
    super(
      userRepository,
      false, // useImages
      undefined, // deleteImages
      UserDto.infoClean // parserFunction
    )
  }

  async create (data: createUser): Promise<{ message: string, results: any }> {
    // Verifica unicidad usando el repositorio
    const exists = await this.repository.getOne({ email: data.email }).catch(() => null)
    if ((exists?.results != null)) {
      throwError('This email already exists', 400)
    }

    const newData: Partial<User> = {
      email: data.email,
      password: await bcrypt.hash(data.password, 12),
      nickname: data.email.split('@')[0],
      picture: envConfig.UserImg,
      role: data.role || 1,
      isRoot: data.isRoot || false
    }
    const res = await this.repository.create(newData)
    return {
      ...res,
      results: (this.parserFunction != null) ? this.parserFunction(res.results) : res.results
    }
  }

  async login (data: login): Promise<{ message: string, results: loginResponse }> {
    // Busca el usuario usando el repositorio
    const userRes = await this.repository.getOne({ email: data.email }).catch(() => null)
    const userFound = userRes?.results
    if (userFound == null) { throwError('User not found', 404) }
    const hash: string | null = userFound!.password
    const passwordMatch = await bcrypt.compare(data.password, hash)
    if (!passwordMatch) { throwError('Invalid password', 400) }
    if (!userFound!.enabled) { throwError('User is blocked', 400) }
    const token = Auth.generateToken({
      id: userFound!.id,
      email: userFound!.email,
      role: userFound!.role
    })
    return {
      message: 'Login successfully',
      results: {
        user: (this.parserFunction != null) ? this.parserFunction(userFound!) : userFound,
        token
      }
    }
  }
}
