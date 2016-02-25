// var express = require('express');
// var router = express.Router();

// var config = require('../config/config.js');
// var mysql = require("mysql");

// // First you need to create a connection to the db
// var pool = mysql.createPool({
//   host: config.dbHost,
//   user: config.dbUser,
//   password: config.dbPass,
//   database : config.dbName,
//   connectionLimit : 100
// });

// route to return all users (GET http://localhost:3000/api/users)
// router.get('/api/users', function(req, res) {
//   pool.getConnection((err, con)=>{
//   	if (err) {throw err;}
//   	con.query('SELECT * FROM User', function(err, rows){
//   		var result = {};
//   		result.users = rows;
//   		res.json(result);
//   	});
//   });
// });



//usage: http://localhost:3000/tomer
// router.get('/:name', (req, res)=>{
// 	res.json({hello: req.params.name});
// });

// //usage: http://localhost:3000/tomer/bu
// router.get('/:name/:lastName', (req, res)=>{
// 	res.json({hello: req.params.name + req.params.lastName});
// });


//## Create a test user table and insert one user:
// var query = 'create table User(id int primary key auto_increment,'
// 							+' name text not null,'+
// 							 ' pass text not null, phone TEXT not null)';

// var user = {name: 'TomerBu', pass:'1234', phone:'0507123012'};
// query = 'insert into User SET ?'
// pool.getConnection((err, con)=>{
// 	con.query(query, user, (err, response)=>{
// 		if (err) {throw err;}
//		con.release();
// 	});
// });


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