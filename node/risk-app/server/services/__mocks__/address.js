const addressService = jest.createMockFromModule('../address')
const findByPostcode = require('./find')

/**
 * Override the real functions with mock implementations
 */
addressService.find.mockImplementation((postcode) => {
  const result = findByPostcode[postcode.toUpperCase().replace(' ', '')]
  return result
    ? Promise.resolve(result)
    : Promise.reject(new Error(`findByPostcode mock not found for postcode [${postcode}]`))
})

addressService.updateAddress = (postcode, newAddress) => {
  findByPostcode[postcode.toUpperCase().replace(' ', '')] = newAddress
}

module.exports = addressService
