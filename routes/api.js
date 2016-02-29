var express = require('express');
var router = express.Router();
var middlewares = require('../middleware/middlewares.js');
var config = require('../configd/config.js');
var mysql = require("mysql");
var knox = require('knox');
var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt');

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

router.post('/newUser', (req, res)=>{
    var user = req.body.user;
    var phone = req.body.phone;
    var pass = req.body.pass;

    if (!user||!pass||!phone) {return res.json({'sucess':false, description:'missing params'});}
    bcrypt.genSalt(14, function(err, salt) {
      if (err) throw err;
      bcrypt.hash(pass, salt, function(err, hash) {
      // Store hash in your password DB.
      saveNewUser(user, phone, pass, (err, userId)=>{
        if (err) {throw err;}
        res.json({'sucess':true, userId:userId});
      });
    });
  });
});
//callback(err, insertId)
//response: {id:<userId>}
function saveNewUser(userName, phone, pass, callback){
  pool.getConnection((err, con)=>{
    if (err) {callback(err, null);}

      var user = {phone:phone, name:userName, pass:pass};
      con.query("INSERT INTO User SET ?", user, (err, result)=>{
        if (err) {callback(err, null);}
        callback(null, result.insertId);
        con.release;
      });
  });
}


router.get('/image/:imageName', (req, res)=>{
    var imageName = req.params.imageName;
    knoxClient.getFile(imageName, function(err, imageStream) {
       imageStream.pipe(res);
    });
});

module.exports = router;
