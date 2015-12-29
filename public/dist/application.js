'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'qualapp';
	var applicationModuleVendorDependencies = ['ngResource', 'ngCookies',  'ngAnimate',  'ngTouch',  'ngSanitize',  'ui.router', 'ui.utils', 'ui.bootstrap', 'googlechart'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();
'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('thermostats');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/thermostats/views/list-thermostats.client.view.html'
		});
	}
]);
'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus',
	function($scope, Authentication, Menus) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
	}
]);
'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
	}
]);
'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						uiRoute: menuItemUIRoute || ('/' + menuItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
]);
'use strict';

// Configuring the Articles module
angular.module('thermostats').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		
		Menus.addMenuItem('topbar', 'New Thermostat', 'thermostats/create');
	}
]);
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
		state('addSchedule', {
			url: '/thermostats/:thermostatId/schedules/addSchedule',
			templateUrl: 'modules/thermostats/views/add-schedule.client.view.html'
		}).
		state('editSchedule', {
			url: '/thermostats/:thermostatId/schedules/:scheduleIndex',
			templateUrl: 'modules/thermostats/views/edit-schedule.client.view.html'
		}).
		state('editThermostat', {
			url: '/thermostats/:thermostatId/edit',
			templateUrl: 'modules/thermostats/views/edit-thermostat.client.view.html'
		}).
		state('addUser', {
			url: '/thermostats/:thermostatId/adduser',
			templateUrl: 'modules/thermostats/views/addUser-thermostat.client.view.html'
		});
	}
]);
'use strict';

// Thermostats controller
angular.module('thermostats')

