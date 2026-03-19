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
    const normalisedPostcode1 = await normalisePostcode(postcode1)
    const normalisedPostcode2 = await normalisePostcode(postcode2)
    return normalisedPostcode1.postcodeInfo.postcode === normalisedPostcode2.postcodeInfo.postcode
  }

  static normalise (postcode, find) {
    return normalisePostcode(postcode, find)
  }

  static formatForDisplay (postcode) {
    return formatPostcodeForDisplay(postcode)
  }
}

async function normalisePostcode (postcode, find) {
  if (!postcode || postcode === 'null' || postcode === 'undefined') { return { postcodeInfo: new Postcode(null) } }

  const normalised =
    characterFormatting(
      removeWhitespace(
        removeNonAlphanumeric(postcode.toString())
      )
    )

  const isValid = isValidPostcodeFormat(normalised)

  if (!find) {
    return { postcodeInfo: new Postcode(normalised, isValid) }
  }

  try {
    const { isEngland, region, addresses, otherRegion } = await isEnglishPostcode(normalised, find)
    return {
      postcodeInfo: new Postcode(normalised, isValid, isEngland, region, otherRegion),
      addresses
    }
  } catch {
    return { postcodeInfo: new Postcode(normalised, false) }
  }
}

async function isEnglishPostcode (postcode, find) {
  let addresses = await find(postcode)

  if (!addresses || addresses.length === 0) {
    throw new Error('No addresses found for postcode')
  }

  const primaryCountryCode = addresses[0].country_code
  let region = null

  if (primaryCountryCode === 'E') {
    region = 'england'
  } else if (primaryCountryCode === 'W') {
    region = 'wales'
  } else if (primaryCountryCode === 'S') {
    region = 'scotland'
  } else if (primaryCountryCode === 'N') {
    region = 'northern-ireland'
  } else {
    throw new Error('Unknown country code')
  }

  const secondaryCountryCode = addresses.find(country => country.country_code !== 'E')?.country_code
  let otherRegion

  if (secondaryCountryCode === 'W') {
    otherRegion = 'wales'
  } else if (secondaryCountryCode === 'S') {
    otherRegion = 'scotland'
  } else {
    otherRegion = null
  }

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
