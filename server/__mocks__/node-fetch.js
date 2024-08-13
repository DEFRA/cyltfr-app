jest.mock('node-fetch')

const { Response, Request, Headers } = jest.requireActual('node-fetch')

const meta = {
  'Content-Type': 'application/json',
  Accept: '*/*'
}
const headers = new Headers(meta)

const ResponseInit = {
  status: 200,
  statusText: 'fail',
  headers
}

let downloadDocumentData = { }
const getDocList = () => {
  return new Response(
    JSON.stringify(downloadDocumentData),
    ResponseInit
  )
}
function setFetchData (data) {
  downloadDocumentData = data
}
const fetch = jest.fn(() => { return Promise.resolve(getDocList()) })
fetch.setFetchData = setFetchData

module.exports = exports = fetch
Object.defineProperty(exports, '__esModule', { value: true })
exports.default = exports
exports.Headers = Headers
exports.Request = Request
exports.Response = Response
