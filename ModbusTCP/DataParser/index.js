const FormatBB = require('./formatBB')
const FormatBL = require('./formatBL')
const FormatLB = require('./formatLB')
const FormatLL = require('./formatLL')

const BE = 'Big Endian'
const LE = 'Little Endian'

function DataParser(byteOrder, wordOrder) {
    if (byteOrder === BE && wordOrder === BE) {
        return FormatBB
    } else if (byteOrder === BE && wordOrder === LE) {
        return FormatBL
    } else if (byteOrder === LE && wordOrder === BE) {
        return FormatLB
    } else if (byteOrder === LE && wordOrder === LE) {
        return FormatLL
    } else {
        return 'Invalid Data Format!'
    }
}

module.exports = DataParser
