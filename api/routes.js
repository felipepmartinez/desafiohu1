// routes.js

var NodeCache = require('node-cache');
var cache = new NodeCache();

var initDatabase = require('../config/database_setup');

module.exports = function (app, database) {

// ================== import route ===========================

	app.get('/import', function (req, res) {

		initDatabase(function (err, connection) {
			if (err) throw err;

			connection.query('USE hotelurbano', function (err) {
				if (err) throw err;
				
				connection.query('TRUNCATE TABLE hoteis', function (err) {
					if (err) throw err;

					var readline = require('readline');
					var fs = require('fs');

					var rl = readline.createInterface({
						input: fs.createReadStream('public/artefatos/hoteis.txt')
					});

					var sql_query = 'INSERT INTO hoteis(id, cidade, nome) VALUES ';

					rl.on('line', function (line) {
						var values = line.split(",");
						sql_query = sql_query + "(" + values[0] + ",'" + values[1] + "','" + values[2] + "'),";
					});

					rl.on('close', function (line) {
						sql_query = sql_query.substr(0, sql_query.length-1) + ';';
						connection.query(sql_query, function (err) {
							if (err) throw err;
							console.log("Hoteis importados");

							connection.query('TRUNCATE TABLE disponibilidade', function (err) {
								if (err) throw err;
								
								var readline_disp = require('readline');
								var fs_disp = require('fs');
								
								var rl_disp = readline_disp.createInterface({
									input: fs_disp.createReadStream('public/artefatos/disp.txt')
								});

								var sql_query_disp = 'INSERT INTO disponibilidade(id_hotel, data, disponivel) VALUES ';

								rl_disp.on('line', function (line) {
									var values = line.split(",");
									
									date = values[1].split("/");
									values[1] = date[2] + '-' + date[1] + '-' + date[0];

									sql_query_disp = sql_query_disp + "(" + values[0] + ",'" + values[1] + "'," + values[2] + "),";
								});

								rl_disp.on('close', function (line) {
									sql_query_disp = sql_query_disp.substr(0, sql_query_disp.length-1) + ';';
									connection.query(sql_query_disp, function (err) {
										if (err) throw err;

										console.log("Disponibilidades importadas");
										connection.release();
									});
								});

							});
						});
					});

				});

				
			});
		
		});
	});

// ================== select route ===========================

	app.post('/select', function (req, res) {
		
		var local = req.body["local"];
		var dataInicio = req.body["inicio"];
		var dataFim = req.body["fim"];

		var cacheKey = local + dataInicio + dataFim;

		// check if the key is cached
		cache.get(cacheKey, function (err, result) {
			if (err) throw err;

			if (result == undefined) {
				// not in cache: manual search
				database.getConnection(function (err, connection) {
					if (err) throw err;
					connection.query('USE hotelurbano', function (err) {
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

						connection.query(sql, function (err, rows) {		
							if (err) throw err;

							// store new data in cache
							cache.set(cacheKey, rows);

							connection.release();
						});

					});

				});

			} else {
				// in cache: send result
				res.json(result);
			}
		});

	});

// ================== suggest route ==========================

app.post('/suggest', function(req, res) {

	var term = req.body["term"];

	const maxSuggestions = 6;
	var cacheKey = term;

	// check if the key is cached
	cache.get(cacheKey, function (err, result) {
		if (err) throw err;

		if (result == undefined) {
			// not in cache: manual search
			database.getConnection(function (err, connection) {
				if (err) throw err;

				connection.query('USE hotelurbano', function (err) {
					if (err) throw err;

					sql = "SELECT cidade " 
						+ "FROM	hoteis "
						+ "WHERE cidade LIKE CONCAT('" + term + "', '%') UNION "
						+ "SELECT nome " 
						+ "FROM	hoteis "
						+ "WHERE nome LIKE CONCAT('" + term + "', '%');";

					console.log(sql);
					connection.query(sql, function (err, rows) {		
						if (err) throw err;
						
						var data = [];
						for (var i = 0; i < rows.length && i < maxSuggestions; i++) {
							data.push(rows[i].cidade);
						}
						data = JSON.stringify(data);
						
						// store new data in cache
						cache.set(cacheKey, data);

						res.end(data);
						connection.release();
					});

				});
			});

		} else {
			// in cache: send result
			res.end(result);
		}
				
	});

});
	
}