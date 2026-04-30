/**
 * FriendlyCaptcha Event Handler
 * Manages UI state transitions for the FriendlyCaptcha widget
 */

/**
 * Configures event listeners for FriendlyCaptcha widget state changes.
 * Manages UI transitions between checking, complete, and error states.
 *
 * When the captcha completes successfully, hides the "checking" state and shows
 * the "complete" state, then enables the submit button.
 *
 * When an error or expiry occurs, hides checking/complete states, shows the error
 * state with error summary, updates document title with "Error: " prefix, and
 * focuses the error summary for accessibility.
 *
 * For all other states (fetching, unstarted), the submit button remains disabled.
 *
 * @param {HTMLElement} captchaElement - The FriendlyCaptcha widget container element
 */
function setupCaptchaEventListeners (captchaElement) {
  const frcChecking = document.getElementById('FriendlyCaptchaChecking')
  const frcComplete = document.getElementById('FriendlyCaptchaComplete')
  const frcError = document.getElementById('FriendlyCaptchaError')
  const frcErrorSummary = document.getElementById('FriendlyCaptchaErrorSummary')
  const submitButton = document.getElementById('post-code-button')
  let errTimer

  captchaElement.addEventListener('frc:widget.statechange', function (event) {
    const detail = event.detail
    if (detail.state === 'completed') {
      if (errTimer) {
        clearTimeout(errTimer)
        errTimer = null
      }
      hide(frcChecking)
      show(frcComplete)
      hide(frcError)
      if (frcErrorSummary) {
        hide(frcErrorSummary)
      }
      submitButton.disabled = false
    } else if ((detail.state === 'error') || (detail.state === 'expired')) {
      if (errTimer) {
        clearTimeout(errTimer)
        errTimer = null
      }
      errTimer = setTimeout(() => {
        errTimer = null
        hide(frcChecking)
        hide(frcComplete)
        show(frcError)
        if (frcErrorSummary) {
          show(frcErrorSummary)
          if (!document.title.includes('Error: ')) {
            document.title = 'Error: ' + document.title
          }
          const errorSummary = frcErrorSummary.querySelector('.govuk-error-summary')
          if (errorSummary) {
            errorSummary.focus()
          }
        }
        submitButton.disabled = false
      }, 1000)
    } else {
      submitButton.disabled = true
    }
  })
}

/**
 * Hides an element after checking it's assigned
 *
 * @param {HTMLElement} element - The element to hide if it's assigned
 */
function hide (element) {
  if (element) {
    element.classList.add('govuk-!-display-none')
  }
}

/**
 * Shows an element after checking that it's assigned
 *
 * @param {HTMLElement} element - The element to show if it's assigned
 */
function show (element) {
  if (element) {
    element.classList.remove('govuk-!-display-none')
  }
}

/**
 * Initializes the retry button click handler.
 * When clicked, prevents default link behavior and reloads the page
 * to reset the FriendlyCaptcha widget.
 */
function initRetryButton () {
  const retryButton = document.getElementById('FriendlyCaptchaResetButton')
  if (retryButton) {
    retryButton.addEventListener('click', function (e) {
      e.preventDefault()
      window.location.reload()
    })
  }
}

function onLoad () {
// Initialize on DOM ready
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      const captchaElement = document.getElementById('FriendlyCaptcha')
      if (captchaElement) {
        setupCaptchaEventListeners(captchaElement)
      }
      initRetryButton()
    })
  }
}

onLoad()

// Export for testing (UMD pattern)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { setupCaptchaEventListeners, initRetryButton, onLoad }
}
