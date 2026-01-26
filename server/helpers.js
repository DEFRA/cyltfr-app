const errorSummaryTitle = 'There is a problem'

const redirectToHomeCounty = (h, postcode, region) => {
  const encodedPostcode = encodeURIComponent(postcode)
  const url = `/england-only?postcode=${encodedPostcode}&region=${region}#`
  return h.redirect(url)
}

module.exports = {
  errorSummaryTitle,
  redirectToHomeCounty,
}
