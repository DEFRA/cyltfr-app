class Postcode {
  constructor (postcode = null, isValid = false, isEngland, region) {
    this.postcode = postcode
    this.isValid = isValid
    this.isEngland = isEngland
    this.region = region
  }

  static compare (postcode1, postcode2) {
    if (!postcode1 || !postcode2) { return false }
    return normalisePostcode(postcode1).postcode === normalisePostcode(postcode2).postcode
  }

  static normalise (postcode, find) {
    return normalisePostcode(postcode, find)
  }
}

async function normalisePostcode (postcode, find) {
  if (!postcode) { return new Postcode(postcode) }

  const normalised =
    characterFormatting(
      removeWhitespace(
        removeNonAlphanumeric(postcode.toString())
      )
    )

  const isValid = isValidPostcodeFormat(normalised)

  if (!find) {
    return new Postcode(normalised, isValid)
  }

  const { isEngland, region, addresses } = await isEnglishPostcode(normalised, find)
  return {
    postcodeInfo: new Postcode(normalised, isValid, isEngland, region),
    addresses
  }
}

async function isEnglishPostcode (postcode, find) {
  const addresses = await find(postcode)
  const regionInfo = {
    region: addresses[0].country_code === 'E'
      ? 'england'
      : addresses[0].country_code === 'W'
        ? 'wales'
        : addresses[0].country_code === 'S'
          ? 'scotland'
          : 'northern-ireland',
    isEngland: addresses[0].country_code === 'E'
  }

  return { ...regionInfo, addresses }
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

// function isNIPostcode (postcode) {
//   return postcode.startsWith('BT')
// }

module.exports = {
  Postcode
}
