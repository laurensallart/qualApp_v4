'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Thermostat Schema
 */
var ThermostatSchema = new Schema({
	name: {
		type: String,
		default: 'Qual',
		required: 'Please fill Thermostat name',
		trim: true
	},
	status: {
		desiredTemperature: {
			type: Number
		},
		currentTemperature: {
			type: Number
		},
		heaterStatus: {
			type: Boolean
		}
	},
	schedules: [{
		label: {
			type: String,
			default: 'default',
			required: 'please give this schedule a label',
			trim: true
		},
		index: {
			type: Number,
			default: 0
		},
		isActive: {
			type: Boolean
		},
		scheduleVersion: {
			type: Date
		},
		days: [{
			day: {
				type: Number
			},
			timePoints: [{
				//1 is Sunday, 7 is Saturday
				
				hour: {
					type: Number
				},
				minute: {
					type: Number
				},
				desiredTemperature: {
					type: Number
				}
			}]
		}]
	}],
	history: [{
		timestamp: {
			type: Date
		},
		status: {
			desiredTemperature: {
				type: Number
			},
			currentTemperature: {
				type: Number
			},
			heaterStatus: {
				type: Boolean
			}
		}
	}],
	ipAddress: {
		type: String,
		required: 'please give in an IP address',
		trim: true
	},
	udpPort: {
		type: Number
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	users: [{
		type: Schema.ObjectId,
		ref: 'User'
	}]
});

var ScheduleSchema = new Schema({
	
});

mongoose.model('Schedule', ScheduleSchema);
mongoose.model('Thermostat', ThermostatSchema);
