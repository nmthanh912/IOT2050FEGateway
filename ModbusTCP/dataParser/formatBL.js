class FormatBL {
    Int16 = function (buf) {
        return buf.readInt16BE()
    }

    UInt16 = function (buf) {
        return buf.readUInt16BE()
    }

    Float = function (buf) {
        buf.swap16()
        return buf.readFloatBE()
    }

    Int32 = function (buf) {
        buf.swap16()
        return buf.readInt32BE()
    }

    UInt32 = function (buf) {
        buf.swap16()
        return buf.readUInt32BE()
    }

    Double = function (buf) {
        buf.swap16()
        return buf.readDoubleBE()
    }

    String = function (buf) {
        return buf.toString('utf8')
    }
}

module.exports = new FormatBL()
