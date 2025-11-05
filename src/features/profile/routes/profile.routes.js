const express = require('express');
const router = express.Router();

// Temporary/sample user data. In a full implementation the controller
// would load the authenticated user's profile from a database.
// Render profile page
router.get('/', (req, res) => {
    // Do not send sample user data to the view (inputs should be empty).
    // Pass currentPage so header/sidebar partials that expect it won't error.
    res.render('profile/views/profile', { title: 'Quản lý thông tin cá nhân', currentPage: 'profile' });
});

// Handle profile update (temporary: redirect back to profile)
router.post('/', (req, res) => {
    // TODO: persist updates using controller/service
    return res.redirect('/profile');
});

module.exports = router;
