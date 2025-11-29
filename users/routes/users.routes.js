const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');
const { validateCreateUser } = require('../validators/users.validators');
const { validationResult } = require('express-validator');

router.get('/', userController.renderUserList);
router.get('/create', userController.renderCreateForm);
router.post('/create', validateCreateUser, userController.createUser);

router.get('/:id', userController.renderDetail);
router.get('/:id/edit', userController.renderEdit);
router.post('/:id/edit', userController.updateUser);
router.post('/:id/delete', userController.deleteUser);

module.exports = router;