.controller('AddUserController', ['$scope', '$stateParams', '$location', 'Authentication', 'Thermostats', '$timeout', 'UsersThermostat',
	
	function($scope, $stateParams, $location, Authentication, Thermostats, $timeout, UsersThermostat) {
		// Find existing Thermostat
		$scope.findThermostat = function() {
			$scope.thermostat = Thermostats.get({ 
				thermostatId: $stateParams.thermostatId
			});
		};

		$scope.submitUser = function() {
			$scope.newUser = UsersThermostat.get({
				username: this.newUsername
			}, function() {
				console.log($scope.newUser._id);
				if ($scope.newUser._id) {
					var uniqueUser = true;
					$scope.thermostat.users.forEach( function(user) {
						console.log(user._id);

						if (user._id === $scope.newUser._id) {
							$scope.error = 'User already added to thermostat';
							uniqueUser = false;
						}
					});	
					if (uniqueUser) {
						$scope.thermostat.users.push($scope.newUser);
						$scope.thermostat.$update(function() {
						}, function(errorResponse) {
							$scope.error = errorResponse.data.message;
						});
					}
				} else {
					$scope.error = 'username doesn\'t exist';
					console.log($scope.error);
				}
			});
		};

		$scope.removeUser = function(userIndex) {
			this.thermostat.users.splice(userIndex, 1);
			this.thermostat.$update(function() {
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};
	}
]);
'use strict';

// Thermostats controller
angular.module('thermostats')


.filter('weekday', ["$filter", function($filter)
{
	return function(input)
	{
		if(input === null){ return ''; } 

		var weekday = '';
		switch(input) {
			case 1:
			weekday = 'Monday';
			break;
			case 2:
			weekday = 'Tuesday';
			break;
			case 3:
			weekday = 'Wednesday';
			break;
			case 4:
			weekday = 'Thursday';
			break;
			case 5:
			weekday = 'Friday';
			break;
			case 6:
			weekday = 'Saturday';
			break;
			case 7:
			weekday = 'Sunday';
			break;
		}
		return weekday;

	};
}])

.filter('twoChar', ["$filter", function($filter)
{
	return function(input)
	{
		var output;
		if(input<10) {
			output = '0';
			output += String(input);
		}
		else {
			output = String(input);
		}
		return output;

	};
}])

.controller('ThermostatsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Thermostats', '$timeout', '$log',
	
	function($scope, $stateParams, $location, Authentication, Thermostats, $timeout, $log) {

		$scope.isCollapsed = false;
		$scope.authentication = Authentication;


		$scope.setDesiredTemp = function(value) {
			this.status.desiredTemperature = value;
		};

		$scope.increaseTemp = function() {
			console.log(this);
			if(this.thermostat.status.desiredTemperature < 30) {
				this.thermostat.status.desiredTemperature += 0.5;
				this.thermostat.$update(function() {
					
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			}
			
		};

		$scope.decreaseTemp = function() {
			if(this.thermostat.status.desiredTemperature > 0) {
				this.thermostat.status.desiredTemperature -= 0.5;
				this.thermostat.$update(function() {
					
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			}
		};

		$scope.removeSchedule = function(scheduleIndex) {
			this.thermostat.schedules.splice(scheduleIndex, 1);
			this.thermostat.$update(function() {
				$location.path('thermostats/' + this.thermostat._id + '/schedules');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.setChart = function(day, scheduleIndex, thermostat, chartObject) {
			chartObject = {
				'type': 'LineChart',
				'displayed': false,
				'data': {
					'cols': [
					{
						'id': 'time',
						'label': 'Time',
						'type': 'number',
						'p': {}
					},
					{
						'id': 'temperature',
						'label': 'Temperature',
						'type': 'number'
					}
					],
					'rows': [

					]
				},
				'options': {
					'title': '',
					'legend': 'none',
					'fill': 20,
			    //'displayExactValues': true,
			    'vAxis': {
			    	'title': 'temperature',
			    	'ticks': [10,15,20,25,30], 

			    },
			    'hAxis': {
			    	'title': 'time',
			    	'ticks': [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24], 
			    	'titleTextStyle': {
			    		'color': '#AAAAAA'
			    	},
			    	'baselineColor': '#AAAAAA',


			    },
			    'tooltip': {
			    	'isHtml': true
			    }
			},
			'formatters': {},
			'view': {}
		};

		var indexDay = thermostat.schedules[scheduleIndex].days.indexOf(day);

		thermostat.schedules[scheduleIndex].days[indexDay].timePoints.sort(sort_by('hour', false, parseInt));

		angular.forEach(thermostat.schedules[scheduleIndex].days[indexDay].timePoints, function(timePoint, index) {
			var time = timePoint.hour + timePoint.minute/60;
			var time2 = 24;
			var previousDay = indexDay - 1;
			if (previousDay === -1) {
				previousDay = 6;
			}
			if(thermostat.schedules[scheduleIndex].days[indexDay].timePoints.length !== index+1) {
				time2 = thermostat.schedules[scheduleIndex].days[indexDay].timePoints[index+1].hour + thermostat.schedules[scheduleIndex].days[indexDay].timePoints[index+1].minute/60;
			} 
			if(index === 0) {
				if(thermostat.schedules[scheduleIndex].days[previousDay].timePoints.length !== 0) {
					chartObject.data.rows.push({
						'c': [
						{
							'v': 0,
							'p': {}
						},
						{
							'v': thermostat.schedules[scheduleIndex].days[previousDay].timePoints[thermostat.schedules[scheduleIndex].days[previousDay].timePoints.length-1].desiredTemperature,
							'p': {}
						},
						null
						]

					},{
						'c': [
						{
							'v': time,
							'p': {}
						},
						{
							'v': thermostat.schedules[scheduleIndex].days[previousDay].timePoints[thermostat.schedules[scheduleIndex].days[previousDay].timePoints.length-1].desiredTemperature,
							'p': {}
						},
						null
						]
					});
				}		
			} 


			chartObject.data.rows.push({

				'c': [
				{
					'v': time,
					'p': {}
				},
				{
					'v': timePoint.desiredTemperature,
					'p': {}
				},
				null
				]

			},{
				'c': [
				{
					'v': time2,
					'p': {}
				},
				{
					'v': timePoint.desiredTemperature,
					'p': {}
				},
				null
				]
			});
		});
this.chartObject = chartObject;


};

var sort_by = function(field, reverse, primer){

	var key = primer ? 
	function(x) {return primer(x[field]);} : 
	function(x) {return x[field];};

	reverse = !reverse ? 1 : -1;

	return function (a, b) {
		return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
	}; 
};

$scope.showSchedules = function() {
	$location.path('thermostats/' + this.thermostat._id + '/schedules');
};

$scope.setupScheduleView = function() {
	$scope.scheduleIndex = $stateParams.scheduleIndex;
};

$scope.findSchedule = function() {
	console.log(this.schedules[$scope.index].label);
	return this.schedules[$scope.index].label;
}; 

$scope.addTimePoint = function(thermostat, scheduleIndex, day, hour, minute, desiredTemperature) {
	var timepoint = {hour: hour, minute: minute, desiredTemperature: desiredTemperature};
	var indexDay = thermostat.schedules[scheduleIndex].days.indexOf(day);
	thermostat.schedules[scheduleIndex].days[indexDay].timePoints.push(timepoint); 
	thermostat.$update(function() {
				//$location.path('thermostats/' + thermostat._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
};

		// Create new Thermostat
		$scope.create = function() {
			// Create new Thermostat object
			var thermostat = new Thermostats ({
				name: this.name,
				status: {
					desiredTemperature: this.status.desiredTemperature,
					currentTemperature: this.status.currentTemperature,
					heaterStatus: this.status.heaterStatus
				},
				
				ipAddress: this.ipAddress,	
				schedules: [{
					label: 'workweek',
					isActive: true,
					scheduleVersion: Date.now(),
					days: [{
						day: 1,
						timePoints: [{
							hour: 9,
							minute: 0,
							desiredTemperature: 22
						},{
							hour: 22,
							minute: 0,
							desiredTemperature: 16
						}]},{
							day: 2,
							timePoints: [{
								hour: 9,
								minute: 0,
								desiredTemperature: 22
							},{
								hour: 22,
								minute: 0,
								desiredTemperature: 16
							}]},{
								day: 3,
								timePoints: [{
									hour: 9,
									minute: 0,
									desiredTemperature: 22
								},{
									hour: 22,
									minute: 0,
									desiredTemperature: 16
								}]},{
									day: 4,
									timePoints: [{
										hour: 9,
										minute: 0,
										desiredTemperature: 22
									},{
										hour: 22,
										minute: 0,
										desiredTemperature: 16
									}]},{
										day: 5,
										timePoints: [{
											hour: 9,
											minute: 0,
											desiredTemperature: 22
										},{
											hour: 22,
											minute: 0,
											desiredTemperature: 16
										}]},{
											day: 6,
											timePoints: [{
												hour: 9,
												minute: 0,
												desiredTemperature: 22
											},{
												hour: 22,
												minute: 0,
												desiredTemperature: 16
											}]},{
												day: 7,
												timePoints: [{
													hour: 9,
													minute: 0,
													desiredTemperature: 22
												},{
													hour: 22,
													minute: 0,
													desiredTemperature: 16
												}]}
												]	
											}]		
										});

thermostat.$save(function(response) {
				// Redirect after save
				$location.path('thermostats/' + response._id);
				// Clear form fields
				$scope.name = '';
				$scope.status.desiredTemperature = '';
				$scope.status.currentTemperature = '';
				$scope.status.heaterStatus = '';
				$scope.ipAddress = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});

			// thermostat.$sendJSONdata(function(response) {
			// 	console.log('Here! #1');
			// }, function(errorResponse) {
			// 	$scope.error = errorResponse.data.message;	
			// }


			
		};

		// remove TimePoint in schedule
		$scope.removeTimePoint = function(timePoint, day, scheduleIndex, thermostat) {
			var indexDay = thermostat.schedules[scheduleIndex].days.indexOf(day);
			var indexTimePoint = thermostat.schedules[scheduleIndex].days[indexDay].timePoints.indexOf(timePoint);
			thermostat.schedules[scheduleIndex].days[indexDay].timePoints.splice(indexTimePoint, 1); 
			thermostat.$update(function() {
				//$location.path('thermostats/' + thermostat._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Thermostat
		$scope.remove = function(thermostat) {
			if ( thermostat ) { 
				thermostat.$remove();

				for (var i in $scope.thermostats) {
					if ($scope.thermostats [i] === thermostat) {
						$scope.thermostats.splice(i, 1);
					}
				}
			} else {
				$scope.thermostat.$remove(function() {
					$location.path('thermostats');
				});
			}
		};

		// Update existing Thermostat
		$scope.update = function() {
			var thermostat = $scope.thermostat;

			thermostat.$update(function() {
				$location.path('thermostats/' + thermostat._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.changeScheduleName = function() {
			var thermostat = $scope.thermostat;

			thermostat.$update(function() {
				
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.connectUser = function() {
			var thermostat = Thermostats.get({ 
				thermostatId: this.objectId
			}, function() {
				thermostat.user = $scope.authentication.user._id;
				thermostat.users.push($scope.authentication.user._id);
				thermostat.$update(function() {
					$location.path('thermostats');
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			});
		};

		// Find a list of Thermostats
		$scope.find = function() {
			$scope.thermostats = Thermostats.query(function() {
				if($scope.thermostats.length === 1) {
					$location.path('thermostats/' + $scope.thermostats[0]._id);
				}
			});
		};

		// Find existing Thermostat
		$scope.findOne = function() {
			$scope.thermostat = Thermostats.get({ 
				thermostatId: $stateParams.thermostatId
			});
		};

		$scope.addUser = function() {
			$scope.thermostat.users.push('56268771955d78959a938a6b');
			console.log($scope);
			var thermostat = $scope.thermostat;
			thermostat.$update(function() {
				
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find existing Thermostat
		$scope.addSchedule = function(thermostat) {
			var newSchedule = {
				label: 'Schedule ' + (thermostat.schedules.length + 1).toString(),
				isActive: false,
				scheduleVersion: Date.now(),
				days: [{
					day: 1,
					timePoints: [{
						hour: 7,
						minute: 0,
						desiredTemperature: 22
					},{
						hour: 9,
						minute: 0,
						desiredTemperature: 16
					},{
						hour: 17,
						minute: 0,
						desiredTemperature: 22
					},{
						hour: 23,
						minute: 0,
						desiredTemperature: 16
					}]},{
					day: 2,
					timePoints: [{
						hour: 7,
						minute: 0,
						desiredTemperature: 22
					},{
						hour: 9,
						minute: 0,
						desiredTemperature: 16
					},{
						hour: 17,
						minute: 0,
						desiredTemperature: 22
					},{
						hour: 23,
						minute: 0,
						desiredTemperature: 16
					}]},{
					day: 3,
					timePoints: [{
						hour: 7,
						minute: 0,
						desiredTemperature: 22
					},{
						hour: 9,
						minute: 0,
						desiredTemperature: 16
					},{
						hour: 17,
						minute: 0,
						desiredTemperature: 22
					},{
						hour: 23,
						minute: 0,
						desiredTemperature: 16
					}]},{
					day: 4,
					timePoints: [{
						hour: 7,
						minute: 0,
						desiredTemperature: 22
					},{
						hour: 9,
						minute: 0,
						desiredTemperature: 16
					},{
						hour: 17,
						minute: 0,
						desiredTemperature: 22
					},{
						hour: 23,
						minute: 0,
						desiredTemperature: 16
					}]},{
					day: 5,
					timePoints: [{
						hour: 7,
						minute: 0,
						desiredTemperature: 22
					},{
						hour: 9,
						minute: 0,
						desiredTemperature: 16
					},{
						hour: 17,
						minute: 0,
						desiredTemperature: 22
					},{
						hour: 23,
						minute: 0,
						desiredTemperature: 16
					}]},{
					day: 6,
					timePoints: [{
						hour: 8,
						minute: 0,
						desiredTemperature: 22
					},{
						hour: 23,
						minute: 0,
						desiredTemperature: 16
					}]},{
					day: 7,
					timePoints: [{
						hour: 8,
						minute: 0,
						desiredTemperature: 22
					},{
						hour: 23,
						minute: 0,
						desiredTemperature: 16
					}]}
					]
			};
			thermostat.schedules.push(newSchedule);
			var lastIndex = thermostat.schedules.length-1;

			// Update
			thermostat.$update(function() {
			//$location.path('thermostats/' + thermostat._id);
		}, function(errorResponse) {
			$scope.error = errorResponse.data.message;
		});

			

			//Popup; do you want to use the make this schedule active and the other 'inactive'?


			$location.path('thermostats/' + this.thermostat._id + '/schedules/' + lastIndex);
		};	

		$scope.saveEdit = function() {
			$scope.editing = false;
		};

		$scope.activateSchedule = function(scheduleIndex) {    		
			if (this.thermostat.schedules[scheduleIndex].isActive) {
				this.thermostat.schedules[scheduleIndex].isActive = false;
			} else {
				for (var ind = 0; ind < this.thermostat.schedules.length; ind++) {
					if (ind === scheduleIndex) {
						continue;
					}
					if (this.thermostat.schedules[ind].isActive) {
						this.thermostat.schedules[ind].isActive = false;
					}
				}
				this.thermostat.schedules[scheduleIndex].isActive = true;
			}

			this.thermostat.$update(function() {
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});

		};

		
	}
]);
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
'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		});
	}
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [
	function() {
		var _this = this;

		_this._data = {
			user: window.user
		};

		return _this._data;
	}
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);