const Supplier = require("../models/supplier.model");

class SuppliersController {
  // =============================
  // GET /manager/suppliers
  // =============================
  async getListPage(req, res) {
    try {
      const { keyword } = req.query;

      // 👇 LUÔN CHỈ LẤY NCC ĐANG HOẠT ĐỘNG
      let query = {
        status: "Hoạt động",
      };

      // 👇 NẾU CÓ TỪ KHÓA THÌ GẮN THÊM
      if (keyword) {
        query.$or = [
          { name: { $regex: keyword, $options: "i" } },
          { maNCC: { $regex: keyword, $options: "i" } },
        ];
      }

      const suppliers = await Supplier.find(query).sort({ createdAt: -1 });

      res.render("suppliers/views/list", {
        suppliers,
        keyword: keyword || "",
        currentPage: "suppliers",
        user: req.user,
      });
    } catch (err) {
      console.error("List error:", err);
      res.status(500).send("Lỗi tải danh sách nhà cung cấp");
    }
  }


  // =============================
  // GET /manager/suppliers/add
  // =============================
  async getAddPage(req, res) {
    try {
      // Lấy NCC có mã lớn nhất (mới nhất)
      const lastSupplier = await Supplier.findOne({})
        .sort({ createdAt: -1 })
        .select("maNCC");

      let nextNumber = 1;

      if (lastSupplier && lastSupplier.maNCC) {
        nextNumber = parseInt(lastSupplier.maNCC.replace("NCC", "")) + 1;
      }

      const nextMaNCC = "NCC" + String(nextNumber).padStart(3, "0");

      res.render("suppliers/views/add", {
        currentPage: "suppliers",
        user: req.user,
        nextMaNCC,
      });
    } catch (err) {
      console.error("Add page error:", err);
      res.redirect("/manager/suppliers");
    }
  }




  // =============================
  // GET /manager/suppliers/edit/:id
  // =============================
  async getEditPage(req, res) {
    try {
      const supplier = await Supplier.findById(req.params.id);

      if (!supplier) return res.redirect("/manager/suppliers");

      res.render("suppliers/views/edit", {
        supplier,
        currentPage: "suppliers",
        user: req.user,
      });
    } catch (err) {
      console.error("Edit page error:", err);
      res.redirect("/manager/suppliers");
    }
  }

  // =============================
  // POST /manager/suppliers
  // =============================
  async createSupplier(req, res) {
    try {
      const { name, address, phone, email, type, contractDate, status } = req.body;

      await Supplier.create({
        name,
        address,
        phone,
        email,
        type,
        contractDate: contractDate || null,
        status: "Hoạt động",
      });

      res.redirect("/manager/suppliers");
    } catch (err) {
      console.error("Create error:", err);
      res.status(500).send("Thêm nhà cung cấp thất bại");
    }
  }

  // =============================
  // POST /manager/suppliers/:id
  // =============================
  async updateSupplier(req, res) {
    try {
      const { name, address, phone, email, type, contractDate, status } = req.body;

      await Supplier.findByIdAndUpdate(req.params.id, {
        name,
        address,
        phone,
        email,
        type,
        contractDate: contractDate || null,
        status,
      });

      res.redirect("/manager/suppliers");
    } catch (err) {
      console.error("Update error:", err);
      res.status(500).send("Cập nhật nhà cung cấp thất bại");
    }
  }

  // =============================
  // POST /manager/suppliers/:id/delete
  // =============================
  async deleteSupplier(req, res) {
    try {
      await Supplier.findByIdAndUpdate(req.params.id, {
        status: "Ngừng hợp tác",
      });

      res.redirect("/manager/suppliers");
    } catch (err) {
      console.error("Delete error:", err);
      res.status(500).send("Xóa nhà cung cấp thất bại");
    }
  }

  // =============================
  // GET /manager/suppliers/inactive
  // =============================
  // GET /manager/suppliers/inactive
  async getInactiveListPage(req, res) {
    try {
      const { keyword } = req.query;

      let query = {
        status: "Ngừng hợp tác",
      };

      if (keyword) {
        query.$or = [
          { name: { $regex: keyword, $options: "i" } },
          { maNCC: { $regex: keyword, $options: "i" } },
        ];
      }

      const suppliers = await Supplier.find(query).sort({ createdAt: -1 });

      res.render("suppliers/views/inactive-list", {
        suppliers,
        keyword: keyword || "", // 👈 BẮT BUỘC
        currentPage: "suppliers-inactive",
        user: req.user,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Lỗi tải NCC ngừng hợp tác");
    }
  }


  // =============================
  // POST /manager/suppliers/:id/restore
  // =============================
  async restoreSupplier(req, res) {
    try {
      await Supplier.findByIdAndUpdate(req.params.id, {
        status: "Hoạt động",
      });

      res.redirect("/manager/suppliers/inactive");
    } catch (err) {
      console.error("Restore error:", err);
      res.status(500).send("Khôi phục NCC thất bại");
    }
  }


}

module.exports = new SuppliersController();
