class Postcode {
  constructor (postcode = null, isValid = false, isNI = false) {
    this.postcode = postcode
    this.isValid = isValid
    this.isNI = isNI
  }

  static compare (postcode1, postcode2) {
    if (!postcode1 || !postcode2) { return false }
    return normalisePostcode(postcode1).postcode === normalisePostcode(postcode2).postcode
  }

  static normalise (postcode) {
    return normalisePostcode(postcode)
  }
}

function normalisePostcode (postcode) {
  if (!postcode) { return new Postcode(postcode) }
  postcode = postcode.toString()

  let normalised = removeNonAlphanumeric(postcode)
  normalised = removeWhitespace(normalised)
  normalised = characterFormatting(normalised)

  return new Postcode(
    normalised,
    isValidPostcodeFormat(normalised),
    isNIPostcode(normalised)
  )
}

function removeWhitespace (postcode) {
  return postcode.trim().replaceAll(/\s+/g, '')
}

function removeNonAlphanumeric (postcode) {
  return postcode.replaceAll(/[^a-zA-Z0-9 ]/g, '')
}

function characterFormatting (postcode) {
  return postcode.toUpperCase()
}

function isValidPostcodeFormat (postcode) {
  const postcodeRegex = /^[A-Z]{1,2}\d[A-Z0-9]?\s?\d[A-Z]{2}$/i
  return postcodeRegex.test(postcode)
}

function isNIPostcode (postcode) {
  return postcode.startsWith('BT')
}

module.exports = {
  Postcode
}
