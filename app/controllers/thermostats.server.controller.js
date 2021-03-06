'use strict';


/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Thermostat = mongoose.model('Thermostat'),
	User = mongoose.model('User'),
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
	console.log(thermostat);
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
	Thermostat.find({users: req.user._id}).sort('-created').populate('user', 'displayName').populate('users', 'displayName username email').exec(function(err, thermostats) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(thermostats);
		}
	});
	// Thermostat.find().sort('-created').populate('user', 'displayName').exec(function(err, thermostats) {
	// 	if (err) {
	// 		return res.status(400).send({
	// 			message: errorHandler.getErrorMessage(err)
	// 		});
	// 	} else {
	// 		res.jsonp(thermostats);
	// 	}
	// });
	
};

/**
 * Thermostat middleware
 */
module.exports.thermostatByID = function(req, res, next, id) { 
	Thermostat.findById(id).populate('user', 'displayName').populate('users', 'displayName username email').exec(function(err, thermostat) {
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
	// if (req.thermostat.user) {
	// 	if (req.user.id !== req.thermostat.user.id){
	// 		return res.status(403).send('User is not authorized');
	// 	}
	// } 
	// next();
	if (req.thermostat.users.length !== 0) {
		var authorized = false;
		req.thermostat.users.forEach( function(user) {
			if (user.id === req.user.id) {
				authorized = true;
			}
		});
		if (!authorized){
			return res.status(403).send('User is not authorized');
		}
	}
	next();
};


/**
 * get the user id by the username
 */
module.exports.userByName = function(req, res, next, username) {
	User.find({username : username}).exec(function(err, users) {
		if (err) return next(err);
		if (!users) return next(new Error('Failed to load User ' + username));
		req.newuser = users[0];
		next();
	});
};

module.exports.getUserId = function(req, res, username) {
	res.jsonp(req.newuser);
};

