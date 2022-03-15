const ShortUniqueId = require('short-unique-id')
const {dbRun, dbAll} = require('../../models/database.js')
const handler = require('../handler')

class Tag {
    getAll = async function (req, res) {
        const getTagQuery = `SELECT * FROM ${req.query.protocol}_TAG WHERE deviceID = ?`
        const getTagParams = [req.params.id]

        handler(res, async () => {
            const tags = await dbAll(getTagQuery, getTagParams)

            tags.forEach((tag) => {
                delete tag.deviceID
            })
            res.json(tags)
        })
    }
}

module.exports = new Tag()
