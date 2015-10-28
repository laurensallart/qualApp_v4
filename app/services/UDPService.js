'use strict';

var mongoose = require('mongoose'),
	Thermostat = mongoose.model('Thermostat'),
	dgram = require('dgram');
var serverUDP = dgram.createSocket('udp4');

var udpSend = function(message, rinfo) {
	serverUDP.send(message, 0, message.length, rinfo.port, rinfo.address, function(err, bytes) {
	    if (err) throw err;
	    console.log('UDP message sent to ' + rinfo.address +':'+ rinfo.port);
	    
	});
};

var pngRequest = function(rinfo) {
	var message = new Buffer('PNG!');
	udpSend(message, rinfo);
};

var ithRequest = function(msg, rinfo) {
	var thermostat = new Thermostat({
		'name': msg.toString(),
		'ipAddress': rinfo.address,
	});

	console.log('new thermostat initiated');
	thermostat.save(function(err) {
		if (!err) {
			udpSend('ITH=' + thermostat._id, rinfo);
			console.log('ITH=' + thermostat._id);

		} else {
			console.log('failed to send UDP message');
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

		  switch(msg.toString().substring(0,4)) {
		  	case 'PNG?': pngRequest(rinfo); break;
		  	case 'ITH=': ithRequest(msg.toString().substring(4), rinfo); break;

		  }

	});
	serverUDP.bind(12345);
};

