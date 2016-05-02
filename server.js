// app.js

var cluster = require('cluster');
var http = require('http');

var numCPUs =  require('os').cpus().length;

if (cluster.isMaster) {
	
	for (var i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

} else {

	require('./main');
}
