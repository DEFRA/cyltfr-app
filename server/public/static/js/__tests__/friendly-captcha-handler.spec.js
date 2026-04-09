/**
 * @jest-environment jsdom
 */

const { setupCaptchaEventListeners, initRetryButton, onLoad } = require('../friendly-captcha-handler')

describe('setupCaptchaEventListeners', () => {
  let mockCaptchaElement
  let frcChecking
  let frcComplete
  let frcError
  let frcErrorSummary
  let submitButton
  let errorSummaryElement

  beforeEach(() => {
    // Setup mock DOM
    document.body.innerHTML = `
      <div id="FriendlyCaptchaChecking" style="display: block;"></div>
      <div id="FriendlyCaptchaComplete" class="do-not-display" style="display: none;"></div>
      <div id="FriendlyCaptchaError" class="do-not-display" style="display: none;"></div>
      <div id="FriendlyCaptchaErrorSummary" class="do-not-display" style="display: none;">
        <div class="govuk-error-summary" tabindex="-1"></div>
      </div>
      <button id="post-code-button" disabled="true"></button>
      <div id="FriendlyCaptcha" class="frc-captcha"></div>
    `

    mockCaptchaElement = document.getElementById('FriendlyCaptcha')
    frcChecking = document.getElementById('FriendlyCaptchaChecking')
    frcComplete = document.getElementById('FriendlyCaptchaComplete')
    frcError = document.getElementById('FriendlyCaptchaError')
    frcErrorSummary = document.getElementById('FriendlyCaptchaErrorSummary')
    submitButton = document.getElementById('post-code-button')
    errorSummaryElement = frcErrorSummary.querySelector('.govuk-error-summary')

    // Mock focus method
    errorSummaryElement.focus = jest.fn()

    // Reset document title
    document.title = 'Where do you want to check?'
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should enable submit button and show complete state when captcha completes', () => {
    setupCaptchaEventListeners(mockCaptchaElement)

    const event = new CustomEvent('frc:widget.statechange', {
      detail: { state: 'completed' }
    })
    mockCaptchaElement.dispatchEvent(event)

    expect(frcChecking.style.display).toBe('none')
    expect(frcComplete.style.display).toBe('block')
    expect(submitButton.disabled).toBe(false)
    expect(frcError.style.display).toBe('none')
    expect(frcErrorSummary.style.display).toBe('none')
  })

  test('should show error state and disable submit button initially for other states', () => {
    setupCaptchaEventListeners(mockCaptchaElement)

    const event = new CustomEvent('frc:widget.statechange', {
      detail: { state: 'fetching' }
    })
    mockCaptchaElement.dispatchEvent(event)

    expect(submitButton.disabled).toBe(true)
  })

  test('should show error state and focus error summary on captcha error', () => {
    setupCaptchaEventListeners(mockCaptchaElement)

    const event = new CustomEvent('frc:widget.statechange', {
      detail: { state: 'error' }
    })
    mockCaptchaElement.dispatchEvent(event)

    expect(frcChecking.style.display).toBe('none')
    expect(frcComplete.style.display).toBe('none')
    expect(frcError.style.display).toBe('block')
    expect(frcErrorSummary.style.display).toBe('block')
    expect(submitButton.disabled).toBe(false)
    expect(errorSummaryElement.focus).toHaveBeenCalled()
  })

  test('should prefix document title with "Error: " on captcha error', () => {
    setupCaptchaEventListeners(mockCaptchaElement)

    const event = new CustomEvent('frc:widget.statechange', {
      detail: { state: 'error' }
    })
    mockCaptchaElement.dispatchEvent(event)

    expect(document.title).toBe('Error: Where do you want to check?')
  })

  test('should not duplicate "Error: " prefix if already present', () => {
    document.title = 'Error: Where do you want to check?'
    setupCaptchaEventListeners(mockCaptchaElement)

    const event = new CustomEvent('frc:widget.statechange', {
      detail: { state: 'error' }
    })
    mockCaptchaElement.dispatchEvent(event)

    expect(document.title).toBe('Error: Where do you want to check?')
  })

  test('should handle expired state same as error state', () => {
    setupCaptchaEventListeners(mockCaptchaElement)

    const event = new CustomEvent('frc:widget.statechange', {
      detail: { state: 'expired' }
    })
    mockCaptchaElement.dispatchEvent(event)

    expect(frcChecking.style.display).toBe('none')
    expect(frcComplete.style.display).toBe('none')
    expect(frcError.style.display).toBe('block')
    expect(frcErrorSummary.style.display).toBe('block')
    expect(submitButton.disabled).toBe(false)
    expect(document.title).toContain('Error: ')
    expect(errorSummaryElement.focus).toHaveBeenCalled()
  })

  test('should handle missing optional elements gracefully', () => {
    // Remove optional elements
    frcChecking.remove()
    frcComplete.remove()
    frcError.remove()
    frcErrorSummary.remove()

    setupCaptchaEventListeners(mockCaptchaElement)

    const event = new CustomEvent('frc:widget.statechange', {
      detail: { state: 'completed' }
    })

    // Should not throw error
    expect(() => {
      mockCaptchaElement.dispatchEvent(event)
    }).not.toThrow()

    expect(submitButton.disabled).toBe(false)
  })

  test('should disable submit button for unstarted state', () => {
    setupCaptchaEventListeners(mockCaptchaElement)

    const event = new CustomEvent('frc:widget.statechange', {
      detail: { state: 'unstarted' }
    })
    mockCaptchaElement.dispatchEvent(event)

    expect(submitButton.disabled).toBe(true)
  })

  test('should disable submit button for fetching state', () => {
    setupCaptchaEventListeners(mockCaptchaElement)

    const event = new CustomEvent('frc:widget.statechange', {
      detail: { state: 'fetching' }
    })
    mockCaptchaElement.dispatchEvent(event)

    expect(submitButton.disabled).toBe(true)
  })
})

