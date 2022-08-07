const renameObjectKey = function (obj, oldKey, newKey) {
    obj[newKey] = obj[oldKey]
    delete obj[oldKey]
    return obj
}

module.exports = { renameObjectKey }