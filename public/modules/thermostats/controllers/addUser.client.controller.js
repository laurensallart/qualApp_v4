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
				console.log($scope.newUser);
				if ($scope.newUser._id) {
					$scope.thermostat.users.push($scope.newUser._id);
					$scope.thermostat.$update(function() {
						$location.path('thermostats');
					}, function(errorResponse) {
						$scope.error = errorResponse.data.message;
					});
				} else {
					$scope.error = 'username doesn\'t exist';
					console.log($scope.error);
				}
			});
			
			
		};

		
	}
]);