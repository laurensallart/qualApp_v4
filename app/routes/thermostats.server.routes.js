'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var thermostats = require('../../app/controllers/thermostats.server.controller');

	// Thermostats Routes
	app.route('/thermostats')
		.get(users.requiresLogin, thermostats.list)
		// .post(users.requiresLogin, thermostats.create, thermostats.sendJSONdata);
		.post(users.requiresLogin, thermostats.create);

	app.route('/thermostats/:thermostatId')
		.get(users.requiresLogin, thermostats.hasAuthorization, thermostats.read)
		.put(users.requiresLogin, thermostats.hasAuthorization, thermostats.update)
		// respond with "" when a DELETE request is made to /thermostats/:thermostatId
		.delete(users.requiresLogin, thermostats.hasAuthorization, thermostats.delete);	

	// Finish by binding the Thermostat middleware
	app.param('thermostatId', thermostats.thermostatByID);
};
