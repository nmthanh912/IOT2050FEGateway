const { dbRun, dbAll } = require('../models/database.js')
const handler = require('../utils/handler')

class Tag {
    getAll = async function (req, res) {
        const tagQuery = `SELECT * FROM ${req.query.protocol}_TAG WHERE deviceID = ? ORDER BY address ASC`
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
    async editAttribute(req, res) {
        const deviceID = req.params.id
        const { protocol, tagName, attr } = req.query
        const newValue = req.body.newValue
        const query = attr === 'name' ? {
            SQL: `UPDATE TAG SET ${attr} = ? WHERE deviceID = ? AND name = ?`,
            params: [newValue, deviceID, tagName]
        } : {
            SQL: `UPDATE ${protocol}_TAG SET ${attr} = ? WHERE deviceID = ? AND name = ?`,
            params: [newValue, deviceID, tagName]
        }
        handler(res, async () => {
            await dbRun(query.SQL, query.params)
            res.json({ msg: 'OK' })
        })
    }
    async deleteTag(req, res) {
        const deviceID = req.params.id
        const tagName = req.query.tagName
        const query = `DELETE FROM TAG WHERE deviceID = ? AND name = ?`
        handler(res, async () => {
            await dbRun(query, [deviceID, tagName])
            res.json({ msg: 'OKE' })
        })
    }
    async addTag(req, res) {
        const deviceID = req.params.id
        const protocol = req.query.protocol
        const data = [
            req.body.name,
            req.body.address,
            req.body.unit,
            req.body.dataType,
            req.body.PF,
            req.body.size,
            deviceID
        ]

        const colNumber = data.length
        const query1 = `INSERT INTO TAG (deviceID, name) VALUES (?, ?)`
        const query2 = `INSERT INTO ${protocol}_TAG VALUES (${'?,'.repeat(colNumber).slice(0, -1)})`

        handler(res, async () => {
            try {
                await dbRun('BEGIN TRANSACTION')
                await dbRun(query1, [deviceID, data[0]/*tag name*/])
                await dbRun(query2, data)
                await dbRun('COMMIT')
                res.json({ msg: "OKE" })
            } catch(err) {
                await dbRun('ROLLBACK')
                throw err
            }
        })
    }
}

module.exports = new Tag()
