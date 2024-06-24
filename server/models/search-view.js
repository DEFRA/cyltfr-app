const { floodWarningsUrl } = require('../config')
const { errorSummaryTitle } = require('../helpers')

class SearchViewModel {
  constructor (postcode, addresses = [], errorMessage, warnings, backLinkUri) {
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

    if (warnings?.message && warnings?.severity < 4) {
      this.banner = {
        url: floodWarningsUrl + '/location?q=' + encodeURIComponent(postcode),
        message: warnings.message
      }
    }

    if (errorMessage) {
      this.addressSelect.errorMessage = {
        text: errorMessage
      }

      this.errorSummary = {
        titleText: errorSummaryTitle,
        errorList: [
          {
            text: errorMessage,
            href: '#address'
          }
        ]
      }
    }

    this.addresses = JSON.stringify(addresses)

    this.backLink = backLinkUri
  }
}

module.exports = SearchViewModel
