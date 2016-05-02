// test.js

var should = require('chai').should();
var expect = require('chai').expect;
var request = require('supertest');
var app = require('../main');


// test main route

describe("Access server", function() {
	it("should return a 200 response", function(done) {
    	request(app).get("/")
    		.expect(200, done);
  	});
});