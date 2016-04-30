// app.js

var cluster = require('cluster');
var http = require('http');

var numCPUs =  require('os').cpus().length;

if (cluster.isMaster) {
	for (var i = 0; i < numCPUs; i++) {
		cluster.fork();
	}
} else {

// Module dependencies

var express = require('express');
var mysql 	= require('mysql'); 

var bodyParser = require('body-parser');


var NodeCache = require('node-cache');
var cache = new NodeCache();

// Application initialization

var pool = mysql.createPool({
		connectionLimit : 1000,
		host	 		: 'localhost',
		user	 		: 'root',
		password 		: 'root'
	});

var app = express();

// Middleware configuration
app.use('/static', express.static('static'));

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));          

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

// ----------- Main route 

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});


// ---------- Select Endpoint

app.post('/select', function(req, res) {
	
	console.log(req.body);

	var local = req.body["local"];
	var dataInicio = req.body["inicio"];
	var dataFim = req.body["fim"];

	var cacheKey = local + dataInicio + dataFim;
	console.log("cache key: ", cacheKey);

	// check if the key is cached
	cache.get(cacheKey, function(err, result) {
		if (err) throw err;

		if (result == undefined) {
			// not in cache: manual search
    		console.log("Resultado nao encontrado em cache");

			pool.getConnection(function(err, connection) {
				if (err) throw err;
				connection.query('USE hotelurbano', function(err) {
					if (err) throw err;

					sql =   "SELECT * " 
							+ "FROM	hoteis "
							+ "WHERE (nome = '" + local + "' OR cidade = '" + local +"') "
							+ "AND	id IN ("
							+ "		SELECT id_hotel"
							+ "		FROM 	disponibilidade"
							+ "		WHERE	disponivel = 1";
					if (dataInicio.length > 0 && dataFim.length > 0) {
						sql = sql + "	AND data >= '" + dataInicio + "'"
								  + "	AND data <= '" + dataFim + "'";
					}

					sql = sql + ");";

					console.log(sql);

					connection.query(sql, function(err, rows) {		
						if (err) throw err;
						console.log("rows:",rows);
							// store new data in cache
						cache.set(cacheKey, rows);
						res.json(rows);
						console.log("enviou");
					});

				});

				connection.release();
			});

		} else {
			console.log(result);
			res.json(result);
			console.log("enviou dado cacheado");
		}
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

} // end else - workers