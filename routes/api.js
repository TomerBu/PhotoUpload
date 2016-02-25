var express = require('express');
var router = express.Router();
var middlewares = require('../middleware/middlewares.js');
var config = require('../configd/config.js');
var mysql = require("mysql");
var knox = require('knox');
var fs = require('fs');
var path = require('path');

// First you need to create a connection to the db
var pool = mysql.createPool({
  host: config.dbHost,
  user: config.dbUser,
  password: config.dbPass,
  database : config.dbName,
  connectionLimit : 100
});

//uploading the pothos to s3 using knox & connect-multiparty:
var knoxClient = knox.createClient({
  key:config.AWS_S3_KEY,
  secret:config.AWS_S3_SECRET,
  bucket:config.AWS_S3_BUCKET
});

//Auth Middleware Must be used before all other routes
router.use(middlewares.tokenVerifier);

var formidable = require('express-formidable');
var formidableMiddleware = formidable.parse({keepExtensions:true, uploadDir:'./public/images'}); 


router.post('/upload', function(req, res) {
  var userId = req.body.userId;
  var userIDParam = mysql.escape(userId);

  var file = req.body.fileUpload;
  console.log(file.name);

  var ftype = file.type;
  var fname = path.basename(file.path);
  var fsize = file.size;

  var stream = fs.createReadStream(file.path);
  var request = knoxClient.putStream(stream, fname,{
    'Content-Length' : fsize,
    'Content-Type' : ftype
  }, function(err, result){
      //console.log(result, err);
      if (err) {throw err}
  });

  request.on('response', function(resp){
    if (resp.statusCode == 200) {
      //Save the imageURL And user to the Database
      pool.getConnection((err, con)=>{
        var photo = {userId:userId, url:fname};
        con.query('INSERT INTO Photo SET ?',photo,function(err, result){
          if (err) {throw err;}
          console.log(result.insertId);
          con.release();
        });
      });
      res.json({'success':true, filename:fname});
    }
    else {console.error(resp)};
  });
});

router.get('/images/:userId', (req, res)=>{
  var userId = req.params.userId
  
  pool.getConnection((err, con)=>{
    if (err) {throw err;}

    con.query('SELECT * FROM Photo WHERE userId = ?',[userId], function(err, rows){
      if (err) {throw err;}

      var result = {};
      result.photos = rows;
      res.json(result);
    });
  });
});



router.get('/image/:imageName', (req, res)=>{
    var imageName = req.params.imageName;
    knoxClient.getFile(imageName, function(err, imageStream) {
       imageStream.pipe(res);
    });
});

module.exports = router;
