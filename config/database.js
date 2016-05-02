// database.js

var mysql = require('mysql'); 

var pool = mysql.createPool({
		connectionLimit : 1000,
		host	 		: 'localhost',
		user	 		: 'root',
		password 		: 'root'
	});

// exports the whole connection pool
module.exports = pool;