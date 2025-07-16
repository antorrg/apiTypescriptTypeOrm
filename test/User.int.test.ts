import app from '../src/app.js'
import session from 'supertest'
import { resetDatabase } from './jest.setup.js'
import { setTokens } from './testHelpers/validationHelper.help.js'
import { getAdminToken, setAdminToken } from './testHelpers/testStore.help.js'
const agent = session(app)

describe('Integration test. Route Tests: "User"', () => {
  afterAll(async () => {
    await resetDatabase()
  })
  describe('Login method', () => {
    it('should authenticate the user and return a message, user data, and a token', async () => {
      await setTokens()
      const data = { email: 'juangarcia@gmail.com', password: 'L1234567' }
      const response = await agent
        .post('/api/v1/user/login')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Login successfully')
      expect(response.body.results.user).toMatchObject({
        id: expect.any(String) as string,
        email: 'juangarcia@gmail.com',
        nickname: 'juangarcia',
        picture: 'https://urlimageprueba.net',
        name: '',
        surname: '',
        country: '',
        role: 'User',
        isVerify: false,
        isRoot: false,
        enabled: true
      })
      expect(response.body.results.token).toBeDefined()
      expect(typeof response.body.results.token).toBe('string')
      expect(response.body.results.token).not.toBe('')
      setAdminToken(response.body.results.token)
    })
    it('"should throw an error in correct format if the password is incorrect"', async () => {
      const data = { email: 'juangarcia@gmail.com', password: 'D12345678ddg225' }
      const response = await agent
        .post('/api/v1/user/login')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Invalid password')
      expect(response.body.data).toBe(null)
    })
    it('"should throw an error in correct format if the password is invalid (error middleware)"', async () => {
      const data = { email: 'juangarcia@gmail.com', password: 'L123' }
      const response = await agent
        .post('/api/v1/user/login')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Invalid password format! Enter a valid password')
      expect(response.body.data).toBe(null)
    })
  })
  describe('Create method', () => {
    it('should create an user with the correct parameters', async () => {
      const data = { email: 'josenomeacuerdo@gmail.com', password: 'L1234567' }
      const response = await agent
        .post('/api/v1/user/create')
        .send(data)
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .expect('Content-Type', /json/)
        .expect(201)
      expect(response.body.message).toBe('User created successfully')
      expect(response.body.results).toMatchObject({
        id: expect.any(String),
        email: 'josenomeacuerdo@gmail.com',
        nickname: 'josenomeacuerdo',
        picture: 'https://urlimageprueba.net',
        name: '',
        surname: '',
        country: '',
        role: 'User',
        isVerify: false,
        isRoot: false,
        enabled: true
      })
    })
    it('should throw an error when attempting to create the same user twice (error handling)', async () => {
      const data = { email: 'josenomeacuerdo@gmail.com', password: 'L1234567' }
      const response = await agent
        .post('/api/v1/user/create')
        .send(data)
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .expect('Content-Type', /json/)
        .expect(400)
      expect(response.body).toEqual({ data: null, message: 'This email already exists', success: false })
    })
  })
})
