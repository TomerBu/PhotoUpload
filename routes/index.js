var express = require('express'),
	router = express.Router(),
	knox = require('knox');
	config = require('../config/config.js')
	path = require('path'),
	fs = require('fs');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//Database access to RDS MySql using mysql npm module
var mysql = require("mysql");

// First you need to create a connection to the db
var pool = mysql.createPool({
  host: config.dbHost,
  user: config.dbUser,
  password: config.dbPass,
  database : config.dbName,
  connectionLimit : 100
});
// A Full Tutorial / Reference:
//https://github.com/felixge/node-mysql


//Examples:
//###Use the pool to aquire a connection and perform a select statememt
// pool.getConnection(function(err, con){
//   if (err) {console.error('Error establishing Connection to db');con.release(); return;}
//   console.log('Connection established');
//   con.query('SELECT * FROM test_table', function(err, rows){
//     if (err) {con.release();throw err;}
//     console.log('Data is here, Stay Tuned:');
//     console.log(rows);
//     con.release(); //release the connection to the pool
//   });
// });
 
//###Escaping user varaibles in select:
// con.query(
//   'SELECT * FROM UserPhotos WHERE user =' + mysql.escape(userInput), 
//   function(err,rows){ ... }
// );



//###Escaping in INSERT:

// var userPhoto = {user:userID, photoUrl:fname};
// con.query('INSERT INTO UserPhotos SET ?',userPhoto,function(err, result){
// 	if (err) {throw err;}
// 	console.log(result.insertId);
// 	con.release();
// });

//uploading the pothos to s3 using knox & connect-multiparty:
var knoxClient = knox.createClient({
	key:config.AWS_S3_KEY,
	secret:config.AWS_S3_SECRET,
	bucket:config.AWS_S3_BUCKET
});

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart({ uploadDir: './public/images' });

router.post('/upload', multipartMiddleware, function(req, res) {
	var userID = req.body.user;
	var userIDParam = mysql.escape(userID);

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
	  		//Save the imageURL And user to the Database
	  		pool.getConnection((err, con)=>{
	  			var userPhoto = {user:userID, photoUrl:fname};
	  			con.query('INSERT INTO UserPhotos SET ?',userPhoto,function(err, result){
	  				if (err) {throw err;}
	  				console.log(result.insertId);
	  				con.release();
	  			});
	  		});
	  		res.json({'success':true, filename:fname});
	  	}
	  	else res.json({success:false});
	  });
});
 
//getting an image
router.get('/myimage', function(req, res){
	knoxClient.getFile('Ocb-PxlncNoSYFY3IWLfZVH1.jpg', function(err, imageStream) {
	     imageStream.pipe(res);
	});
});

module.exports = router;
