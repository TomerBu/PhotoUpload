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
	console.log(pass);
	var start = new Date();

	bcrypt.genSalt(14, function(err, salt) {
		//hash(data, salt, progress, cb)
	    bcrypt.hash(pass, salt, progressCallback, function(err, hash) {
	        // Store hash in your password DB.
	    
		// execution time 
	    var end = new Date() - start;
	    console.info("Execution time: %dms", end);
	    res.json({'sucess':true});
	    });
	});
});

function progressCallback(p) {
	console.log(Math.floor(p*100) + '%' );


}

module.exports = router;
