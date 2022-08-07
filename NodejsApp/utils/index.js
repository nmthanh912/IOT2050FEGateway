const handler = require("./handler")
const { logError } = require("./logger")
const removeAccents = require("./removeAccents")
const { renameObjectKey } = require("./renameObjectKey")
const uniqueId = require("./uniqueId")

module.exports = {
    handler,
    logError,
    removeAccents,
    renameObjectKey,
    uniqueId
}