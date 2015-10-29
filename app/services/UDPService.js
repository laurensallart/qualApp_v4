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

var cstRequest = function(msg, thermostat) {
	var params = msg.split('&');
	console.log(params[0]);
	console.log(params[1]);
	console.log(params[2].slice(0, -1));
	thermostat.status.desiredTemperature = params[0];
	thermostat.status.currentTemperature = params[1];
	thermostat.status.heaterStatus = Boolean(parseInt(params[2]));

	thermostat.save(function(err) {
		console.log('saved');
	});

};

var getThermostat = function(id, cb) {
	Thermostat.findById(id).populate('user', 'displayName').exec(function(err, thermostat) {
		cb(thermostat);
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

		  switch(msg.toString().substring(0, 4)) {
		  	case 'PNG?': pngRequest(rinfo); break;
		  	case 'ITH=': ithRequest(msg.toString().substring(4), rinfo); break;

		  }
		  if(msg.toString().length > 24) {
		  	var thermostat = getThermostat(msg.toString().substring(0, 24), function(thermostat, err) {
		  		if (thermostat) {
		  			if(msg.toString()[24] === '/') {
		  				switch(msg.toString().substring(25, 29)) {
		  					case 'CST=': cstRequest(msg.toString().substring(29), thermostat); break; 
		  				}
		  			}
		  		}
		  	});
		  	
		  }

	});
	serverUDP.bind(12345);
};

