import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import eh from './Configs/errorHandlers.js'
import mainRouter from './routes.js'
import swaggerUi from 'swagger-ui-express'
import swaggerJsDoc from 'swagger-jsdoc'
import swaggerOptions from './Shared/Swagger/swaggerOptions.js'
import envConfig from './Configs/envConfig.js'

const swaggerDocs = swaggerJsDoc(swaggerOptions)
const swaggerUiOptions = {
  swaggerOptions: {
    docExpansion: 'none' // 👈 Oculta todas las rutas al cargar
  }
}
const app = express()
app.use(morgan('dev'))
app.use(cors())
app.use(express.json())
app.use(eh.jsonFormat)
// Habilita Swagger:
if (envConfig.Status === 'development') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOptions))
}
app.use(mainRouter)
app.use(eh.notFoundRoute)
app.use(eh.errorEndWare)

export default app
