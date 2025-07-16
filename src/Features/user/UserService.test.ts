import { UserService } from './UserService.js'
import { resetDatabase } from '../../../test/jest.setup.js'
import { userCreated, userRootCreated } from './testHelpers/user.helperTest.help.js'
import { setStringId, getStringId } from '../../../test/testHelpers/testStore.help.js'

const test = new UserService()

describe('Unit tests for the BaseService class: CRUD operations.', () => {
  afterAll(async () => {
    await resetDatabase()
  })
  describe('The create method for creating a user', () => {
    it('should create an user with the correct parameters', async () => {
      const dataUser = { email: 'usuario@ejemplo.com', password: 'L1234567' }
      const response = await test.create(dataUser)
      setStringId(response.results.id)
      expect(response.message).toBe('User usuario@ejemplo.com created successfully')
      expect(response.results).toMatchObject(userCreated)
    })
    it('should throw an error when attempting to create the same user twice (error handling)', async () => {
      const dataUser = { email: 'usuario@ejemplo.com', password: 'L1234567' }
      try {
        await test.create(dataUser)
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
          expect((error as { message: string }).message).toBe('This email already exists')
        } else {
          throw error
        }
      }
    })
    it('should create an root user with the correct parameters (super user)', async () => {
      const dataUser = { email: 'usuarioroot@ejemplo.com', password: 'L1234567', role: 3, isRoot: true }
      const response = await test.create(dataUser)
      expect(response.message).toBe('User usuarioroot@ejemplo.com created successfully')
      expect(response.results).toMatchObject(userRootCreated)
    })
  })
  describe('Login method for authenticate a user.', () => {
    it('should authenticate the user and return a message, user data, and a token', async () => {
      const data = { email: 'usuario@ejemplo.com', password: 'L1234567' }
      const response = await test.login(data)
      expect(response.message).toBe('Login successfully')
      expect(response.results.user).toMatchObject(userCreated)
      expect(response.results.token).toBeDefined()
      expect(typeof response.results.token).toBe('string')
      expect(response.results.token).not.toBe('')
    })
    it('"should throw an error if the password is incorrect"', async () => {
      const dataUser = { email: 'usuario@ejemplo.com', password: 'L1234567dididi' }
      try {
        await test.login(dataUser)
        throw new Error('❌ Expected a authentication error, but none was thrown')
      } catch (error: unknown) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'status' in error &&
          'message' in error
        ) {
          expect((error as { status: number }).status).toBe(400)
          expect(error).toBeInstanceOf(Error)
          expect((error as { message: string }).message).toBe('Invalid password')
        } else {
          throw error
        }
      }
    })
    it('"should throw an error if the user is blocked"', async () => {
      const data = { enabled: false }
      await test.update(getStringId(), data)
      const dataUser = { email: 'usuario@ejemplo.com', password: 'L1234567' }
      try {
        await test.login(dataUser)
        throw new Error('❌ Expected a authentication error, but none was thrown')
      } catch (error: unknown) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'status' in error &&
          'message' in error
        ) {
          expect((error as { status: number }).status).toBe(400)
          expect(error).toBeInstanceOf(Error)
          expect((error as { message: string }).message).toBe('User is blocked')
        } else {
          throw error
        }
      }
    })
  })
})
