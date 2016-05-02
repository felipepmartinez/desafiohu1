 // database_setup

var database = require('../config/database');

// create database if not exists and set it up
var initDatabase = function (cb) {
	database.getConnection( function (err, connection) {
		if (err) return cb(err);

		connection.query('CREATE DATABASE IF NOT EXISTS hotelurbano', function(err) {
			if (err) return cb(err);
		
			connection.query('USE hotelurbano', function(err) {
				if (err) return cb(err);
		
				connection.query('CREATE TABLE IF NOT EXISTS hoteis('
					+ 'id INT NOT NULL AUTO_INCREMENT,'
					+ 'cidade VARCHAR(30),'
					+ 'nome VARCHAR(70),'
					+ 'PRIMARY KEY(id)'
					+ ')', function(err) {
						if (err) return cb(err);

						connection.query("CREATE TABLE IF NOT EXISTS disponibilidade("
							+ "id_hotel INT NOT NULL REFERENCES hoteis(id),"
							+ "data DATE NOT NULL,"
							+ "disponivel INT DEFAULT '0',"		
							+ "PRIMARY KEY(id_hotel,data)"
							+ ")", function(err) {
								if (err) return cb(err);
						
							cb(null, connection);		
						});		
				});
			});
		});
	});
};

// exports init database function
module.exports = initDatabase;