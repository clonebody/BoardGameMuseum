var express = require('express');
var router = express.Router();

//var Game = require('../routes/Game');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { docTitle: '主页' });
});

module.exports = router;
