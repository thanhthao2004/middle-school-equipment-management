const mongoose = require('mongoose');
const config = require('./env');
const logger = require('./logger');

let isConnected = false;

async function connectMongo() {
	if (isConnected) return mongoose.connection;

	await mongoose.connect(config.mongodb.uri, {
		dbName: config.mongodb.dbName,
		autoIndex: true,
	});

	isConnected = true;
	return mongoose.connection;
}

mongoose.connection.on('connected', () => {
	logger.info('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
	logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
	logger.warn('MongoDB disconnected');
});

module.exports = { connectMongo };

