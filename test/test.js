// test.js

var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var request = require('supertest');
var app = require('../main');

var database = require('../config/database');


// test main route
describe("Main page", function () {
	it("should return a 200 response", function (done) {
    	request(app)
    		.get("/")
    		.expect(200, done);
    });
    it("should contain all expected text", function (done) {
    	request(app)
    		.get("/")
    		.expect(200)
    		.end(function (err, res) {
    			res.text.should.include("+ 1.700 hoteis, pousadas e resorts em todo o mundo");
    			res.text.should.include("Quer ficar onde?");
    			res.text.should.include("Quando? (Entrada e Saída)");
    			res.text.should.include("Ainda não defini as datas");
    		});
    		done();
    });
});

// suggest route
describe("Autocomplete hotel/city field", function () {

	var checkArrayFor = function (string) {
		request(app)
			.post("/suggest")
			.type("form")
			.send({term: string})
  			.end( function (err, data) {
  				var res = JSON.parse(data.text);

  				for (var i = 0; i < res.length; i++) {
  					res[i].should.contain(string);
  				}
  				expect(res.length).to.be.above(1);
    			
			});
  	};

	it("should suggest names of cities with the same beginning", function (done) {
		checkArrayFor("Rio"); // Rio de Janeiro, Rio Claro
		done();
  	});

	it("should suggest names of hotels with the same beginning", function (done) {
		checkArrayFor("El"); // El Dorado, El Hotelito
		done();
	});

	it("should suggest both cities and hotels", function (done) {
		checkArrayFor("Ri"); // Rio de Janeiro, Riviera Park
    	done();
	});

	it("should not return anything that is not in the database", function (done) {
		request(app)
			.post("/suggest")
			.type("form")
			.send({term: "32ad"})
  			.end( function (err, data) {
  				var res = JSON.parse(data.text);

  				expect(res).to.be.empty;
    			done();
			});
	});
});

// select route
describe("Search for availables hotels", function () {

	it("should search for cities with start and end dates", function (done) {
		
		request(app)
			.post("/select")
			.type("form")
			.send({
				  "local": "Rio de Janeiro", 
				   "inicio": "2015-05-01", 
				   "fim": "2015-05-10"
				})
  			.end( function (err, data) {
  				
  				var res = JSON.parse(data.text);

  				for (var i = 0; i < res.length; i++) {
  					expect(res[i].cidade).to.be.equal("Rio De Janeiro");
  					(res[i].nome).should.not.be.empty;
  				}
  				done();
			});
  	});

  	it("should search for hotels with start and end dates", function (done) {
		
		request(app)
			.post("/select")
			.type("form")
			.send({
				  "local": "Toni", 
				   "inicio": "2015-05-01", 
				   "fim": "2015-05-10"
				})
  			.end( function (err, data) {
  				
  				var res = JSON.parse(data.text);

  				expect(res[0].nome).to.be.equal("Toni ");
  				(res[0].cidade).should.not.be.empty;
  				
  				expect(res.length).to.be.equal(1);
  				done();
			});
  	});

  	it("should search for cities even without dates", function (done) {
		
		request(app)
			.post("/select")
			.type("form")
			.send({
				  "local": "Rio de Janeiro", 
				   "inicio": "", 
				   "fim": ""
				})
  			.end( function (err, data) {
  				
  				var res = JSON.parse(data.text);

  				for (var i = 0; i < res.length; i++) {
  					expect(res[i].cidade).to.be.equal("Rio De Janeiro");
  					(res[i].nome).should.not.be.empty;
  				}
  				done();
			});
  	});

  	it("should search for hotels eve without dates", function (done) {
		
		request(app)
			.post("/select")
			.type("form")
			.send({
				  "local": "Toni", 
				   "inicio": "", 
				   "fim": ""
				})
  			.end( function (err, data) {
  				
  				var res = JSON.parse(data.text);

  				expect(res[0].nome).to.be.equal("Toni ");
  				(res[0].cidade).should.not.be.empty;
  				
  				expect(res.length).to.be.equal(1);
  				done();
			});
  	});

	it("should not search without place", function (done) {
		request(app)
			.post("/select")
			.type("form")
			.send({
				  "local": "", 
				   "inicio": "2015-05-01", 
				   "fim": "2015-05-10"
				})
  			.end( function (err, data) {
  				
  				var res = JSON.parse(data.text);

  				expect(res).to.be.empty;
  				done();
			});
    	
	});

	it("should not search with invalid dates", function (done) {
		request(app)
			.post("/select")
			.type("form")
			.send({
				  "local": "Toni", 
				   "inicio": "2015-05-21", 
				   "fim": "2015-05-10"
				})
  			.end( function (err, data) {
  				
  				var res = JSON.parse(data.text);

  				expect(res).to.be.empty;
  				done();
			});
	});

});