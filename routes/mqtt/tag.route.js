var express = require('express')
var router = express.Router()

//router.use(express.static(__dirname + './public'));

var controller = require('../../controllers/modbus-tcp/tag.controller')
// var validate = require('../validate/user.validate');
// var middleware = require('../middlewares/auth.middleware');

//router.get('/', middleware.requireAuth, controller.list);
router.get('/', controller.list)
router.get('/add', controller.getAdd)
router.post('/add', controller.postAdd)

router.get('/edit/:id', controller.getEdit)
router.post('/edit/:id', controller.postEdit)

router.get('/delete/:id', controller.getDelete)

// router.get('/', function(req, res) {
// 	res.render('users/list');
// });

// router.get('/add', function(req, res) {
// 	res.render('users/list');
// });

module.exports = router
