const defineBackLink = require('../defineBackLink.js')

describe('defineBackLink', () => {
  test.each([
    { previousPage: '/surface-water', expectedBackLink: '/surface-water' },
    { previousPage: '/rivers-and-sea', expectedBackLink: '/rivers-and-sea' },
    { previousPage: '/ground-water', expectedBackLink: '/ground-water' },
    { previousPage: '/postcode', expectedBackLink: '/postcode' },
    { previousPage: '', expectedBackLink: '/postcode' }
  ])('Back link is $expectedBackLink when page on map page', ({ previousPage, expectedBackLink }) => {
    const currentPage = '/map'
    const backLink = defineBackLink.defineBackLink(currentPage, previousPage)
    expect(backLink).toEqual(expectedBackLink)
  })
})
