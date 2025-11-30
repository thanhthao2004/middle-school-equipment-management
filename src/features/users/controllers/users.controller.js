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
  try {
    const query = req.query.q || '';
    const users = await usersService.getAllUsers(query);
    res.render('users/views/index', {
      users: users || [],
      q: query,
      currentPage: 'users',
      user: req.user || { role: 'admin' },
      req: req // Truyền req để có thể truy cập req.query trong view
    });
  } catch (err) {
    console.error('Error rendering user list:', err);
    // Nếu có lỗi, vẫn render nhưng với danh sách rỗng và thông báo lỗi
    res.render('users/views/index', {
      users: [],
      q: req.query.q || '',
      currentPage: 'users',
      user: req.user || { role: 'admin' },
      error: err.message || 'Không thể tải danh sách người dùng. Vui lòng kiểm tra kết nối database.',
      req: req
    });
  }
};

/**
 * Hiển thị chi tiết user
 */
exports.renderDetail = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('renderDetail called for ID:', userId);
    console.log('Getting user detail for ID:', userId);

    if (!userId) {
      return res.status(400).send('ID người dùng không hợp lệ');
    }

    const user = await usersService.getById(userId);
    if (!user) {
      return res.status(404).send('Không tìm thấy người dùng với ID: ' + userId);
    }

    console.log('User found:', user.id, user.fullname);

    res.render('users/views/detail', {
      user,
      currentPage: 'users-detail',
      userObj: req.user || { role: 'admin' }
    });
  } catch (err) {
    console.error('Error rendering user detail:', err);
    console.error('Error stack:', err.stack);
    res.status(500).send('Lỗi khi tải thông tin người dùng: ' + err.message);
  }
};

/**
 * Hiển thị form chỉnh sửa user
 */
exports.renderEdit = async (req, res) => {
  try {
    console.log('renderEdit called for ID:', req.params.id);
    const user = await usersService.getById(req.params.id);
    if (!user) {
      return res.status(404).send('Không tìm thấy người dùng');
    }

    // Kiểm tra có principal khác không (nếu user hiện tại không phải principal)
    let hasAnotherPrincipal = false;
    if (user.role !== 'hieu_truong') {
      hasAnotherPrincipal = await usersService.checkAdminExists();
    }

    res.render('users/views/edit', {
      user,
      hasAnotherPrincipal,
      errors: {},
      error: null,
      currentPage: 'users-edit',
      userObj: req.user || { role: 'admin' }
    });
  } catch (err) {
    console.error('Error rendering edit form:', err);
    res.status(500).send('Lỗi khi tải form chỉnh sửa: ' + err.message);
  }
};

/**
 * Cập nhật user
 */
exports.updateUser = async (req, res) => {
  try {
    await usersService.updateUser(req.params.id, req.body);
    res.redirect('/admin?success=Cập nhật thành công!');
  } catch (err) {
    console.error('Error updating user:', err);
    try {
      const user = await usersService.getById(req.params.id);
      if (!user) {
        return res.status(404).send('Không tìm thấy người dùng');
      }

      let hasAnotherPrincipal = false;
      if (user.role !== 'hieu_truong') {
        hasAnotherPrincipal = await usersService.checkAdminExists();
      }

      res.render('users/views/edit', {
        user,
        hasAnotherPrincipal,
        errors: {},
        error: err.message,
        form: req.body,
        currentPage: 'users-edit',
        userObj: req.user || { role: 'admin' }
      });
    } catch (renderErr) {
      res.status(500).send('Lỗi: ' + err.message);
    }
  }
};

/**
 * Xóa user
 */
exports.deleteUser = async (req, res) => {
  try {
    await usersService.deleteUser(req.params.id);
    res.redirect('/admin?success=Xóa thành công!');
  } catch (err) {
    console.error('Error deleting user:', err);
    res.redirect('/admin?error=' + encodeURIComponent(err.message));
  }
};
