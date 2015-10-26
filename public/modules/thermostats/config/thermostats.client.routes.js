'use strict';

//Setting up route
angular.module('thermostats').config(['$stateProvider',
	function($stateProvider) {
		// Thermostats state routing
		$stateProvider.
		state('listThermostats', {
			url: '/thermostats',
			templateUrl: 'modules/thermostats/views/list-thermostats.client.view.html'
		}).
		state('createThermostat', {
			url: '/thermostats/create',
			templateUrl: 'modules/thermostats/views/create-thermostat.client.view.html'
		}).
		state('viewThermostat', {
			url: '/thermostats/:thermostatId',
			templateUrl: 'modules/thermostats/views/view-thermostat.client.view.html'
		}).
		state('viewSchedules', {
			url: '/thermostats/:thermostatId/schedules',
			templateUrl: 'modules/thermostats/views/view-schedules.client.view.html'
		}).
		state('editSchedule', {
			url: '/thermostats/:thermostatId/schedules/:scheduleIndex',
			templateUrl: 'modules/thermostats/views/edit-schedule.client.view.html'
		}).
		state('editThermostat', {
			url: '/thermostats/:thermostatId/edit',
			templateUrl: 'modules/thermostats/views/edit-thermostat.client.view.html'
		});
	}
]);