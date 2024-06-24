function scenarioDisplayUpdate (scenarioBar) {
  const scenariosRadios = document.querySelectorAll(`input[name="scenarios-${scenarioBar}"]`)
  scenariosRadios.forEach(radio => {
    const parent = radio.parentNode
    const scenarioHeading = parent.querySelector('.scenario-heading')
    if (radio.checked) {
      parent.style.borderBottom = '7px solid rgb(29, 112, 184)'
      scenarioHeading.style.textDecoration = 'none'
    } else {
      parent.style.borderBottom = 'none'
      scenarioHeading.style.textDecoration = 'underline'
      scenarioHeading.style.textDecorationThickness = '2px'
    }
  })
}

function handleScroll (scenarioBar, arrows) {
  scenarioBar.addEventListener('scroll', function () {
    const currentScrollPosition = scenarioBar.scrollLeft
    const divWidth = scenarioBar.offsetWidth
    const scrollWidth = scenarioBar.scrollWidth

    arrows[0].classList.toggle('hide', currentScrollPosition === scrollWidth - divWidth)
    arrows[1].classList.toggle('hide', currentScrollPosition === 0)
  })
}

function handleArrowClick (arrows, scrollDirection) {
  const scenarioSelectionDepth = document.getElementById('scenario-selection-depth')
  const scenarioSelectionVelocity = document.getElementById('scenario-selection-velocity')

  for (const arrow of arrows) {
    arrow.addEventListener('click', function () {
      scenarioSelectionDepth.scrollBy({ top: 0, left: scrollDirection, behavior: 'smooth' })
      scenarioSelectionVelocity.scrollBy({ top: 0, left: scrollDirection, behavior: 'smooth' })
    })
  }
}

module.exports = {
  scenarioDisplayUpdate,
  handleScroll,
  handleArrowClick
}
