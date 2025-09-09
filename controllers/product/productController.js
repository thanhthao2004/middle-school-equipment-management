const Product = require('../../models/product/product');

// Hiển thị danh sách sản phẩm
exports.index = async (req, res) => {
  const products = await Product.find();
  res.render('products/index', { products });
};

// Form thêm sản phẩm
exports.createForm = (req, res) => {
  res.render('products/create');
};

// Thêm sản phẩm mới
exports.create = async (req, res) => {
  await Product.create({ name: req.body.name, price: req.body.price });
  res.redirect('/products');
};