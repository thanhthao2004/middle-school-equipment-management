/**
 * View Engine Configuration
 */

const path = require('path');

/**
 * Cấu hình view engine cho Express app
 * @param {Express} app - Express application instance
 */
function configureViewEngine(app) {
	app.set('views', path.join(__dirname, '../features'));
	app.set('view engine', 'ejs');
}

module.exports = { configureViewEngine };

