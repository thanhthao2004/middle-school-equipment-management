const Category = require("../models/category.model");
const Device = require("../../devices/models/device.model");

class CategoriesController {
    // GET /manager/categories
    async getListPage(req, res) {
        try {
            const { keyword } = req.query;

            let query = {};
            if (keyword) {
                query.$or = [
                    { name: { $regex: keyword, $options: "i" } },
                    { id: { $regex: keyword, $options: "i" } },
                ];
            }

            const categories = await Category.find(query).sort({ createdAt: -1 });

            res.render("categories/views/list", {
                categories,
                keyword: keyword || "",
                currentPage: "categories",
                user: req.user,
            });
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
            });
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
            });
        } catch (err) {
            console.error(err);
            res.redirect("/manager/categories");
        }
    }

    // POST /manager/categories
    async createCategory(req, res) {
        try {
            const { name, location } = req.body;

            await Category.create({ name, location }); // id tự sinh trong model

            res.redirect("/manager/categories");
        } catch (err) {
            console.error(err);
            res.status(500).send("Thêm danh mục thất bại");
        }
    }


    // POST /manager/categories/:id
    async updateCategory(req, res) {
        try {
            const { name, location } = req.body;

            await Category.findOneAndUpdate(
                { id: req.params.id },
                { name, location }
            );

            res.redirect("/manager/categories");
        } catch (err) {
            console.error(err);
            res.status(500).send("Cập nhật danh mục thất bại");
        }
    }

    // POST /manager/categories/:id/delete
    async deleteCategory(req, res) {
        try {
            const categoryId = req.params.id;

            // Kiểm tra xem có thiết bị nào thuộc danh mục này không
            const relatedDevices = await Device.find({ maDM: categoryId }).limit(1);
            if (relatedDevices.length > 0) {
                // Không xóa được
                return res.status(400).send("Không thể xóa danh mục này, còn thiết bị thuộc danh mục");
            }

            // Xóa danh mục
            await Category.findOneAndDelete({ id: categoryId });
            res.redirect("/manager/categories");
        } catch (err) {
            console.error(err);
            res.status(500).send("Xóa danh mục thất bại");
        }
    }
}

module.exports = new CategoriesController();
