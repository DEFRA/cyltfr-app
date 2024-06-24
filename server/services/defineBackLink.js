function defineBackLink (currentPage, postcode) {
  if ((currentPage === '/risk') && (postcode)) {
    return '/search?postcode=' + postcode.split(' ').join('%20')
  }
  if (currentPage === '/map') {
    return '/risk'
  }
  return '/postcode'
}

module.exports = {
  defineBackLink
}
