import envConfig from '../../Configs/envConfig.js'
import { loadComponentSchemas } from './loadComponents.js'
import fs from 'fs'
import path from 'path'

function getJsdocFiles (dir: string): string[] {
  const absDir = path.resolve(process.cwd(), dir)
  return fs.readdirSync(absDir)
    .filter(file => file.endsWith('.jsdoc.ts') || file.endsWith('.jsdoc.js'))
    .map(file => path.join(dir, file).replace(/\\/g, '/'))
}
const apis = getJsdocFiles('./src/Shared/Swagger/schemas')

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'apiTypescriptTypeOrm',
      version: '1.0.0',
      description: 'Documentación de mi API apiTypescriptTypeOrm con Swagger. Este modelo es ilustrativo'
    },

    servers: [
      {
        url: `http://localhost:${envConfig.Port}`
      }
    ],
    components: {
      schemas: loadComponentSchemas(),
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
    // security: [
    //   {
    //     bearerAuth: []
    // }
    // ]
  },
  apis,
  swaggerOptions: {
    docExpansion: 'none' // 👈 Oculta todas las rutas al cargar
  }
}

export default swaggerOptions
