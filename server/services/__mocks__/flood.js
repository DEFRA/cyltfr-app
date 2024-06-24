const floodService = jest.createMockFromModule('../flood')

let returnValue = { }

floodService.__updateReturnValue = function (newValue) {
  returnValue = { ...newValue }
  return returnValue
}

floodService.findWarnings.mockImplementation((_location) => {
  return Promise.resolve(returnValue)
})

module.exports = floodService
