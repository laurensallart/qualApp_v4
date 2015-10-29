'use strict';

var mongoose = require('mongoose'),
	Thermostat = mongoose.model('Thermostat'),
	dgram = require('dgram');
var serverUDP = dgram.createSocket('udp4');
var waitingCDT = false,
	waitingCSC = false,
	waitingCST = false;

var udpSend = function(message, rinfo) {
	serverUDP.send(message, 0, message.length, rinfo.port, rinfo.address, function(err, bytes) {
	    if (err) throw err;
	    console.log('UDP message send: ' + message + ' to ' + rinfo.address +':'+ rinfo.port);
	    
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

var cstRequest = function(msg, thermostat, rinfo) {
	
	if (rinfo.address === thermostat.ipAddress) {
		var params = msg.split('&');
		if (params.length === 3) {
			thermostat.status.desiredTemperature = params[0];
			thermostat.status.currentTemperature = params[1];
			thermostat.status.heaterStatus = Boolean(parseInt(params[2].slice(0, -1)));
			thermostat.save(function(err) {
				if (err) {
					udpSend('CST!', rinfo);
				} else {
					udpSend('CST=OK$', rinfo);				
				}
			});
		} else {
			udpSend('CST!', rinfo);
		}
		
	}
};

var cipRequest = function(msg, thermostat, rinfo) {
	msg = msg.slice(0, -1);
	thermostat.ipAddress = msg;
	thermostat.save(function(err) {
		if (err) {
			udpSend('CIP!', rinfo);
		} else {
			udpSend('CIP=OK', rinfo);
		}
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
	  console.log('UDP message received: ' + msg + ' from ' +
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
		  					case 'CST=': cstRequest(msg.toString().substring(29), thermostat,rinfo); break; 
		  					case 'CIP=': cipRequest(msg.toString().substring(29), thermostat,rinfo); break;
		  				}
		  			}
		  		}
		  	});
		  	
		  }

	});
	serverUDP.bind(12345);
};

