const {dbRun, dbAll, db} = require('../models/database.js')
const handler = require('./handler')

class Tag {
    getAll = async function (req, res) {
        const tagQuery = `SELECT * FROM ${req.query.protocol}_TAG WHERE deviceID = ?`
        const tagParams = [req.params.id]

        handler(res, async () => {
            const tags = await dbAll(tagQuery, tagParams)
            tags.forEach((tag) => {
                delete tag.deviceID
            })

            if (tags.length === 0) {
                const infos = await dbAll(`PRAGMA table_info (${req.query.protocol}_TAG)`)
                tags.push({})
                infos.forEach((info) => {
                    let key = info.name
                    tags[0][key] = ''
                })

                delete tags[0].deviceID
            }
            res.json(tags)
        })
    }
}

module.exports = new Tag()
