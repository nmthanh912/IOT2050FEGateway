var db = require('../../models/database.js')

module.exports.list = async function (req, res) {
    try {
        let gitVersion = 1
        let currentIP = 1

        const sql = 'SELECT * FROM config'
        var params = []
        db.all(sql, params, (err, rows) => {
            if (err) {
                res.status(400).json({error: err.message})
                return
            }
            console.log(rows)
            res.render('home/list', {
                message: 'success',
                data: rows,
                gitVersion: gitVersion,
            })
        })
    } catch (err) {
        console.log(err)
    }
}
