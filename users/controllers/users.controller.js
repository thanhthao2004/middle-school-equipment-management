const { validationResult } = require('express-validator');
const usersService = require('../services/users.service');

// Helper: convert role from DB code to display name
const roleToDisplay = (role) => {
  const map = {
    'principal': 'Hiệu trưởng',
    'teacher': 'Giáo viên',
    'staff': 'Nhân viên',
    'user': 'Người dùng'
  };
  return map[role] || role;
};

exports.renderCreateForm = async (req, res) => {
  // Check if admin already exists
  let hasAdmin = false;
  try {
    hasAdmin = await usersService.checkAdminExists();
  } catch (e) {
    console.error('Error checking admin:', e.message);
  }
  res.render('users/views/create', { errors: {}, error: null, success: null, form: {}, hasAdmin });
};

exports.createUser = async (req, res) => {
  const errors = validationResult(req);
  let mappedErrors = {};
  if (!errors.isEmpty()) {
    errors.array().forEach(e => { mappedErrors[e.param] = e.msg });
    let hasAdmin = false;
    try {
      hasAdmin = await usersService.checkAdminExists();
    } catch (e) {
      console.error('Error checking admin:', e.message);
    }
    return res.render('users/views/create', {
      errors: mappedErrors,
      error: null,
      success: null,
      form: req.body,
      hasAdmin
    });
  }
  try {
    await usersService.createUser(req.body);
    return res.redirect('/users');
  } catch (err) {
    let hasAdmin = false;
    try {
      hasAdmin = await usersService.checkAdminExists();
    } catch (e) {
      console.error('Error checking admin:', e.message);
    }
    // Map service validation errors to field-level errors
    let mappedErrors = {};
    if (err.message.includes('Số điện thoại')) {
      mappedErrors.phone = err.message;
    } else if (err.message.includes('Tên người dùng')) {
      mappedErrors.username = err.message;
    } else if (err.message.includes('Hiệu trưởng')) {
      mappedErrors.role = err.message;
    }
    
    res.render('users/views/create', {
      errors: mappedErrors,
      error: Object.keys(mappedErrors).length === 0 ? err.message : null,
      success: null,
      form: req.body,
      hasAdmin
    });
  }
};

exports.renderUserList = async (req, res) => {
  const q = req.query.q || '';
  const users = await usersService.getAllUsers(q);
  res.render('users/views/index', { users, q });
};

exports.renderDetail = async (req, res) => {
  const user = await usersService.getById(req.params.id);
  if (!user) return res.status(404).send('Không tìm thấy người dùng');
  res.render('users/views/detail', { user });
};

exports.renderEdit = async (req, res) => {
  const user = await usersService.getById(req.params.id);
  if (!user) return res.status(404).send('Không tìm thấy người dùng');
  // Convert role to display name for form
  user.roleDisplay = roleToDisplay(user.role);
  // Check if another principal exists (if current user is not principal)
  let hasAnotherPrincipal = false;
  if (user.role !== 'principal') {
    try {
      hasAnotherPrincipal = await usersService.checkAdminExists();
    } catch (e) {
      console.error('Error checking principal:', e.message);
    }
  }
  res.render('users/views/edit', { user, hasAnotherPrincipal, errors: {}, error: null });
};

exports.updateUser = async (req, res) => {
  try {
    await usersService.updateUser(req.params.id, req.body);
    res.redirect(`/users/${req.params.id}`);
  } catch (e) {
    const user = await usersService.getById(req.params.id);
    if (!user) return res.status(404).send('Không tìm thấy người dùng');
    user.roleDisplay = roleToDisplay(user.role);
    let hasAnotherPrincipal = false;
    if (user.role !== 'principal') {
      try {
        hasAnotherPrincipal = await usersService.checkAdminExists();
      } catch (err) {
        console.error('Error checking principal:', err.message);
      }
    }
    // Map service validation errors to field-level errors
    let mappedErrors = {};
    if (e.message.includes('Số điện thoại')) {
      mappedErrors.phone = e.message;
    } else if (e.message.includes('Tên người dùng')) {
      mappedErrors.username = e.message;
    } else if (e.message.includes('Hiệu trưởng')) {
      mappedErrors.role = e.message;
    }
    
    res.render('users/views/edit', {
      user,
      hasAnotherPrincipal,
      errors: mappedErrors,
      error: Object.keys(mappedErrors).length === 0 ? e.message : null
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await usersService.deleteUser(req.params.id);
    res.redirect('/users');
  } catch (e) {
    res.status(400).send(e.message);
  }
};
