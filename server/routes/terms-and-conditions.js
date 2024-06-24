module.exports = [
  {
    method: 'GET',
    path: '/terms-and-conditions',
    handler: {
      view: {
        template: 'terms-and-conditions',
        context: { noIndex: false }
      }
    },
    options: {
      description: 'Get the terms and conditions page'
    }
  }
]
