const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');
const { validateCreateUser } = require('../validators/users.validators');
const { validationResult } = require('express-validator');

router.get('/', userController.renderUserList);
router.get('/:id/detail', userController.renderUserDetail);
router.get('/:id/edit', userController.renderEditForm);
router.post('/:id/edit', userController.updateUser);
router.get('/:id/delete', userController.deleteUser);
router.post('/:id/toggle-status', userController.toggleStatus);
router.get('/create', userController.renderCreateForm);
router.post('/create', validateCreateUser, userController.createUser);

module.exports = router;
