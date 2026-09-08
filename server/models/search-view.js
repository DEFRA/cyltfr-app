const { floodWarningsUrl } = require('../config')
const { errorSummaryTitle } = require('../helpers')

class SearchViewModel {
  constructor (postcode, addresses = [], errorMessage, warnings, backLinkUri, otherRegion, options = {}) {
    const { aboutThisAddress, searchReasonErrorMessage, selectedAddress } = options
    this.postcode = postcode

    const defaultOption = {
      text: addresses.length === 1
        ? '1 address found'
        : `${addresses.length} addresses found`,
      value: -1
    }

    const items = [defaultOption].concat(addresses.map((addr, index) => ({
      text: addr.address,
      value: index
    })))

    this.addressSelect = {
      id: 'address',
      name: 'address',
      label: {
        text: 'Select an address'
      },
      items
    }

    if (selectedAddress !== undefined && selectedAddress !== null) {
      this.addressSelect.value = String(selectedAddress)
    }

    if (warnings?.message && warnings?.severity < 4) {
      this.banner = {
        url: floodWarningsUrl + '/location?q=' + encodeURIComponent(postcode),
        message: warnings.message
      }
    }

    const errorList = []

    if (errorMessage) {
      this.addressSelect.errorMessage = {
        text: errorMessage
      }

      errorList.push({
        text: errorMessage,
        href: '#address'
      })
    }

    this.aboutThisAddress = aboutThisAddress

    if (searchReasonErrorMessage) {
      this.searchReasonErrorMessage = searchReasonErrorMessage
      errorList.push({
        text: searchReasonErrorMessage,
        href: '#about-this-address-heading'
      })
    }

    if (errorList.length) {
      this.errorSummary = {
        titleText: errorSummaryTitle,
        errorList
      }
    }

    this.addresses = JSON.stringify(addresses)

    this.backLink = backLinkUri

    this.otherRegion = otherRegion
    this.isWales = ['wales', 'W'].includes(otherRegion)
    this.isScotland = ['scotland', 'S'].includes(otherRegion)
  }
}

module.exports = SearchViewModel
