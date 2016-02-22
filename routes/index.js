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




function fileAccess(filepath) {
	return new Promise((resolve, reject) => {
		fs.access(filepath, fs.F_OK, error => {
			if(!error) {
				resolve(filepath);
			} else {
				reject(error);
			}
		});
	});
}

function streamFile(filepath) {
	return new Promise((resolve, reject) => {
		var fileStream = fs.createReadStream(filepath);

		fileStream.on('open', () => {
			resolve(fileStream);
		});

		fileStream.on('error', error => {
			reject(error);
		});
	});
}

router.get('/myimage', function(req, res){
	knoxClient.getFile('Ocb-PxlncNoSYFY3IWLfZVH1.jpg', function(err, imageStream) {
	     imageStream.pipe(res);
	});
})




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
	  		res.json({'success':true, filename:fname});
	  	}
	  	else res.json({success:false});
	  });
});
 


module.exports = router;
