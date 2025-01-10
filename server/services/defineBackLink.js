function defineBackLink (currentPage, previousPage) {
  if (currentPage === '/map' || currentPage === '/cookies' || currentPage === '/privacy-notice') {
    return previousPage || '/postcode'
  }
  return '/postcode'
}

module.exports = {
  defineBackLink
}
