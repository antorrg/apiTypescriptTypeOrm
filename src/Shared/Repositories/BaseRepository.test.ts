import { beforeAll, afterAll, describe, it, xit, expect } from '@jest/globals'
import { BaseRepository } from './BaseRepository.js'
import { AppDataSource } from '../../Configs/dataSource.js'
import { User } from '../Entities/user.entity.js'
import { infoClean, createUser, newData } from './testHelpers/testHelp.help.js'
import { setStringId, getStringId } from '../../../test/testHelpers/testStore.help.js'
import { userSeeds } from './testHelpers/seeds.help.js'
import { resetDatabase } from '../../../test/jest.setup.js'

/* constructor (
   entityClass: EntityTarget<T>,
       modelName?: string,
       whereField?: string
  ) */

const test = new BaseRepository<User>(User, 'User', 'email')
describe('Unit tests for the BaseRepository class: CRUD operations.', () => {
  afterAll(async () => {
    await resetDatabase()
  })
  describe('The "create" method for creating a service', () => {
    it('should create an item with the correct parameters', async () => {
      const response = await test.create(createUser)
      setStringId(response.results.id)
      expect(response.message).toBe('User created successfully')
      expect(infoClean(response.results)).toEqual({
        id: expect.any(String),
        email: 'userejemplo@example.com',
        picture: 'https://pics.com/u1.jpg',
        isVerify: true,
        role: 1,
        isRoot: false,
        enabled: true
      })
    })
  })
  describe('"GET" methods. Return one or multiple services..', () => {
    beforeAll(async () => {
      const userRepo = AppDataSource.getRepository(User)
      const users = userRepo.create(userSeeds) // crea instancias
      await userRepo.save(users) // guarda todas en la base de datos
    })
    it('"getAll" method: should return an array of services', async () => {
      const response = await test.getAll()
      expect(response.message).toBe('User retrieved')
      expect(response.results.length).toBe(26)
    })
    it('"findWithPagination" method: should return an array of services', async () => {
      const queryObject = { page: 1, limit: 10, filters: {} }
      const response = await test.findWithPagination(queryObject)
      console.log('no order: ', response.results)
      expect(response.message).toBe('User list retrieved')
      expect(response.info).toEqual({ page: 1, limit: 10, totalPages: 3, count: 10, total: 26 })
      expect(response.results.length).toBe(10)
    })
    it('"findWithPagination" method should return page 2 of results', async () => {
      const queryObject = { page: 3, limit: 10, filters: {} }
      const response = await test.findWithPagination(queryObject)
      expect(response.results.length).toBeLessThan(10)
      expect(response.info.page).toBe(3)
      expect(response.results.length).toBe(6)
    })
    it('"findWithPagination" method should return sorted results (by title desc)', async () => {
      const queryObject = { page: 1, limit: 5, sort: { email: 'DESC' as 'DESC' } }
      const response = await test.findWithPagination(queryObject)
      const emails = response.results.map(u => u.email)
      const sorted = [...emails].sort((a, b) => b.localeCompare(a))
      expect(emails).toEqual(sorted)
    })

    it('"getById" method: should return an service', async () => {
      const id = getStringId()
      const response = await test.getById(id)
      expect(response.results).not.toBeNull()
      expect(infoClean(response.results!)).toEqual({
        id: expect.any(String),
        email: 'userejemplo@example.com',
        picture: 'https://pics.com/u1.jpg',
        isVerify: true,
        role: 1,
        isRoot: false,
        enabled: true
      })
    })
    it('"getOne" method: should return an service', async () => {
      const title = 'userejemplo@example.com'
      const response = await test.getOne({ email: title })
      expect(infoClean(response.results!)).toMatchObject({
        id: expect.any(String),
        email: 'userejemplo@example.com',
        picture: 'https://pics.com/u1.jpg',
        isVerify: true,
        role: 1,
        isRoot: false,
        enabled: true
      })
    })
  })
  describe('The "update" method - Handles removal of old images from storage.', () => {
    it('should update the document without removing any images', async () => {
      const id = getStringId()
      const data = newData
      const response = await test.update(id, data)
      expect(response.message).toBe('User updated successfully')
      expect(response.results).toMatchObject({
        id: expect.any(String),
        email: 'userejemplo@example.com',
        picture: 'https:donJose.jpg',
        isVerify: true,
        role: 1,
        isRoot: false,
        enabled: true
      })
    })
  })
  describe('The "delete" method.', () => {
    it('should delete a document successfully (soft delete)', async () => {
      const id = getStringId()
      const response = await test.delete(id)
      expect(response.message).toBe('User deleted successfully')
    })
    it('should throw an error if document do not exist', async () => {
      const id = getStringId()
      try {
        await test.delete(id)
      } catch (error: unknown) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'status' in error &&
          'message' in error
        ) {
          expect(error).toBeInstanceOf(Error)
          expect((error as { status: number }).status).toBe(404)
          expect((error as { message: string }).message).toBe('User not found')
        } else {
          throw error
        }
      }
    })
  })
})
