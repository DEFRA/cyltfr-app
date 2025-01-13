function defineBackLink (currentPage, previousPage) {
  if (
    currentPage === '/map' ||
    currentPage === '/cookies' ||
    currentPage === '/privacy-notice' ||
    currentPage === '/terms-and-conditions'
  ) {
    return previousPage || '/postcode'
  }
  return '/postcode'
}

module.exports = {
  defineBackLink
}
