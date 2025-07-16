import envConfig from './envConfig.js'

describe('Iniciando tests, probando variables de entorno del archivo "envConfig.ts" y existencia de tablas en DB.', () => {
  it('Deberia retornar el estado y la variable de base de datos correcta', () => {
    const formatEnvInfo = `Servidor corriendo en: ${envConfig.Status}\n` +
                   `Base de datos de testing: ${envConfig.DbName}`
    expect(formatEnvInfo).toBe('Servidor corriendo en: test\n' +
        'Base de datos de testing: testing')
  })

  // it('Deberia responder a una consulta en la base de datos con un arreglo vacío', async()=>{
  //     const users = await DbUser.find()
  //     const cars = await DBCar.find()
  //     expect(users).toEqual([]);
  //     expect(cars).toEqual([])

  // });
})
