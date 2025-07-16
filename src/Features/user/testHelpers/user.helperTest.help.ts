export const userCreated = {

  id: expect.any(String),
  email: 'usuario@ejemplo.com',
  nickname: 'usuario',
  picture: 'https://urlimageprueba.net',
  name: '',
  surname: '',
  country: '',
  isVerify: false,
  role: 'User',
  isRoot: false,
  enabled: true
}

export const userRootCreated = {
  id: expect.any(String),
  email: 'usuarioroot@ejemplo.com',
  nickname: 'usuarioroot',
  picture: 'https://urlimageprueba.net',
  name: '',
  surname: '',
  country: '',
  isVerify: false,
  role: 'Admin',
  isRoot: true,
  enabled: true
}
