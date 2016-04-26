// app.js

// Module dependencies

var express = require('express');
var mysql 	= require('mysql'); 
// ??? instalei o mysql que ficou no msm lugar que o node-mysql, mas dps vi que tinha essa pasta mysql la dentro

// Application initialization

var connection = mysql.createConnection({
		host	 : 'localhost',
		user	 : 'root',
		password : 'root'
	});

var app = express();


// Configuration
// app.use(express.bodyParser());

// Database setup

connection.connect();

connection.query('CREATE DATABASE IF NOT EXISTS hotelurbano', function(err) {
	if (err) throw err;
	connection.query('USE hotelurbano', function(err) {
		if (err) throw err;
		connection.query('CREATE TABLE IF NOT EXISTS hoteis('
			+ 'id INT NOT NULL AUTO_INCREMENT,'
			+ 'cidade VARCHAR(30),'
			+ 'nome VARCHAR(50),'
			+ 'PRIMARY KEY(id)'
			+ ')', function(err) {
				if (err) throw err;
			});
		connection.query('CREATE TABLE IF NOT EXISTS disponibilidade('
			+ 'id INT NOT NULL AUTO_INCREMENT,'
			+ 'id_hotel INT NOT NULL REFERENCES hoteis(id),'
			+ 'data DATE NOT NULL,'
			+ 'disponivel INT DEFAULT \x270\x27,'		// escape '
			+ 'PRIMARY KEY(id)'
			+ ')', function(err) {
				if (err) throw err;
			});
	});
});

//connection.end(function(err) {
  // The connection is terminated now
//});


// Connection test


// Main route : Hello World

app.get('/', function (req, res) {
  res.send('Hello World!!');
});


// Import route : Import data from 'artefatos'

app.post('/import', function(req, res) {
	res.send('Import data from artefatos');
});


// Begin listening

app.listen(3000, function(err) {
  	console.log('Example app listening on port 3000!');


});