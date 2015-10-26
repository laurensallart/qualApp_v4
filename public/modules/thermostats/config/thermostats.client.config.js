'use strict';

// Configuring the Articles module
angular.module('thermostats').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		
		Menus.addMenuItem('topbar', 'New Thermostat', 'thermostats/create');
	}
]);