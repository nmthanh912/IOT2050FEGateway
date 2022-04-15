const FormatBB = require('./formatBB')
const FormatBL = require('./formatBL')
const FormatLB = require('./formatLB')
const FormatLL = require('./formatLL')

const BE = 'BigEndian'
const LE = 'LittleEndian'

function DataFormat(byteOrder, wordOrder) {
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

function DataDecode(dataFormat, dataType, PF, buf) {
    var value = null

    if (dataFormat === 'Invalid Data Format!') {
        value = 'Invalid Data Format!'
    } else {
        if (dataType === 'int16') {
            value = dataFormat.Int16(buf)
        } else if (dataType === 'uint16') {
            value = dataFormat.UInt16(buf)
        } else if (dataType === 'float32') {
            value = dataFormat.Float(buf)
        } else if (dataType === 'int32') {
            value = dataFormat.Int32(buf)
        } else if (dataType === 'uint32') {
            value = dataFormat.UInt32(buf)
        } else if (dataType === 'double') {
            value = dataFormat.Double(buf)
        } else if (dataType === 'string') {
            value = dataFormat.String(buf)
        } else {
            value = 'Not supported type!'
        }
    }

    if (typeof value !== 'string') {
        value = value * Math.pow(10, PF)
        value = Number(value.toFixed(Math.abs(PF)))
    }
    return value
}

module.exports = {
    DataFormat,
    DataDecode,
}
