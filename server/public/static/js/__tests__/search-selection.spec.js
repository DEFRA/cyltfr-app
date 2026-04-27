/**
 * @jest-environment jsdom
 */

describe('google analytics search selection', () => {
  let formElement
  let addressSelect
  let reasonRadio

  beforeEach(() => {
    document.body.innerHTML = ''
    globalThis.gtag = undefined
    jest.resetModules()

    formElement = document.createElement('form')
    formElement.id = 'address-form'

    addressSelect = document.createElement('select')
    addressSelect.name = 'address'

    const noAddressOption = document.createElement('option')
    noAddressOption.value = '-1'
    noAddressOption.text = 'Select an address'
    addressSelect.appendChild(noAddressOption)

    const validAddressOption = document.createElement('option')
    validAddressOption.value = '0'
    validAddressOption.text = 'Address 1'
    addressSelect.appendChild(validAddressOption)

    formElement.appendChild(addressSelect)

    reasonRadio = document.createElement('input')
    reasonRadio.type = 'radio'
    reasonRadio.name = 'aboutThisAddress'
    formElement.appendChild(reasonRadio)

    document.body.appendChild(formElement)

    require('../search-selection.js')
  })

  test('should send gtag event when address and reason are selected', () => {
    globalThis.gtag = jest.fn()
    addressSelect.value = '0'
    reasonRadio.checked = true
    reasonRadio.value = 'live'

    const submitEvent = new Event('submit')
    formElement.dispatchEvent(submitEvent)

    expect(globalThis.gtag).toHaveBeenCalledWith('event', 'gtag_adrs_search', {
      search_type: 'live'
    })
    expect(globalThis.gtag).toHaveBeenCalledWith('event', 'gtag_adrs_search_live')
  })

  test('should send gtag error event when address is not selected', () => {
    globalThis.gtag = jest.fn()

    addressSelect.value = '-1'
    reasonRadio.value = 'live'
    reasonRadio.checked = true

    const submitEvent = new Event('submit')
    formElement.dispatchEvent(submitEvent)

    expect(globalThis.gtag).toHaveBeenCalledWith('event', 'gtag_adrs_search_err', {
      error_type: 'no adrs'
    })
    expect(globalThis.gtag).toHaveBeenCalledWith('event', 'gtag_adrs_search_err_no_adrs')
  })

  test('should send gtag error event when reason is not selected', () => {
    globalThis.gtag = jest.fn()
    addressSelect.value = '0'
    reasonRadio.checked = false

    const submitEvent = new Event('submit')
    formElement.dispatchEvent(submitEvent)

    expect(globalThis.gtag).toHaveBeenCalledWith('event', 'gtag_adrs_search_err', {
      error_type: 'no adrs type'
    })
    expect(globalThis.gtag).toHaveBeenCalledWith('event', 'gtag_adrs_search_err_no_adrs_type')
  })

  test('should send gtag error event when address and reason are not selected', () => {
    globalThis.gtag = jest.fn()
    addressSelect.value = '-1'
    reasonRadio.checked = false

    const submitEvent = new Event('submit')
    formElement.dispatchEvent(submitEvent)

    expect(globalThis.gtag).toHaveBeenCalledWith('event', 'gtag_adrs_search_err', {
      error_type: 'no adrs or type'
    })
    expect(globalThis.gtag).toHaveBeenCalledWith('event', 'gtag_adrs_search_err_no_adrs_or_type')
  })

  test('should not throw error on form submit when gtag is not available', () => {
    addressSelect.value = '0'
    reasonRadio.checked = true
    globalThis.gtag = undefined

    expect(() => {
      const submitEvent = new Event('submit')
      formElement.dispatchEvent(submitEvent)
    }).not.toThrow()
  })
})
