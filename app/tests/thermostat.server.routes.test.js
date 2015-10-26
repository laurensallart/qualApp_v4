'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Thermostat = mongoose.model('Thermostat'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, thermostat;

/**
 * Thermostat routes tests
 */
describe('Thermostat CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Thermostat
		user.save(function() {
			thermostat = {
				name: 'Thermostat Name'
			};

			done();
		});
	});

	it('should be able to save Thermostat instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Thermostat
				agent.post('/thermostats')
					.send(thermostat)
					.expect(200)
					.end(function(thermostatSaveErr, thermostatSaveRes) {
						// Handle Thermostat save error
						if (thermostatSaveErr) done(thermostatSaveErr);

						// Get a list of Thermostats
						agent.get('/thermostats')
							.end(function(thermostatsGetErr, thermostatsGetRes) {
								// Handle Thermostat save error
								if (thermostatsGetErr) done(thermostatsGetErr);

								// Get Thermostats list
								var thermostats = thermostatsGetRes.body;

								// Set assertions
								(thermostats[0].user._id).should.equal(userId);
								(thermostats[0].name).should.match('Thermostat Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Thermostat instance if not logged in', function(done) {
		agent.post('/thermostats')
			.send(thermostat)
			.expect(401)
			.end(function(thermostatSaveErr, thermostatSaveRes) {
				// Call the assertion callback
				done(thermostatSaveErr);
			});
	});

	it('should not be able to save Thermostat instance if no name is provided', function(done) {
		// Invalidate name field
		thermostat.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Thermostat
				agent.post('/thermostats')
					.send(thermostat)
					.expect(400)
					.end(function(thermostatSaveErr, thermostatSaveRes) {
						// Set message assertion
						(thermostatSaveRes.body.message).should.match('Please fill Thermostat name');
						
						// Handle Thermostat save error
						done(thermostatSaveErr);
					});
			});
	});

	it('should be able to update Thermostat instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Thermostat
				agent.post('/thermostats')
					.send(thermostat)
					.expect(200)
					.end(function(thermostatSaveErr, thermostatSaveRes) {
						// Handle Thermostat save error
						if (thermostatSaveErr) done(thermostatSaveErr);

						// Update Thermostat name
						thermostat.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Thermostat
						agent.put('/thermostats/' + thermostatSaveRes.body._id)
							.send(thermostat)
							.expect(200)
							.end(function(thermostatUpdateErr, thermostatUpdateRes) {
								// Handle Thermostat update error
								if (thermostatUpdateErr) done(thermostatUpdateErr);

								// Set assertions
								(thermostatUpdateRes.body._id).should.equal(thermostatSaveRes.body._id);
								(thermostatUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Thermostats if not signed in', function(done) {
		// Create new Thermostat model instance
		var thermostatObj = new Thermostat(thermostat);

		// Save the Thermostat
		thermostatObj.save(function() {
			// Request Thermostats
			request(app).get('/thermostats')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Thermostat if not signed in', function(done) {
		// Create new Thermostat model instance
		var thermostatObj = new Thermostat(thermostat);

		// Save the Thermostat
		thermostatObj.save(function() {
			request(app).get('/thermostats/' + thermostatObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', thermostat.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Thermostat instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Thermostat
				agent.post('/thermostats')
					.send(thermostat)
					.expect(200)
					.end(function(thermostatSaveErr, thermostatSaveRes) {
						// Handle Thermostat save error
						if (thermostatSaveErr) done(thermostatSaveErr);

						// Delete existing Thermostat
						agent.delete('/thermostats/' + thermostatSaveRes.body._id)
							.send(thermostat)
							.expect(200)
							.end(function(thermostatDeleteErr, thermostatDeleteRes) {
								// Handle Thermostat error error
								if (thermostatDeleteErr) done(thermostatDeleteErr);

								// Set assertions
								(thermostatDeleteRes.body._id).should.equal(thermostatSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Thermostat instance if not signed in', function(done) {
		// Set Thermostat user 
		thermostat.user = user;

		// Create new Thermostat model instance
		var thermostatObj = new Thermostat(thermostat);

		// Save the Thermostat
		thermostatObj.save(function() {
			// Try deleting Thermostat
			request(app).delete('/thermostats/' + thermostatObj._id)
			.expect(401)
			.end(function(thermostatDeleteErr, thermostatDeleteRes) {
				// Set message assertion
				(thermostatDeleteRes.body.message).should.match('User is not logged in');

				// Handle Thermostat error error
				done(thermostatDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Thermostat.remove().exec();
		done();
	});
});