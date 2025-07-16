import { BaseRepository } from '../Repositories/BaseRepository.js'
import { AppDataSource } from '../../Configs/dataSource.js'
import { User } from '../Entities/user.entity.js'
import { BaseService } from './BaseService.js'
import { createUser, infoClean, newData } from '../Repositories/testHelpers/testHelp.help.js'
import { setStringId, getStringId } from '../../../test/testHelpers/testStore.help.js'
import { deletFunctionTrue, deletFunctionFalse } from '../../../test/generalFunctions.js'
import { userSeeds } from '../Repositories/testHelpers/seeds.help.js'
import { resetDatabase } from '../../../test/jest.setup.js'
import { v4 as uuidv4 } from 'uuid'

/*
    constructor(
      repository: BaseRepository<T>,
      useImages = false,
      deleteImages?: typeof deletFunctionTrue,
      parserFunction?: ParserFunction<T>
  ) */

const repository = new BaseRepository<User>(User, 'User', 'email')
const testImsSuccess = new BaseService<User>(repository, true, deletFunctionTrue, infoClean)
const testImgFailed = new BaseService<User>(repository, true, deletFunctionFalse, infoClean)
const testParsed = new BaseService<User>(repository, false, deletFunctionFalse, infoClean)

describe('Unit tests for the BaseService class: CRUD operations.', () => {
  afterAll(async () => {
    await resetDatabase()
  })
  describe('The "create" method for creating a service', () => {
    it('should create an item with the correct parameters', async () => {
      const response = await testParsed.create(createUser)
      setStringId(response.results.id)
      expect(response.message).toBe('User created successfully')
      expect(response.results).toEqual({
        id: expect.any(String),
        email: 'userejemplo@example.com',
        picture: 'https://pics.com/u1.jpg',
        isVerify: true,
        role: 1,
        isRoot: false,
        enabled: true
      })
    })
    it('should throw an error when attempting to create the same item twice (error handling)', async () => {
      try {
        await testParsed.create(createUser)
        throw new Error('❌ Expected a duplication error, but none was thrown')
      } catch (error: unknown) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'status' in error &&
          'message' in error
        ) {
          expect((error as { status: number }).status).toBe(400)
          expect(error).toBeInstanceOf(Error)
          expect((error as { message: string }).message).toBe('This User already exists')
        } else {
          throw error // Re-lanza si no es el tipo esperado
        }
      }
    })
  })
  describe('"GET" methods. Return one or multiple services..', () => {
    beforeAll(async () => {
      const userRepo = AppDataSource.getRepository(User)
      const users = userRepo.create(userSeeds) // crea instancias
      await userRepo.save(users) // guarda todas en la base de datos
    })
    it('"getAll" method: should return an array of services', async () => {
      const response = await testParsed.getAll()
      expect(response.message).toBe('User retrieved')
      expect(response.results.length).toBe(26)
    })
    it('"findWithPagination" method: should return an array of services', async () => {
      const queryObject = { page: 1, limit: 10, filters: {}, sort: {} }
      const response = await testParsed.findWithPagination(queryObject)
      expect(response.message).toBe('User list retrieved')
      expect(response.info).toEqual({ page: 1, limit: 10, totalPages: 3, count: 10, total: 26 })
      expect(response.results.length).toBe(10)
    })
    it('"findWithPagination" method should return page 2 of results', async () => {
      const queryObject = { page: 2, limit: 10, filters: {}, sort: {} }
      const response = await testParsed.findWithPagination(queryObject)
      expect(response.results.length).toBeLessThanOrEqual(10)
      expect(response.info.page).toBe(2)
    })
    it('"findWithPagination" method should return sorted results (by user desc)', async () => {
      const queryObject = { page: 1, limit: 5, sort: { email: 'DESC' as 'DESC' } }
      const response = await testParsed.findWithPagination(queryObject)
      const emails = response.results.map(u => u.email)
      const sorted = [...emails].sort((a, b) => b.localeCompare(a))
      expect(emails).toEqual(sorted)
    })
    it('"getById" method: should return an service', async () => {
      const id = getStringId()
      const response = await testParsed.getById(id)
      expect(response.results).toEqual({
        id: expect.any(String),
        email: 'userejemplo@example.com',
        picture: 'https://pics.com/u1.jpg',
        isVerify: true,
        role: 1,
        isRoot: false,
        enabled: true
      })
    })
    it('"getById" should throw an error if service not exists', async () => {
      try {
        const id = uuidv4()
        await testParsed.getById(id)
        throw new Error('❌ Expected a "Not found" error, but none was thrown')
      } catch (error: unknown) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'status' in error &&
          'message' in error
        ) {
          expect((error as { status: number }).status).toBe(404)
          expect(error).toBeInstanceOf(Error)
          expect((error as { message: string }).message).toBe('User not found')
        } else {
          throw error
        }
      }
    })
    it('"getOne" method: should return an service', async () => {
      const name = 'userejemplo@example.com'
      const response = await testParsed.getOne({ email: name })
      expect(response.results).toEqual({
        id: expect.any(String),
        email: 'userejemplo@example.com',
        picture: 'https://pics.com/u1.jpg',
        isVerify: true,
        role: 1,
        isRoot: false,
        enabled: true
      })
    })
    it('"getOne" should throw an error if service not exists', async () => {
      try {
        const name = 'bartolomiau@yahoo.com.ar'
        await testParsed.getOne({ email: name })
        throw new Error('❌ Expected a "Not found" error, but none was thrown')
      } catch (error: unknown) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'status' in error &&
          'message' in error
        ) {
          expect((error as { status: number }).status).toBe(404)
          expect(error).toBeInstanceOf(Error)
          expect((error as { message: string }).message).toBe('This User not found')
        } else {
          throw error
        }
      }
    })
  })
  describe('The "update" method - Handles removal of old images from storage.', () => {
    it('should update the document without removing any images', async () => {
      const id = getStringId()
      const data = newData
      const response = await testParsed.update(id, data)
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
    it('should update the document and remove the previous image', async () => {
      const id = getStringId()
      const newData = { picture: 'https://imagen.com.ar' }
      const response = await testImsSuccess.update(id, newData)
      expect(response.message).toBe('User updated successfully')
    })
    it('should throw an error if image deletion fails during update', async () => {
      const id = getStringId()
      const newData = { picture: 'https://imagen44.com.ar' }
      try {
        const resp = await testImgFailed.update(id, newData)
        throw new Error('❌ Expected a update error, but none was thrown')
      } catch (error: unknown) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'status' in error &&
          'message' in error
        ) {
          expect(error).toBeInstanceOf(Error)
          expect((error as { status: number }).status).toBe(500)
          expect((error as { message: string }).message).toBe('Error processing ImageUrl: https://imagen.com.ar')
        } else {
          throw error
        }
      }
    })
  })
  describe('The "delete" method.', () => {
    it('should delete a document successfully (soft delete)', async () => {
      const id = getStringId()
      const response = await testImsSuccess.delete(id)
      expect(response.message).toBe('User deleted successfully')
    })
    it('should throw an error if document do not exist', async () => {
      const id = getStringId()
      try {
        await testImgFailed.delete(id)
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
