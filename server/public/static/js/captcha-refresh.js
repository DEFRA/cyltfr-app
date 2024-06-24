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
  // Array.prototype.slice.call(document.querySelectorAll(".frc-captcha")).forEach(function (element) {
  //   var messageElement = document.createElement("p");
  //   messageElement.innerHTML =
  //     "The anti-robot check works better and faster in modern browsers such as Edge, Firefox, or Chrome. Please consider updating your browser";
  //   element.parentNode.insertBefore(messageElement, element.nextSibling);
  // });
  const ieBrowser = document.getElementById('nc-browser')
  ieBrowser.style.display = 'block'
}
