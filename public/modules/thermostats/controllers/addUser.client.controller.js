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