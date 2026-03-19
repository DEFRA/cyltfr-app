const Joi = require('joi')
const { findNearest } = require('../services/nearest')

module.exports = {
  method: 'GET',
  path: '/nearest',
  handler: async (request) => {
    const { x, y } = request.query
    try {
      const result = await findNearest(x, y)
      return result || { postcode: null, street: null, address: null }
    } catch (err) {
      console.log(err)
    }
  },
  options: {
    validate: {
      query: Joi.object({
        x: Joi.number().required(),
        y: Joi.number().required()
      })
    }
  }
}
