const osGetAccessToken = jest.fn(() => { return Promise.resolve(() => { return { access_token: '', expires_in: 600 } }) })

module.exports = {
  osGetAccessToken
}
