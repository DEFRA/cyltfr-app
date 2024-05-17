const acceptButton = document.querySelector('.js-cookies-button-accept')
const rejectButton = document.querySelector('.js-cookies-button-reject')
const acceptedBanner = document.querySelector('.js-cookies-accepted')
const rejectedBanner = document.querySelector('.js-cookies-rejected')
const questionBanner = document.querySelector('.js-question-banner')
const cookieBanner = document.querySelector('.js-cookies-banner')
const cookieContainer = document.querySelector('.js-cookies-container')

cookieContainer.style.display = 'block'

function showBanner (banner) {
  questionBanner.setAttribute('hidden', 'hidden')
  banner.removeAttribute('hidden')
  // Shift focus to the banner
  banner.setAttribute('tabindex', '-1')
  banner.focus()

  banner.addEventListener('blur', function () {
    banner.removeAttribute('tabindex')
  })
}

acceptButton.addEventListener('click', function (event) {
  showBanner(acceptedBanner)
  event.preventDefault()
  submitPreference(true)
  try {
    window.loadAnalytics()
  } catch (error) {

  }
  return false
})

rejectButton.addEventListener('click', function (event) {
  showBanner(rejectedBanner)
  event.preventDefault()
  submitPreference(false)
  return false
})

acceptedBanner.querySelector('.js-hide').addEventListener('click', function () {
  cookieBanner.setAttribute('hidden', 'hidden')
  return false
})

rejectedBanner.querySelector('.js-hide').addEventListener('click', function () {
  cookieBanner.setAttribute('hidden', 'hidden')
  return false
})

function submitPreference (accepted) {
  fetch('/cookies', {
    method: 'POST',
    mode: 'same-origin',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      analytics: accepted,
      async: true
    })
  }).then(async (x) => { console.log(await x.text()) })
}
