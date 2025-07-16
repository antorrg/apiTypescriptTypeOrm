let adminToken: string = ''
let userToken: string = ''
let storeId: string = ''
let numberId: number

export const setAdminToken = (newToken: string): void => {
  adminToken = newToken
}

export const getAdminToken = (): string => {
  return adminToken
}

export const setUserToken = (newToken: string): void => {
  userToken = newToken
}

export const getUserToken = (): string => {
  return userToken
}

export const setStringId = (newId: string): void => {
  storeId = newId
}

export const getStringId = (): string => {
  return storeId
}

export const setNumberId = (newId: number): void => {
  numberId = newId
}

export const getNumberId = (): number => {
  return numberId
}
