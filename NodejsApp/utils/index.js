const { logError } = require("./logger")
const removeAccents = require("./removeAccents")
const { renameObjectKey } = require("./renameObjectKey")
const uniqueId = require("./uniqueId")

module.exports = {
    logError,
    removeAccents,
    renameObjectKey,
    uniqueId
}