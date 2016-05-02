// main.js

// set up
var express = require('express');
var app = express();
var database = require('./config/database'); 
var bodyParser = require('body-parser');

// configuration
app.use('/public',express.static('public'));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.status(400).send(error.message);
});

// routes
require('./api/routes')(app, database);

// main route
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

// listen
app.listen(3000, function (err) {
		console.log('Example app listening on port 3000!');
});

module.exports = app;