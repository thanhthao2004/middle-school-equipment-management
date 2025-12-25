/**
 * View Engine Configuration
 */

const path = require('path');

/**
 * Cấu hình view engine cho Express app
 * @param {Express} app - Express application instance
 */
function configureViewEngine(app) {
	// Set multiple view directories: features first (for feature views), then views (for shared/error views)
	app.set('views', [
		path.join(__dirname, '../features'),
		path.join(__dirname, '../views')
	]);
	app.set('view engine', 'ejs');
}

module.exports = { configureViewEngine };

