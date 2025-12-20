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
  const searchQuery = req.query.q || '';
  try {
    const users = await usersService.getAllUsers(searchQuery);
    res.render('users/views/index', {
      users,
      currentPage: 'users',
      user: req.user || { role: 'admin' },
      searchQuery
    });
  } catch (err) {
    console.error(err);
    res.redirect('/admin');
  }
};

exports.renderUserDetail = async (req, res) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    if (!user) {
      return res.redirect('/admin');
    }
    res.render('users/views/detail', {
      userDetail: user,
      currentPage: 'users',
      user: req.user || { role: 'admin' }
    });
  } catch (err) {
    console.error(err);
    res.redirect('/admin');
  }
};

exports.renderEditForm = async (req, res) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    if (!user) {
      return res.redirect('/admin');
    }
    res.render('users/views/edit', {
      userDetail: user,
      errors: {},
      error: null,
      success: null,
      currentPage: 'users',
      user: req.user || { role: 'admin' }
    });
  } catch (err) {
    console.error(err);
    res.redirect('/admin');
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await usersService.updateUser(req.params.id, req.body);
    // res.redirect(`/admin/${req.params.id}/detail`); // Redirect to detail after update
    // Or render edit with success message
    res.render('users/views/edit', {
      userDetail: user,
      errors: {},
      error: null,
      success: 'Cập nhật thông tin thành công!',
      currentPage: 'users',
      user: req.user || { role: 'admin' }
    });
  } catch (err) {
    console.error(err);
    const user = await usersService.getUserById(req.params.id);
    res.render('users/views/edit', {
      userDetail: user,
      errors: {},
      error: 'Có lỗi xảy ra khi cập nhật!',
      success: null,
      currentPage: 'users',
      user: req.user || { role: 'admin' }
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await usersService.deleteUser(req.params.id);
    const users = await usersService.getAllUsers();
    res.render('users/views/index', {
      users,
      currentPage: 'users',
      user: req.user || { role: 'admin' },
      success: 'Xóa tài khoản thành công!'
    });
  } catch (err) {
    console.error(err);
    res.redirect('/admin');
  }
};