describe('initRetryButton', () => {
  let retryButton

  beforeEach(() => {
    document.body.innerHTML = `
      <a role="button" id="FriendlyCaptchaResetButton" href="/postcode#" class="govuk-button">Retry</a>
    `
    retryButton = document.getElementById('FriendlyCaptchaResetButton')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('should attach click handler to retry button', () => {
    // Store the original addEventListener
    const addEventListenerSpy = jest.spyOn(retryButton, 'addEventListener')

    initRetryButton()

    expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function))
  })

  test('should handle missing retry button gracefully', () => {
    retryButton.remove()

    expect(() => {
      initRetryButton()
    }).not.toThrow()
  })

  test('should prevent default link behavior when retry button is clicked', () => {
    initRetryButton()

    const event = new Event('click')
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault')
    retryButton.dispatchEvent(event)

    expect(preventDefaultSpy).toHaveBeenCalled()
  })
})

describe('onLoad', () => {
  let addEventListenerSpy
  let captchaElement
  let retryButton

  beforeEach(() => {
    // Clear any previous DOM
    document.body.innerHTML = ''

    // Reset mocks
    jest.clearAllMocks()

    // Spy on document.addEventListener
    addEventListenerSpy = jest.spyOn(document, 'addEventListener')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('should add DOMContentLoaded event listener when document is defined', () => {
    onLoad()

    expect(addEventListenerSpy).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function))
  })

  test('should call setupCaptchaEventListeners when captcha element exists on DOMContentLoaded', () => {
    // Setup DOM with captcha element
    document.body.innerHTML = `
      <div id="FriendlyCaptcha"></div>
      <a role="button" id="FriendlyCaptchaResetButton" href="/postcode#">Retry</a>
    `

    onLoad()

    // Get the DOMContentLoaded callback
    const domContentLoadedCallback = addEventListenerSpy.mock.calls.find(
      call => call[0] === 'DOMContentLoaded'
    )[1]

    captchaElement = document.getElementById('FriendlyCaptcha')
    const captchaListenerSpy = jest.spyOn(captchaElement, 'addEventListener')

    // Trigger the DOMContentLoaded callback
    domContentLoadedCallback()

    // Verify that the captcha element has the event listener attached
    expect(captchaListenerSpy).toHaveBeenCalledWith('frc:widget.statechange', expect.any(Function))
  })

  test('should call initRetryButton on DOMContentLoaded', () => {
    // Setup DOM with retry button
    document.body.innerHTML = `
      <a role="button" id="FriendlyCaptchaResetButton" href="/postcode#">Retry</a>
    `

    onLoad()

    // Get the DOMContentLoaded callback
    const domContentLoadedCallback = addEventListenerSpy.mock.calls.find(
      call => call[0] === 'DOMContentLoaded'
    )[1]

    retryButton = document.getElementById('FriendlyCaptchaResetButton')
    const retryButtonListenerSpy = jest.spyOn(retryButton, 'addEventListener')

    // Trigger the DOMContentLoaded callback
    domContentLoadedCallback()

    expect(retryButtonListenerSpy).toHaveBeenCalledWith('click', expect.any(Function))
  })

  test('should not call setupCaptchaEventListeners when captcha element does not exist', () => {
    // Setup DOM without captcha element
    document.body.innerHTML = `
      <a role="button" id="FriendlyCaptchaResetButton" href="/postcode#">Retry</a>
    `

    onLoad()

    // Get the DOMContentLoaded callback
    const domContentLoadedCallback = addEventListenerSpy.mock.calls.find(
      call => call[0] === 'DOMContentLoaded'
    )[1]

    // Trigger the DOMContentLoaded callback - should not throw error
    expect(() => {
      domContentLoadedCallback()
    }).not.toThrow()

    // Verify captcha element doesn't exist
    expect(document.getElementById('FriendlyCaptcha')).toBeNull()
  })

  test('should handle case when document is undefined', () => {
    // Save original document
    const originalDocument = global.document

    // Temporarily set document to undefined
    delete global.document

    // Should not throw error
    expect(() => {
      onLoad()
    }).not.toThrow()

    // Restore document
    global.document = originalDocument
  })

  test('should initialize both captcha listeners and retry button when both elements exist', () => {
    // Setup complete DOM
    document.body.innerHTML = `
      <div id="FriendlyCaptchaChecking" style="display: block;"></div>
      <div id="FriendlyCaptchaComplete" style="display: none;"></div>
      <div id="FriendlyCaptchaError" style="display: none;"></div>
      <div id="FriendlyCaptchaErrorSummary" style="display: none;">
        <div class="govuk-error-summary" tabindex="-1"></div>
      </div>
      <button id="post-code-button" disabled="true"></button>
      <div id="FriendlyCaptcha" class="frc-captcha"></div>
      <a role="button" id="FriendlyCaptchaResetButton" href="/postcode#">Retry</a>
    `

    onLoad()

    // Get the DOMContentLoaded callback
    const domContentLoadedCallback = addEventListenerSpy.mock.calls.find(
      call => call[0] === 'DOMContentLoaded'
    )[1]

    captchaElement = document.getElementById('FriendlyCaptcha')
    retryButton = document.getElementById('FriendlyCaptchaResetButton')

    const captchaListenerSpy = jest.spyOn(captchaElement, 'addEventListener')
    const retryButtonListenerSpy = jest.spyOn(retryButton, 'addEventListener')

    // Trigger the DOMContentLoaded callback
    domContentLoadedCallback()

    expect(captchaListenerSpy).toHaveBeenCalledWith('frc:widget.statechange', expect.any(Function))
    expect(retryButtonListenerSpy).toHaveBeenCalledWith('click', expect.any(Function))
  })
})
