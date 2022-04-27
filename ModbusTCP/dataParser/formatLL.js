class FormatLL {
    Int16 = function (buf) {
        return buf.readInt16LE()
    }

    UInt16 = function (buf) {
        return buf.readUInt16LE()
    }

    Float = function (buf) {
        return buf.readFloatLE()
    }

    Int32 = function (buf) {
        return buf.readInt32LE()
    }

    UInt32 = function (buf) {
        return buf.readUInt32LE()
    }

    Double = function (buf) {
        return buf.readDoubleLE()
    }

    String = function (buf) {
        return buf.toString('utf8')
    }
}

module.exports = new FormatLL()
