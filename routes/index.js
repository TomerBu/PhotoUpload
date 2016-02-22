var express = require('express'),
	router = express.Router(),
	knox = require('knox');
	config = require('../config/config.js')
	path = require('path'),
	fs = require('fs');

var knoxClient = knox.createClient({
	key:config.AWS_S3_KEY,
	secret:config.AWS_S3_SECRET,
	bucket:config.AWS_S3_BUCKET
});
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


var multipart = require('connect-multiparty');
var multipartMiddleware = multipart({ uploadDir: './public/images' });

router.post('/upload', multipartMiddleware, function(req, res) {
	var file = req.files.fileUpload;
    console.log(file.name);

	  var ftype = file.type;
	  var fname = path.basename(file.path);
	  var fsize = file.size;

	  var stream = fs.createReadStream(file.path)
	  var request = knoxClient.putStream(stream, fname,{
	  	'Content-Length' : fsize,
	  	'Content-Type' : ftype
	  }, function(err, result){
	  		console.log(result, err);
	  });
	  
	  request.on('response', function(resp){
	  	if (resp.statusCode == 200) {
	  		res.json({'success':true});
	  	}
	  	else res.json({success:false});
	  });
});
 


module.exports = router;
