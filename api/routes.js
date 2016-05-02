// routes.js

var NodeCache = require('node-cache');
var cache = new NodeCache();

var initDatabase = require('../config/database_setup');

module.exports = function (app, database) {

// =============== import route ===========================

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

	
}