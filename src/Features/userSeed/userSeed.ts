import envConfig from '../../Configs/envConfig.js'
import { userService } from '../user/user.route.js'

export const admin = { email: envConfig.UserRootEmail, password: envConfig.UserRootPass, role: 9, isRoot: true }

export const user = { email: 'bartolomiau@gmail.com', password: 'L1234567', role: 1, isRoot: false }

export const userSeed = async () => {
  try {
    // Crear los usuarios si no existen
    const seed = await userService.getAll()
    if (seed.results.length > 0) {
      console.log('Users already exists')
      return
    }
    await Promise.all([userService.create(admin), userService.create(user)])
    console.log('Users created successfully!')
  } catch (error) {
    console.error('Error creating users: ', error)
    throw error
  }
}
