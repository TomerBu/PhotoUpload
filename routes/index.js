//Unsecured route serving Welcome Page and a Playground.

var express = require('express'),
	router = express.Router(); 

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'ImagesApi' });
});


module.exports = router;
