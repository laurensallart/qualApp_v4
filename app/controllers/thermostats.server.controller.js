'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Thermostat = mongoose.model('Thermostat'),
	Schedule = mongoose.model('Schedule'),
	_ = require('lodash');

/**
 * Create a Thermostat
 */
exports.create = function(req, res) {
	var thermostat = new Thermostat(req.body);
	thermostat.user = req.user;

	thermostat.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(thermostat);
		}
	});
};

/**
 * Show the current Thermostat
 */
exports.read = function(req, res) {
	res.jsonp(req.thermostat);
};

/**
 * Update a Thermostat
 */
exports.update = function(req, res) {
	var thermostat = req.thermostat ;

	thermostat = _.extend(thermostat , req.body);

	thermostat.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(thermostat);
			
			//udp client
			var PORT = 12345;
			var HOST = '172.25.10.146';

			var dgram = require('dgram');
			var message = new Buffer('PNG?');

			var clientUDP = dgram.createSocket('udp4');
			clientUDP.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
			    if (err) throw err;
			    console.log('UDP message sent to ' + HOST +':'+ PORT);
			    
			});
			clientUDP.on( 'message', function( msg, rinfo ) {
			    console.log( 'The packet came back' );
			    console.log(msg.toString());
			    clientUDP.close();
			});

			// client listens on a port as well in order to receive ping
		}
	});
};

/**
 * Delete an Thermostat
 */
exports.delete = function(req, res) {
	var thermostat = req.thermostat ;

	thermostat.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(thermostat);
		}
	});
};

/**
 * List of Thermostats
 */
exports.list = function(req, res) { 
	Thermostat.find().sort('-created').populate('user', 'displayName').exec(function(err, thermostats) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(thermostats);
		}
	});
};

/**
 * Thermostat middleware
 */
exports.thermostatByID = function(req, res, next, id) { 
	Thermostat.findById(id).populate('user', 'displayName').exec(function(err, thermostat) {
		if (err) return next(err);
		if (! thermostat) return next(new Error('Failed to load Thermostat ' + id));
		req.thermostat = thermostat ;
		next();
	});
};

/**
 * Thermostat authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.user.id !== req.thermostat.user.id){
		return res.status(403).send('User is not authorized');
	}
	
	next();
};
