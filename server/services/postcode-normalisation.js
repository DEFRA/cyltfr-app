class Postcode {
  constructor (postcode = null, isValid = false, isEngland, region, otherRegion) {
    this.postcode = postcode
    this.isValid = isValid
    this.isEngland = isEngland
    this.region = region
    this.otherRegion = otherRegion
  }

  static async compare (postcode1, postcode2) {
    if (!postcode1 || !postcode2) { return false }
    const normalizedPostcode1 = await normalisePostcode(postcode1)
    const normalizedPostcode2 = await normalisePostcode(postcode2)
    return normalizedPostcode1.postcode === normalizedPostcode2.postcode
  }

  static normalise (postcode, find) {
    return normalisePostcode(postcode, find)
  }

  static formatForDisplay (postcode) {
    return formatPostcodeForDisplay(postcode)
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

  const { isEngland, region, addresses, otherRegion } = await isEnglishPostcode(normalised, find)
  return {
    postcodeInfo: new Postcode(normalised, isValid, isEngland, region, otherRegion),
    addresses
  }
}

async function isEnglishPostcode (postcode, find) {
  let addresses = await find(postcode)

  const region = addresses[0].country_code === 'E'
    ? 'england'
    : addresses[0].country_code === 'W'
      ? 'wales'
      : addresses[0].country_code === 'S'
        ? 'scotland'
        : 'northern-ireland'

  const otherRegion = addresses.filter(country => country.country_code !== 'E')[0]?.country_code === 'W'
    ? 'wales'
    : addresses.filter(country => country.country_code !== 'E')[0]?.country_code === 'S'
      ? 'scotland'
      : null

  const regionInfo = {
    region,
    isEngland: addresses[0].country_code === 'E',
    otherRegion
  }

  addresses = addresses.filter(country => country.country_code === 'E')

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

function formatPostcodeForDisplay (postcode) {
  if (!postcode) { return postcode }

  postcode =
    characterFormatting(
      removeWhitespace(
        removeNonAlphanumeric(postcode.toString())
      )
    )

  const blockOne = postcode.slice(0, -3).trim()
  const blockTwo = postcode.slice(-3)
  return `${blockOne} ${blockTwo}`
}

module.exports = {
  Postcode
}
