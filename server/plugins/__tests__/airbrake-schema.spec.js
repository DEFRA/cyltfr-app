const Joi = require('joi')
const { options } = require('../airbrake-schema')

describe('airbrake-schema', () => {
  test('should define options as a Joi object schema', () => {
    expect(Joi.isSchema(options)).toBe(true)

    const schemaDescription = options.describe()

    expect(schemaDescription.type).toBe('object')
    expect(schemaDescription.keys).toHaveProperty('appId')
    expect(schemaDescription.keys).toHaveProperty('key')
    expect(schemaDescription.keys).toHaveProperty('host')
    expect(schemaDescription.keys).toHaveProperty('env')
    expect(schemaDescription.keys).toHaveProperty('notify')
    expect(schemaDescription.keys).toHaveProperty('proxy')
  })
})
