class FormatBL {
    Int16 = function (buf) {
        return buf.readInt16BE()
    }

    UInt16 = function (buf) {
        return buf.readUInt16BE()
    }

    Float = function (buf) {
        buf.swap16()
        return buf.readFloatLE()
    }

    Int32 = function (buf) {
        buf.swap16()
        return buf.readInt32LE()
    }

    UInt32 = function (buf) {
        buf.swap16()
        return buf.readUInt32LE()
    }

    Double = function (buf) {
        buf.swap16()
        return buf.readDoubleLE()
    }

    String = function (buf) {
        return buf.toString('utf8')
    }
}

module.exports = new FormatBL()
