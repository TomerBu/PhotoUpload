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

	if (!req.body) {return res.json({sucess:false, message:'Auth Failed No Params'});}
	var name = req.body.name, pass = req.body.pass;
	if (!name || !pass) {return res.json({sucess:false, message:'Auth Failed No Params'});}

    pool.getConnection((err, con)=>{
  	if (err) {throw err;}
  	var q = con.query('SELECT * FROM Admin WHERE name = ?', [req.body.name], (err, rows)=>{
  		if (err) {throw err;}
  		con.release();
  		if (!rows || !rows[0]) {res.json({sucess:false, message:'Auth Failed, Wrong credentials'});}
  		else {
        bcrypt.compare(pass, rows[0].pass, (err, result)=>{
          if (result == true) {
            var token = jwt.sign(rows[0], config.secret, {
              expiresIn: '1 days' //24 hours
            });
            res.json({sucess:true, token:token, message: 'Enjoy'});
          }else{
            res.json({sucess:false, message:'Auth Failed, Wrong credentials'});
          }
        })
  			
  		}
  	});
  	//console.log(q);
  });
});

module.exports = router;