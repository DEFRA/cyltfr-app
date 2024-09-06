const ApplicationCredentialsManager = {}

const refreshToken = jest.fn(() => { return Promise.resolve(() => { return 'faketoken' }) })

ApplicationCredentialsManager.fromCredentials = jest.fn(() => { return { refreshToken } })

module.exports = exports = ApplicationCredentialsManager
Object.defineProperty(exports, '__esModule', { value: true })
exports.default = exports
exports.ApplicationCredentialsManager = ApplicationCredentialsManager
