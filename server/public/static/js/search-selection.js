(() => {
  const getErrorType = (hasAddressSelection, hasReasonSelection) => {
    if (!hasAddressSelection && !hasReasonSelection) {
      return 'no adrs or type'
    }
    if (!hasAddressSelection) {
      return 'no adrs'
    }
    return 'no adrs type'
  }

  const form = document.getElementById('address-form')

  if (!form) {
    return
  }

  form.addEventListener('submit', () => {
    const selectedAddress = form.querySelector('select[name="address"]')?.value
    const selectedReason = form.querySelector('input[name="aboutThisAddress"]:checked')?.value
    const hasAddressSelection = selectedAddress !== undefined && Number(selectedAddress) >= 0
    const hasReasonSelection = Boolean(selectedReason)

    if (typeof globalThis.gtag === 'function' && (!hasAddressSelection || !hasReasonSelection)) {
      const errorType = getErrorType(hasAddressSelection, hasReasonSelection)

      globalThis.gtag('event', 'gtag_adrs_search_err', {
        error_type: errorType
      })

      const errorTypeSelection = `gtag_adrs_search_err_${errorType.replace(/\s+/g, '_')}`
      globalThis.gtag('event', errorTypeSelection)
    }

    if (!hasAddressSelection || !hasReasonSelection) {
      return
    }

    if (typeof globalThis.gtag === 'function') {
      globalThis.gtag('event', 'gtag_adrs_search', {
        search_type: selectedReason
      })

      const searchTypeSelection = `gtag_adrs_search_${selectedReason.replace(/-/g, '_')}`
      globalThis.gtag('event', searchTypeSelection)
    }
  })
})()
