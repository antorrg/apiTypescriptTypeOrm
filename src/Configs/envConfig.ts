import dotenv from 'dotenv'
// Configuración de archivos .env según ambiente
const configEnv: Record<string, string> = {
  development: '.env.development',
  test: '.env.test',
  production: '.env'
}
const envFile = configEnv[process.env.NODE_ENV || 'production']
// Determinamos el ambiente y archivo .env a usar
const env = process.env.NODE_ENV || 'production'

// Cargamos las variables de entorno del archivo correspondiente
dotenv.config({ path: envFile })

// Interface para las variables de entorno
interface EnvVariables {
  PORT: number
  NODE_ENV: string
  DB_PASSWORD: string
  DB_NAME: string
  JWT_EXPIRES_IN: number
  JWT_SECRET: string
  USER_IMG: string
  USER_ROOT_EMAIL: string
  USER_ROOT_PASS: string

  // Aquí puedes añadir más variables que necesites
}

// Función para obtener y validar las variables de entorno
function getEnvConfig (): EnvVariables {
  return {
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: process.env.NODE_ENV || 'production',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_NAME: process.env.DB_NAME || '',
    JWT_EXPIRES_IN: parseInt(process.env.JWT_EXPIRES_IN || '1', 10),
    JWT_SECRET: process.env.JWT_SECRET || '',
    USER_IMG: process.env.USER_IMG || '',
    USER_ROOT_EMAIL: process.env.USER_ROOT_EMAIL || '',
    USER_ROOT_PASS: process.env.USER_ROOT_PASS || ''
  }
}

// Obtenemos el estado del ambiente
const status: string = Object.keys(configEnv).find(
  (key) => configEnv[key] === envFile
) || 'production'

// Creamos la configuración final
const envConfig = {
  Port: getEnvConfig().PORT,
  Status: status,
  DbPass: getEnvConfig().DB_PASSWORD,
  DbName: getEnvConfig().DB_NAME,
  ExpiresIn: getEnvConfig().JWT_EXPIRES_IN,
  Secret: getEnvConfig().JWT_SECRET,
  UserImg: getEnvConfig().USER_IMG,
  UserRootEmail: getEnvConfig().USER_ROOT_EMAIL,
  UserRootPass: getEnvConfig().USER_ROOT_PASS

}

export default envConfig
