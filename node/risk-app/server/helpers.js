const errorSummaryTitle = 'There is a problem'
const postcodeRegex = /^[A-Z]{1,2}\d[0-9A-Z]?\s*\d[A-Z]{2}$/i

const redirectToHomeCounty = (h, postcode, region) => {
  const encodedPostcode = encodeURIComponent(postcode)
  const url = `/england-only?postcode=${encodedPostcode}&region=${region}#`
  return h.redirect(url)
}

module.exports = {
  postcodeRegex,
  errorSummaryTitle,
  redirectToHomeCounty
}
