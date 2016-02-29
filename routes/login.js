var express = require('express');
var router = express.Router();
var config = require('../configd/config.js');
var jwt = require('jsonwebtoken');
//Database access to RDS MySql using mysql npm module
var mysql = require("mysql");
//hash and salt your passwords:
var bcrypt = require('bcrypt');
// First you need to create a connection to the db
var pool = mysql.createPool({
  host: config.dbHost,
  user: config.dbUser,
  password: config.dbPass,
  database : config.dbName,
  connectionLimit : 100
});

//post request to get a token
router.post('/auth', function(req, res){
	// find the user
	//console.log(req.body);
  console.log("your in auth");

	if (!req.body) {res.json({sucess:false, message:'Auth Failed No Params'});return}
	var name = req.body.name, pass = req.body.pass;
	if (!name || !pass) {res.json({sucess:false, message:'Auth Failed No Params'});return}

    pool.getConnection((err, con)=>{
  	if (err) {throw err;}
  	var q = con.query('SELECT * FROM User WHERE name = ?', [req.body.name], (err, rows)=>{
  		if (err) {throw err;}
  		con.release();
  		if (!rows || !rows[0]) {res.json({sucess:false, message:'Auth Failed No Such User'});}
  		else if (rows[0].pass != req.body.pass) {
  			res.json({sucess:false, message:'Auth Failed Wrong pass'});
  		}
  		else{
  			var token = jwt.sign(rows[0], config.secret, {
  				expiresIn: '1 days' //24 hours
  			});
  			res.json({sucess:true, token:token, message: 'Enjoy'});
  		}
  	});
  	//console.log(q);
  });
});


router.post('/newUser', req, res()=>{
    var user = req.params.user;
    var phone = req.params.phone;
    var pass = req.params.pass;

    if (!user||!pass||!secret) {return res.json({'sucess':false, description:'no credentials'});}
    bcrypt.genSalt(14, function(err, salt) {
      if (err) throw err;
      // execution time 
      var end = new Date() - start;
      bcrypt.hash(pass, salt, function(err, hash) {
      // Store hash in your password DB.
      saveNewUser(user, phone, pass, (err, userId)=>{
        if (err) {throw err;}
        console.log('Execution time: %dms', end);
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


module.exports = router;