// app.js

// Module dependencies

var express = require('express');
var mysql 	= require('mysql'); 
// ??? instalei o mysql que ficou no msm lugar que o node-mysql, mas dps vi que tinha essa pasta mysql la dentro

// Application initialization

var pool = mysql.createPool({
		connectionLimit : 1000,
		host	 		: 'localhost',
		user	 		: 'root',
		password 		: 'root'
	});

var app = express();


// Configuration
// app.use(express.bodyParser());

// Database setup

pool.getConnection(function(err, connection) {
	// connected

	connection.query('CREATE DATABASE IF NOT EXISTS hotelurbano', function(err) {
		if (err) throw err;
		connection.query('USE hotelurbano', function(err) {
			if (err) throw err;
			connection.query('CREATE TABLE IF NOT EXISTS hoteis('
				+ 'id INT NOT NULL AUTO_INCREMENT,'
				+ 'cidade VARCHAR(30),'
				+ 'nome VARCHAR(70),'
				+ 'PRIMARY KEY(id)'
				+ ')', function(err) {
					if (err) throw err;
				});
			connection.query("CREATE TABLE IF NOT EXISTS disponibilidade("
				+ "id_hotel INT NOT NULL REFERENCES hoteis(id),"
				+ "data DATE NOT NULL,"
				+ "disponivel INT DEFAULT '0',"		
				+ "PRIMARY KEY(id_hotel,data)"
				+ ")", function(err) {
					if (err) throw err;
				});
		});
	});

	connection.release();

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

// ---------- Select Endpoint

app.get('/select', function(req, res) {
	console.log('Executando uma query qualquer');

	pool.getConnection(function(err, connection) {
		if (err) throw err;
		connection.query('USE hotelurbano', function(err) {
			if (err) throw err;
			connection.query('SELECT * FROM hoteis WHERE 1=1', function(err, rows) {
				if (err) throw err;
				res.send(rows);
			});
		});

		connection.release();
	});

});

// ---------- Read File Endpoint

app.get('/import', function(req, res) {

	pool.getConnection(function(err, connection) {
		if (err) throw err;

		connection.query('USE hotelurbano', function(err) {
			if (err) throw err;
			
			connection.query('TRUNCATE TABLE hoteis', function(err) {
				if (err) throw err;

				var readline = require('readline');
				var fs = require('fs');

				var rl = readline.createInterface({
					input: fs.createReadStream('artefatos/hoteis.txt')
				});

				var sql_query = 'INSERT INTO hoteis(id, cidade, nome) VALUES ';

				rl.on('line', function(line) {
					values = line.split(",");
					sql_query = sql_query + "(" + values[0] + ",'" + values[1] + "','" + values[2] + "'),";
				});

				rl.on('close', function(line) {
					sql_query = sql_query.substr(0, sql_query.length-1) + ';';
					connection.query(sql_query, function(err) {
						if (err) throw err;
						console.log("Hoteis importados");
					});
				});

			});

			connection.query('TRUNCATE TABLE disponibilidade', function(err) {
				if (err) throw err;
				
				var readline = require('readline');
				var fs = require('fs');
				
				var rl = readline.createInterface({
					input: fs.createReadStream('artefatos/disp.txt')
				});

				var sql_query = 'INSERT INTO disponibilidade(id_hotel, data, disponivel) VALUES ';

				rl.on('line', function(line) {
					values = line.split(",");
					
					date = values[1].split("/");
					values[1] = date[2] + '-' + date[1] + '-' + date[0];

					sql_query = sql_query + "(" + values[0] + ",'" + values[1] + "'," + values[2] + "),";
				});

				rl.on('close', function(line) {
					sql_query = sql_query.substr(0, sql_query.length-1) + ';';
					connection.query(sql_query, function(err) {
						if (err) throw err;
						console.log("Disponibilidades importadas");
					});
				});

			});
		});

		connection.release();
	});
});


// Begin listening

app.listen(3000, function(err) {
  	console.log('Example app listening on port 3000!');


});