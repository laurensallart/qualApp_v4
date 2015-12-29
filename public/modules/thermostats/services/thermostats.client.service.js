'use strict';

//Thermostats service used to communicate Thermostats REST endpoints
angular.module('thermostats')
.factory('Thermostats', ['$resource',
	function($resource) {
		
		return $resource('thermostats/:thermostatId', { thermostatId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
// Users service used for communicating with the users REST endpoint
.factory('UsersThermostat', ['$resource',
	function($resource) {
		return $resource('users/:username', { username: '@username'});
	}
]);