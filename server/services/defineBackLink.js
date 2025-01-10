function defineBackLink (currentPage, previousPage) {
  if (currentPage === '/map' || currentPage === '/cookies') {
    return previousPage || '/postcode'
  }
  return '/postcode'
}

module.exports = {
  defineBackLink
}
