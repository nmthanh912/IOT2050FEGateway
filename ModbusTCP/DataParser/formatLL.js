class FormatLL {
    Int16 = function (PF, buf) {
        const value = buf.readInt16BE() * Math.pow(10, PF)
        return Number(value.toFixed(Math.abs(PF)))
    }

    UInt16 = function (PF, buf) {
        const value = buf.readUInt16LE() * Math.pow(10, PF)
        return Number(value.toFixed(Math.abs(PF)))
    }  

    Float = function (PF, buf) {
        const value = buf.readFloatLE() * Math.pow(10, PF)
        return Number(value.toFixed(Math.abs(PF)))
    }

    Int32 = function (PF, buf) {
        const value = buf.readInt32LE() * Math.pow(10, PF)
        return Number(value.toFixed(Math.abs(PF)))
    }

    UInt32 = function (PF, buf) {
        const value = buf.readUInt32LE() * Math.pow(10, PF)
        return Number(value.toFixed(Math.abs(PF)))
    }

    Double = function (PF, buf) {
        const value = buf.readDoubleLE() * Math.pow(10, PF)
        return Number(value.toFixed(Math.abs(PF)))
    }

    String = function (buf) {
        return buf.toString('utf8')
    }
}

module.exports = new FormatLL()