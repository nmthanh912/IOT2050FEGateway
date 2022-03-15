const ShortUniqueId = require('short-unique-id')

const uniqueId = new ShortUniqueId({
    length: 8,
    dictionary: 'hex'
})

module.exports = uniqueId