const osGetAccessToken = jest.fn(() => { return Promise.resolve({ access_token: '', expires_in: 600 }) })

module.exports = {
  osGetAccessToken
}
