const Joi = require('joi')

module.exports = {
  method: 'GET',
  path: '/risk-api',
  handler: async (request) => {
    const { x, y } = request.query
    try {
      const risk = await request.server.methods.riskService(x, y)
      return risk
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
