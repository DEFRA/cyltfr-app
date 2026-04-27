window.addEventListener('pageshow', function (event) {
  const historyTraversal = event.persisted ||
                         (typeof window.performance !== 'undefined' &&
                              window.performance.navigation.type === 2)
  if (historyTraversal) {
    // Handle page restore.
    window.location.reload()
  }
})
if (document.documentMode) {
  // Only true in Internet Explorer
  const ieBrowser = document.getElementById('nc-browser')
  ieBrowser.style.display = 'block'
}
