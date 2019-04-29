var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/mylogin', function(req, res, next) {
  res.render('lftest', { title: 'mylogin' });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
