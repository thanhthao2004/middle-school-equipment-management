/**
 * Simple logger utility
 */
const config = require('./env');

const logLevels = {
	error: 0,
	warn: 1,
	info: 2,
	debug: 3,
};

const currentLevel = config.nodeEnv === 'production' ? logLevels.info : logLevels.debug;

const logger = {
	error: (...args) => {
		if (currentLevel >= logLevels.error) {
			console.error('[ERROR]', ...args);
		}
	},
	warn: (...args) => {
		if (currentLevel >= logLevels.warn) {
			console.warn('[WARN]', ...args);
		}
	},
	info: (...args) => {
		if (currentLevel >= logLevels.info) {
			console.log('[INFO]', ...args);
		}
	},
	debug: (...args) => {
		if (currentLevel >= logLevels.debug) {
			console.log('[DEBUG]', ...args);
		}
	},
};

module.exports = logger;
    