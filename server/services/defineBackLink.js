function defineBackLink (currentPage, previousPage) {
  if (currentPage === '/map') {
    return previousPage || '/postcode'
  }
  return '/postcode'
}

module.exports = {
  defineBackLink
}
