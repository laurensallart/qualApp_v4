'use strict';


/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Thermostat = mongoose.model('Thermostat'),
	Schedule = mongoose.model('Schedule'),
	_ = require('lodash'),
	UDPService = require('../services/UDPService.js');

UDPService.init();
/**
 * Create a Thermostat
 */
module.exports.create = function(req, res) {
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

/*
 * add a user to a thermostat
 */
module.exports.addUser = function(req, res) {
	console.log(req.body);
};

/*
 * Link a user with a thermostat
 */
module.exports.linkUser = function(req,res) {
	var thermostat = req.thermostat ;
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
module.exports.read = function(req, res) {
	res.jsonp(req.thermostat);
};

/**
 * Update a Thermostat
 */
module.exports.update = function(req, res) {
	var thermostat = req.thermostat ;

	thermostat = _.extend(thermostat , req.body);

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
 * Delete an Thermostat
 */
module.exports.delete = function(req, res) {
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
module.exports.list = function(req, res) { 
	// Thermostat.find({user: req.user}).sort('-created').populate('user', 'displayName').exec(function(err, thermostats) {
	// 	if (err) {
	// 		return res.status(400).send({
	// 			message: errorHandler.getErrorMessage(err)
	// 		});
	// 	} else {
	// 		res.jsonp(thermostats);
	// 	}
	// });
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
module.exports.thermostatByID = function(req, res, next, id) { 
	Thermostat.findById(id).populate('user', 'displayName').exec(function(err, thermostat) {
		if (err) return next(err);
		if (! thermostat) return next(new Error('Failed to load Thermostat ' + id));
		req.thermostat = thermostat ;
		//UDPService.cstRequest(thermostat);
		next();
	});
};

/**
 * Thermostat authorization middleware
 */
module.exports.hasAuthorization = function(req, res, next) {
	if (req.thermostat.user) {
		if (req.user.id !== req.thermostat.user.id){
			return res.status(403).send('User is not authorized');
		}
	} 
	
	
	next();
};

// exports.sendJSONdata = function(req, res) {
// 	console.log('Here! #2');
// 	//input: active schedule
// 	//UDPService.sendJSONdata(message,address,port);
// }
