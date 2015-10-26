'use strict';

(function() {
	// Thermostats Controller Spec
	describe('Thermostats Controller Tests', function() {
		// Initialize global variables
		var ThermostatsController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Thermostats controller.
			ThermostatsController = $controller('ThermostatsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Thermostat object fetched from XHR', inject(function(Thermostats) {
			// Create sample Thermostat using the Thermostats service
			var sampleThermostat = new Thermostats({
				name: 'New Thermostat'
			});

			// Create a sample Thermostats array that includes the new Thermostat
			var sampleThermostats = [sampleThermostat];

			// Set GET response
			$httpBackend.expectGET('thermostats').respond(sampleThermostats);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.thermostats).toEqualData(sampleThermostats);
		}));

		it('$scope.findOne() should create an array with one Thermostat object fetched from XHR using a thermostatId URL parameter', inject(function(Thermostats) {
			// Define a sample Thermostat object
			var sampleThermostat = new Thermostats({
				name: 'New Thermostat'
			});

			// Set the URL parameter
			$stateParams.thermostatId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/thermostats\/([0-9a-fA-F]{24})$/).respond(sampleThermostat);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.thermostat).toEqualData(sampleThermostat);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Thermostats) {
			// Create a sample Thermostat object
			var sampleThermostatPostData = new Thermostats({
				name: 'New Thermostat'
			});

			// Create a sample Thermostat response
			var sampleThermostatResponse = new Thermostats({
				_id: '525cf20451979dea2c000001',
				name: 'New Thermostat'
			});

			// Fixture mock form input values
			scope.name = 'New Thermostat';

			// Set POST response
			$httpBackend.expectPOST('thermostats', sampleThermostatPostData).respond(sampleThermostatResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Thermostat was created
			expect($location.path()).toBe('/thermostats/' + sampleThermostatResponse._id);
		}));

		it('$scope.update() should update a valid Thermostat', inject(function(Thermostats) {
			// Define a sample Thermostat put data
			var sampleThermostatPutData = new Thermostats({
				_id: '525cf20451979dea2c000001',
				name: 'New Thermostat'
			});

			// Mock Thermostat in scope
			scope.thermostat = sampleThermostatPutData;

			// Set PUT response
			$httpBackend.expectPUT(/thermostats\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/thermostats/' + sampleThermostatPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid thermostatId and remove the Thermostat from the scope', inject(function(Thermostats) {
			// Create new Thermostat object
			var sampleThermostat = new Thermostats({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Thermostats array and include the Thermostat
			scope.thermostats = [sampleThermostat];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/thermostats\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleThermostat);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.thermostats.length).toBe(0);
		}));
	});
}());