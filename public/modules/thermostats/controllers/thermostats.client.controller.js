'use strict';

// Thermostats controller
angular.module('thermostats')


.filter('weekday', function($filter)
{
	return function(input)
	{
		if(input === null){ return ''; } 

		var weekday = '';
		switch(input) {
			case 1:
				weekday = 'Sunday';
				break;
			case 2:
				weekday = 'Monday';
				break;
			case 3:
				weekday = 'Tuesday';
				break;
			case 4:
				weekday = 'Wednesday';
				break;
			case 5:
				weekday = 'Thursday';
				break;
			case 6:
				weekday = 'Friday';
				break;
			case 7:
				weekday = 'Saturday';
				break;
		}
		return weekday;

	};
})

.filter('twoChar', function($filter)
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
})

.controller('ThermostatsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Thermostats', '$timeout',
	
	function($scope, $stateParams, $location, Authentication, Thermostats, $timeout) {

		$scope.isCollapsed = true;
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
			      'title': '',
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


			// Redirect after save
			thermostat.$save(function(response) {
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
		// Find existing Thermostat
		$scope.addSchedule = function(thermostat) {
			var newSchedule = {
				label: 'N/A',
				isActive: true,
				scheduleVersion: Date.now(),
				days: [{
					day: 1
					},{
					day: 2
					},{
					day: 3
					},{
					day: 4
					},{
					day: 5
					},{
					day: 6
					},{
					day: 7
					}
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

			$location.path('thermostats/' + this.thermostat._id + '/schedules/' + lastIndex);
		};	

		$scope.saveEdit = function() {
        	$scope.editing = false;
    	};





	}
	]);