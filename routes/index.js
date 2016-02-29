//Unsecured route serving Welcome Page and a Playground.

var express = require('express'),
	router = express.Router(),
	bcrypt = require('bcrypt');
/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'ImagesApi' });
});


router.get('/passdemo/:pass', (req, res)=>{
	var pass = req.params.pass;
	if (!pass) {res.json({'sucess':false, descrition:'no password in query'});}
	var start = new Date();
	//https://www.npmjs.com/package/bcrypt
	bcrypt.genSalt(14, function(err, salt) {
		//hash(data, salt, cb)
		if (err) {throw err;}
		// execution time 
	    var end = new Date() - start;
	    bcrypt.hash(pass, salt, function(err, hash) {
	    // Store hash in your password DB.

	    console.log("Execution time: %dms", end);
	    res.json({'sucess':true});
	    });
	});
});

module.exports = router;
