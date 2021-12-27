var db = require('../../models/database.js')

module.exports.list = async function (req, res) {
    try {
        const sql = 'SELECT * FROM report'
        var params = []
        db.all(sql, params, (err, rows) => {
            if (err) {
                res.status(400).json({error: err.message})
                return
            }
            console.log(rows)
            res.render('report/list', {
                message: 'success',
                data: rows,
            })
        })
    } catch (err) {
        console.log(err)
    }
}
