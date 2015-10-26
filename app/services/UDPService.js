'use strict';

var mongoose = require('mongoose'),
	Thermostat = mongoose.model('Thermostat'),
	dgram = require('dgram');
var serverUDP = dgram.createSocket('udp4');
var serverIP = '';
var SERVERPORT = 8080;

var udpSend = function(message) {
	var HOST = serverIP;
	serverUDP.send(message, 0, message.length, SERVERPORT, HOST, function(err, bytes) {
	    if (err) throw err;
	    console.log('UDP message sent to ' + HOST +':'+ SERVERPORT);
	    
	});
};

var pngRequest = function() {
	var message = new Buffer('PNG!');
	udpSend(message);
};

var ithRequest = function(msg) {
	var params = msg.toString().split('&');
	var thermostat = new Thermostat({
		'name': params[0],
		'ipAddress': params[1]
	});

	thermostat.save(function(err) {
		if (!err) {
			udpSend('ITH=' + thermostat._id);
			console.log('ITH=' + thermostat._id);

		}
	});
};




exports.init = function() {

	serverUDP.on('error', function (err) {
	  console.log('server error:\n' + err.stack);
	  serverUDP.close();
	});

	serverUDP.on('message', function (msg, rinfo) {
	  console.log('server got: ' + msg + ' from ' +
	    rinfo.address + ':' + rinfo.port);
		serverIP = rinfo.address;

		  switch(msg.toString().substring(0,4)) {
		  	case 'PNG?': pngRequest(); break;
		  	case 'ITH=': ithRequest(msg.toString().substring(4)); break;
		  }

	});
	serverUDP.bind(12345);
};
