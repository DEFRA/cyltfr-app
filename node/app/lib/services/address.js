var data = [
  { id: '564204688f0978d4c6c5962b', text: '1 Beechmill Drive, Wigan, Lancashire. L12 5TH', easting: 330000, northing: 558000 },
  { id: '564203b38f0978d4c6628c6e', text: 'Buckingham Palace, Buckingamshire, London. L1 1XX', easting: 528000, northing: 224000 },
  { id: '564203d88f0978d4c6763d59', text: 'Old Trafford, Stretford, Manchester. M1 1TT', easting: 366000, northing: 444000 },
  { id: '5642040c8f0978d4c6926cd5', text: 'Wembley Stadium, Wembley, London. L4 1YX', easting: 510000, northing: 216000 },
  { id: '5642043b8f0978d4c6ac2bef', text: 'Richard Fairclough House, Latchford, Warrington. WA14 1EP', easting: 358000, northing: 406000 }
]

/*
 * TODO: Replace with real postcode lookup implementation
 */
function findById (id, callback) {
  process.nextTick(function () {
    var address = data.find(function (item) {
      return item.id === id
    })

    callback(null, address)
  })
}

function findByPostcode (postcode, callback) {
  process.nextTick(function () {
    callback(null, data)
  })
}

module.exports = {
  findById: findById,
  findByPostcode: findByPostcode
}