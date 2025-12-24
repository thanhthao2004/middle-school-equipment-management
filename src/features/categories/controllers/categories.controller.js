const Category = require("../models/category.model");
const Device = require("../../devices/models/device.model");

class CategoriesController {
    // GET /manager/categories
    async getListPage(req, res) {
        try {
            const { keyword } = req.query;

            let query = {};
            if (keyword) {
                query.name = { $regex: keyword, $options: "i" }; // tìm theo tên danh mục
            }

            const categories = await Category.find(query).sort({ createdAt: -1 });

            res.render("categories/views/list", {
                categories,
                keyword: keyword || "",
                currentPage: "categories",
                user: req.user,
                messages: {
                    success: req.session?.flash?.success || null,
                    error: req.session?.flash?.error || null
                }
            });

            // Clear flash messages after rendering
            if (req.session?.flash) {
                delete req.session.flash.success;
                delete req.session.flash.error;
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi tải danh sách danh mục");
        }
    }

    // GET /manager/categories/add
    async getAddPage(req, res) {
        try {
            const lastCategory = await Category.findOne().sort({ id: -1 }).exec();
            let nextId;
            if (!lastCategory) {
                nextId = "DM01";
            } else {
                const lastNumber = parseInt(lastCategory.id.replace("DM", ""));
                nextId = "DM" + String(lastNumber + 1).padStart(2, "0");
            }

            res.render("categories/views/add", {
                currentPage: "categories",
                user: req.user,
                nextId, // gửi xuống view để hiển thị
                messages: {
                    success: req.session?.flash?.success || null,
                    error: req.session?.flash?.error || null
                }
            });

            // Clear flash messages after rendering
            if (req.session?.flash) {
                delete req.session.flash.success;
                delete req.session.flash.error;
            }
        } catch (err) {
            console.error(err);
            res.redirect("/manager/categories");
        }
    }


    // GET /manager/categories/edit/:id
    async getEditPage(req, res) {
        try {
            const category = await Category.findOne({ id: req.params.id });
            if (!category) return res.redirect("/manager/categories");

            res.render("categories/views/edit", {
                category,
                currentPage: "categories",
                user: req.user,
                messages: {
                    success: req.session?.flash?.success || null,
                    error: req.session?.flash?.error || null
                }
            });

            // Clear flash messages after rendering
            if (req.session?.flash) {
                delete req.session.flash.success;
                delete req.session.flash.error;
            }
        } catch (err) {
            console.error(err);
            res.redirect("/manager/categories");
        }
    }

    // POST /manager/categories
    async createCategory(req, res) {
        try {
            const { name, location } = req.body;

            // Validation
            if (!name || !name.trim()) {
                if (!req.session.flash) req.session.flash = {};
                req.session.flash.error = "Tên danh mục không được để trống";
                return res.redirect("/manager/categories/add");
            }

            if (!location || !location.trim()) {
                if (!req.session.flash) req.session.flash = {};
                req.session.flash.error = "Vị trí lưu trữ không được để trống";
                return res.redirect("/manager/categories/add");
            }

            await Category.create({ name: name.trim(), location: location.trim() }); // id tự sinh trong model

            if (!req.session.flash) req.session.flash = {};
            req.session.flash.success = "Thêm danh mục thành công";
            res.redirect("/manager/categories");
        } catch (err) {
            console.error("Error creating category:", err);
            if (!req.session.flash) req.session.flash = {};
            
            // Handle duplicate key error
            if (err.code === 11000) {
                req.session.flash.error = "Mã danh mục đã tồn tại";
            } else {
                req.session.flash.error = err.message || "Thêm danh mục thất bại";
            }
            res.redirect("/manager/categories/add");
        }
    }


    // POST /manager/categories/:id
    async updateCategory(req, res) {
        try {
            const { name, location } = req.body;
            const categoryId = req.params.id;

            // Validation
            if (!name || !name.trim()) {
                if (!req.session.flash) req.session.flash = {};
                req.session.flash.error = "Tên danh mục không được để trống";
                return res.redirect(`/manager/categories/edit/${categoryId}`);
            }

            if (!location || !location.trim()) {
                if (!req.session.flash) req.session.flash = {};
                req.session.flash.error = "Vị trí lưu trữ không được để trống";
                return res.redirect(`/manager/categories/edit/${categoryId}`);
            }

            const category = await Category.findOneAndUpdate(
                { id: categoryId },
                { name: name.trim(), location: location.trim() },
                { new: true }
            );

            if (!category) {
                if (!req.session.flash) req.session.flash = {};
                req.session.flash.error = "Không tìm thấy danh mục";
                return res.redirect("/manager/categories");
            }

            if (!req.session.flash) req.session.flash = {};
            req.session.flash.success = "Cập nhật danh mục thành công";
            res.redirect("/manager/categories");
        } catch (err) {
            console.error("Error updating category:", err);
            if (!req.session.flash) req.session.flash = {};
            req.session.flash.error = err.message || "Cập nhật danh mục thất bại";
            res.redirect(`/manager/categories/edit/${req.params.id}`);
        }
    }

    // POST /manager/categories/:id/delete
    async deleteCategory(req, res) {
        try {
            const categoryId = req.params.id;

            // Kiểm tra danh mục có tồn tại không
            const category = await Category.findOne({ id: categoryId });
            if (!category) {
                if (!req.session.flash) req.session.flash = {};
                req.session.flash.error = "Không tìm thấy danh mục";
                return res.redirect("/manager/categories");
            }

            // Kiểm tra xem có thiết bị nào thuộc danh mục này không
            const relatedDevices = await Device.find({ maDM: categoryId }).limit(1);
            if (relatedDevices.length > 0) {
                if (!req.session.flash) req.session.flash = {};
                req.session.flash.error = "Không thể xóa danh mục này, còn thiết bị thuộc danh mục";
                return res.redirect("/manager/categories");
            }

            // Xóa danh mục
            await Category.findOneAndDelete({ id: categoryId });
            
            if (!req.session.flash) req.session.flash = {};
            req.session.flash.success = "Xóa danh mục thành công";
            res.redirect("/manager/categories");
        } catch (err) {
            console.error("Error deleting category:", err);
            if (!req.session.flash) req.session.flash = {};
            req.session.flash.error = err.message || "Xóa danh mục thất bại";
            res.redirect("/manager/categories");
        }
    }
}

module.exports = new CategoriesController();
