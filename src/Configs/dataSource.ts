import 'reflect-metadata'
import { DataSource } from 'typeorm'
import envConfig from './envConfig.js'
import { User } from '../Shared/Entities/user.entity.js'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: envConfig.DbPass,
  database: envConfig.DbName,
  dropSchema: envConfig.Status === 'test',
  synchronize: envConfig.Status === 'test',
  logging: false,
  entities: [User],
  subscribers: [],
  migrations: []
})

export const Starter = async () => {
  try {
    await AppDataSource.initialize()
    console.log('🟢 Data Source has been initialized! ✔️')
  } catch (error) {
    console.error('🔴 Error during Data Source initialization:')
    throw error
  }
}
