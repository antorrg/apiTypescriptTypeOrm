import { userService } from '../../src/Features/user/user.route.js'
import { setAdminToken, setUserToken } from './testStore.help.js'

//* Por causa de los métodos de creación (con usuario preexistente) el usuario debe crearse antes.

export const admin = { email: 'josenomeacuerdo@hotmail.com', password: 'L1234567', role: 9, isRoot: true }

export const user = { email: 'juangarcia@gmail.com', password: 'L1234567', role: 1, isRoot: false }

export const setTokens = async () => {
  try {
    // Crear los usuarios si no existen
    await Promise.all([userService.create(admin), userService.create(user)])

    // Iniciar sesión y almacenar los tokens
    const [adminToken, userToken] = await Promise.all([
      userService.login(admin),
      userService.login(user)
    ])

    // Guardar los tokens en el almacenamiento de pruebas
    setAdminToken(adminToken.results.token) // Asume que esto guarda el token admin
    setUserToken(userToken.results.token) // Asume que esto guarda el token user
    console.log('todo ok')
  } catch (error) {
    console.error('Error al configurar los tokens:', error)
    throw error
  }
}
