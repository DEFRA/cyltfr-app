function defineBackLink (currentPage, previousPage) {
  const backLinkPages = [
    '/map',
    '/cookies',
    '/privacy-notice',
    '/terms-and-conditions',
    '/accessibility-statement',
    '/os-terms'
  ]

  if (backLinkPages.includes(currentPage)) {
    return previousPage || '/postcode'
  }
  return '/postcode'
}

module.exports = {
  defineBackLink
}
