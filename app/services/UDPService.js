'use strict';

var mongoose = require('mongoose'),
Thermostat = mongoose.model('Thermostat'),
dgram = require('dgram');
var serverUDP = dgram.createSocket('udp4');
var timers = [];

var udpSend = function(message, address, port) {
	serverUDP.send(message, 0, message.length, port, address, function(err, bytes) {
		if (err) throw err;
		console.log('UDP message send: ' + message + ' to ' + address +':'+ port);

	});
};

var pngResponse = function(rinfo) {
	var message = new Buffer('PNG!');
	udpSend(message, rinfo.address, rinfo.port);
};

var ithResponse = function(msg, rinfo) {
	var thermostat = new Thermostat({
		'name': msg.toString(),
		'ipAddress': rinfo.address,
		'udpPort': rinfo.port
	});

	console.log('new thermostat initiated');
	thermostat.save(function(err) {
		if (!err) {
			udpSend('ITH=' + thermostat._id, rinfo.address, rinfo.port);
		} else {
			console.log('failed to send UDP message');
		}
	});
};

var cstResponse = function(msg, thermostat, rinfo) {
	
	if (rinfo.address === thermostat.ipAddress) {
		var params = msg.split('&');
		if (params.length === 3) {
			thermostat.status.desiredTemperature = params[0];
			thermostat.status.currentTemperature = params[1];
			thermostat.status.heaterStatus = Boolean(parseInt(params[2].slice(0, -1)));
			thermostat.save(function(err) {
				if (err) {
					udpSend('CST!', rinfo.address, rinfo.port);
				} else {
					udpSend('CST=OK$', rinfo.address, rinfo.port);				
				}
			});
		} else {
			udpSend('CST!', rinfo.address, rinfo.port);
		}
		
	}
};

var cipResponse = function(msg, thermostat, rinfo) {
	msg = msg.slice(0, -1);
	thermostat.ipAddress = msg;
	thermostat.udpPort = rinfo.port;
	thermostat.save(function(err) {
		if (err) {
			udpSend('CIP!', rinfo.address, rinfo.port);
		} else {
			udpSend('CIP=OK', rinfo.address, rinfo.port);
		}
	});
};

var getThermostat = function(id, cb) {
	Thermostat.findById(id).populate('user', 'displayName').exec(function(err, thermostat) {
		cb(thermostat);
	});
};

exports.cstRequest = function(thermostat) {
	// Setting and clearing an interval
	var rinfo = {};
	rinfo.address = thermostat.ipAddress;
	rinfo.port = parseInt(thermostat.udpPort);
	udpSend('CST?', rinfo.address, rinfo.port);
	
	thermostat.waitingCst = true;


	var counter = 0;
	var interval = setInterval( function() {
		console.log('Bar', counter);
		counter++;
		if (counter >= 3) {
			clearInterval(interval);
		}
	}, 1000);
};

exports.init = function() {

	serverUDP.on('error', function (err) {
		console.log('server error:\n' + err.stack);
		serverUDP.close();
	});

	serverUDP.on('message', function (msg, rinfo) {
		console.log('UDP message received: ' + msg + ' from ' +
			rinfo.address + ':' + rinfo.port);

		switch(msg.toString().substring(0, 5)) {
			case '/ITH=': ithResponse(msg.toString().substring(5), rinfo); break;

		}
		if(msg.toString().length > 24) {
			var thermostat = getThermostat(msg.toString().substring(0, 24), function(thermostat, err) {
				if (thermostat) {
					if(msg.toString()[24] === '/') {
						switch(msg.toString().substring(25, 29)) {
							//CST: Current Status = desiredTemp&currentTemp&heaterstatus
							case 'CST=': cstResponse(msg.toString().substring(29), thermostat, rinfo); break; 
							case 'CIP=': cipResponse(msg.toString().substring(29), thermostat, rinfo); break;

						}
		  				//console.log(thermostat.waitingCst);
		  			}
		  		}
		  	});

		}

	});
	serverUDP.bind(12345);
};

// exports.sendJSONdata = function(JSONdata, address, port) {
// 	// serverUDP.send(JSONdata, 0, message.length, port, address, function(err, bytes) {
// 	// 	if (err) throw err;
// 	// 	console.log('UDP message send: ' + message + ' to ' + address +':'+ port);

// 	// });	
// }
