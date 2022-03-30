class FormatBL {
    Int16 = function (PF, buf) {
        const value = buf.readInt16BE() * Math.pow(10, PF)
        return Number(value.toFixed(Math.abs(PF)))
    }

    UInt16 = function (PF, buf) {
        const value = buf.readUInt16BE() * Math.pow(10, PF)
        return Number(value.toFixed(Math.abs(PF)))
    }

    Float = function (PF, buf) {
        buf.swap16()
        const value = buf.readFloatBE() * Math.pow(10, PF)
        return Number(value.toFixed(Math.abs(PF)))
    }

    Int32 = function (PF, buf) {
        buf.swap16()
        const value = buf.readInt32BE() * Math.pow(10, PF)
        return Number(value.toFixed(Math.abs(PF)))
    }

    UInt32 = function (PF, buf) {
        buf.swap16()
        const value = buf.readUInt32BE() * Math.pow(10, PF)
        return Number(value.toFixed(Math.abs(PF)))
    }

    Double = function (PF, buf) {
        buf.swap16()
        const value = buf.readDoubleBE() * Math.pow(10, PF)
        return Number(value.toFixed(Math.abs(PF)))
    }

    String = function (buf) {
        return buf.toString('utf8')
    }
}

module.exports = new FormatBL()