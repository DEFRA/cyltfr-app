const postcodeRegexStr = '(?<first>(([A-Z][0-9]{1,2})|(([A-Z][A-HJ-Y][0-9]{1,2})|(([A-Z][0-9][A-Z])|([A-Z][A-HJ-Y][0-9]?[A-Z])))))\\s?(?<second>[0-9][A-Z]{2})'
// const postcodeRegex = /^[A-Z]{1,2}\d[A-Z0-9]?\s?\d[A-Z]{2}$/i

class Postcode {
  constructor (postcode, isValidFormat, isEngland, region, otherRegion) {
    this.postcode = postcode
    this.isValidFormat = isValidFormat || false
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

  static findPostcodeInString (input) {
    const matchRegexp = new RegExp(`${postcodeRegexStr}`, 'i')
    let retval = null
    try {
      const matches = input.match(matchRegexp)
      if (matches?.length > 0) {
        retval = matches[0]
      }
    } catch {

    }
    return retval
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

  const isValidFormat = isValidPostcodeFormat(normalised)

  if (!find || !isValidFormat) {
    return { postcodeInfo: new Postcode(normalised, isValidFormat) }
  }

  try {
    const { isEngland, region, addresses, otherRegion, anyFound } = await isEnglishPostcode(normalised, find)
    return {
      postcodeInfo: new Postcode(normalised, isValidFormat, isEngland, region, otherRegion),
      anyFound,
      addresses
    }
  } catch (error) {
    return {
      postcodeInfo: new Postcode(normalised, false),
      anyFound: false,
      error
    }
  }
}

async function isEnglishPostcode (postcode, find) {
  let addresses = await find(postcode)

  if (!addresses || addresses.length === 0) {
    return {
      isEngland: false,
      anyFound: false,
      region: null,
      addresses: [],
      otherRegion: null
    }
    // throw new Error('No addresses found for postcode')
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

  return { ...regionInfo, addresses, anyFound: true }
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
  const postcodeRegex = new RegExp(`^${postcodeRegexStr}$`, 'i')
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

  const BLOCK_TWO_LENGTH = -3
  const blockOne = postcode.slice(0, BLOCK_TWO_LENGTH).trim()
  const blockTwo = postcode.slice(BLOCK_TWO_LENGTH)
  return `${blockOne} ${blockTwo}`
}

module.exports = {
  Postcode
}
