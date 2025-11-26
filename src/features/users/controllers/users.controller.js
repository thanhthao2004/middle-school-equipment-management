const { validationResult } = require('express-validator');
const usersService = require('../services/users.service');

exports.renderCreateForm = (req, res) => {
  res.render('users/views/create', { 
    errors: {}, 
    error: null, 
    success: null, 
    form: {},
    currentPage: 'users-create',
    user: req.user || { role: 'admin' }
  });
};

exports.createUser = async (req, res) => {
  const errors = validationResult(req);
  let mappedErrors = {};
  if (!errors.isEmpty()) {
    errors.array().forEach(e => { mappedErrors[e.param] = e.msg });
    return res.render('users/views/create', {
      errors: mappedErrors,
      error: null,
      success: null,
      form: req.body,
      currentPage: 'users-create',
      user: req.user || { role: 'admin' }
    });
  }
  try {
    await usersService.createUser(req.body);
    res.render('users/views/create', {
      errors: {},
      error: null,
      success: 'Tạo tài khoản thành công!',
      form: {},
      currentPage: 'users-create',
      user: req.user || { role: 'admin' }
    });
  } catch (err) {
    res.render('users/views/create', {
      errors: {},
      error: err.message,
      success: null,
      form: req.body,
      currentPage: 'users-create',
      user: req.user || { role: 'admin' }
    });
  }
};

exports.renderUserList = async (req, res) => {
  const users = await usersService.getAllUsers();
  res.render('users/views/index', { 
    users,
    currentPage: 'users',
    user: req.user || { role: 'admin' }
  });
};
