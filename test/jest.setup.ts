import { AppDataSource } from '../src/Configs/dataSource.js'
import { beforeAll, afterAll } from '@jest/globals'

// Inicializa la base de datos PostgreSQL antes de las pruebas
async function initializeDatabase () {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
      console.log('Base de datos PostgreSQL inicializada correctamente ✔️')
    }
    // Limpia todas las tablas antes de empezar (opcional)
    for (const entity of AppDataSource.entityMetadatas) {
      const repository = AppDataSource.getRepository(entity.name)
      await repository.clear()
    }
    console.log('Tablas limpiadas antes de las pruebas')
  } catch (error) {
    console.error('Error inicializando DB PostgreSQL ❌', error)
  }
}

// Resetea la base de datos antes de cada prueba si es necesario
export async function resetDatabase () {
  try {
    for (const entity of AppDataSource.entityMetadatas) {
      const repository = AppDataSource.getRepository(entity.name)
      await repository.clear()
    }
    console.log('Tablas reseteadas ✔️')
  } catch (error) {
    console.error('Error reseteando TypeOrm ❌', error)
  }
}

beforeAll(async () => {
  await initializeDatabase()
})

// afterEach(async () => {
//   await resetDatabase()
// })

afterAll(async () => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
      console.log('Conexión TypeOrm cerrada ✔️')
    }
  } catch (error) {
    console.error('Error cerrando conexión TypeOrm ❌', error)
  }
})
