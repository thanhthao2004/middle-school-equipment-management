const DisposalReport = require("../models/disposal-report.model");
const Device = require("../../devices/models/device.model");
const disposalService = require("../services/disposal.service");


/* ======================
   LIST
====================== */
exports.index = async (req, res) => {
    try {
        const { q } = req.query; // query search từ input
        let filter = {};

        if (q && q.trim() !== "") {
            // tìm theo mã biên bản hoặc năm học
            filter = {
                $or: [
                    { code: { $regex: q, $options: "i" } },
                    { year: { $regex: q, $options: "i" } }
                ]
            };
        }

        const reports = await DisposalReport.find(filter).sort({ createdAt: -1 });

        res.render("disposal/views/list", {
            disposal: reports,
            currentAcademicYear: disposalService.getCurrentAcademicYear(),
            created: req.query.created || null,
            currentPage: "disposal",
            user: req.user
        });

    } catch (err) {
        console.error(err);
        res.redirect("/manager");
    }
};



/* ======================
   ADD REPORT (FORM)
====================== */
exports.add = async (req, res) => {
    try {
        const count = await DisposalReport.countDocuments();
        const code = req.query.code || "TL" + String(count + 1).padStart(3, "0");

        const yearNow = new Date().getFullYear();
        const year = req.query.year || `${yearNow}-${yearNow + 1}`;

        const sessionItems = req.session.disposalItems || [];

        // ✅ POPULATE DEVICE TỪ SESSION
        let items = [];
        if (sessionItems.length > 0) {
            const deviceIds = sessionItems.map(i => i.device);

            const devices = await Device.find({ _id: { $in: deviceIds } })
                .populate("category", "tenDM")
                .lean();

            items = sessionItems.map(i => ({
                ...i,
                device: devices.find(d => d._id.toString() === i.device.toString())
            }));
        }

        res.render("disposal/views/add", {
            code,
            year,
            created_at: req.query.created_at || new Date().toLocaleDateString("vi-VN"),
            items,
            currentPage: "disposal",
            user: req.user
        });
    } catch (err) {
        console.error(err);
        res.redirect("/manager/disposal");
    }
};


/* ======================
   ADD DEVICES (FORM)
====================== */
exports.addDevices = async (req, res) => {
    try {
        // 1️⃣ Lấy danh sách thiết bị đã thêm vào báo cáo (từ session)
        const selectedIds = (req.session.disposalItems || []).map(
            item => item.device.toString()
        );

        // 2️⃣ Lấy thiết bị hỏng nhưng CHƯA được thêm
        const devices = await Device.find({
            tinhTrangThietBi: { $regex: /hỏng/i },
            _id: { $nin: selectedIds }
        })
            .populate("category", "tenDM")
            .lean();

        res.render("disposal/views/add-devices", {
            code: req.query.code || "",
            year: req.query.year || "",
            created_at: req.query.created_at || "",
            devices,
            currentPage: "disposal",
            user: req.user
        });
    } catch (err) {
        console.error(err);
        res.redirect("/manager/disposal");
    }
};


/* ======================
   ADD DEVICES (POST)
   👉 LƯU VÀO SESSION
====================== */
exports.addDevicesPost = async (req, res) => {
    try {
        const { selectedDevices, code, year, created_at } = req.body;

        if (!selectedDevices || selectedDevices.length === 0) {
            return res.redirect(
                `/manager/disposal/add-devices?code=${code}&year=${year}&created_at=${created_at}`
            );
        }

        // ✅ KHỞI TẠO SESSION ITEMS
        if (!req.session.disposalItems) {
            req.session.disposalItems = [];
        }

        // Convert về mảng
        const deviceIds = Array.isArray(selectedDevices)
            ? selectedDevices
            : [selectedDevices];

        // Lọc thiết bị chưa tồn tại
        const existedIds = req.session.disposalItems.map(
            i => i.device.toString()
        );

        const newItems = deviceIds
            .filter(id => !existedIds.includes(id))
            .map(id => ({
                device: id,
                broken_date: new Date(),
                level: "",
                reason: "",
                price: 0
            }));

        req.session.disposalItems.push(...newItems);

        // 🔁 QUAY VỀ ADD
        res.redirect(
            `/manager/disposal/add?code=${code}&year=${year}&created_at=${created_at}`
        );
    } catch (err) {
        console.error(err);
        res.redirect("/manager/disposal");
    }
};


/* ======================
   STORE REPORT
====================== */
exports.store = async (req, res) => {
    try {
        const { code, year, levels, reasons } = req.body;

        const items = req.session.disposalItems || [];

        // ❗ CHƯA CHỌN THIẾT BỊ → QUAY LẠI ADD
        if (!items.length) {
            return res.redirect(`/manager/disposal/add?code=${code}&year=${year}`);
        }

        // ✅ CẬP NHẬT level + reason từ form
        items.forEach((item, index) => {
            item.level = (levels && levels[index]) || "";
            item.reason = (reasons && reasons[index]) || "";
        });

        // ✅ TẠO BÁO CÁO
        await DisposalReport.create({
            code,
            year,
            created_at: new Date(),
            items,
            status: "Hoạt động"
        });

        // ✅ XÓA SESSION SAU KHI LƯU
        req.session.disposalItems = [];

        // ✅ QUAY VỀ LIST + THÔNG BÁO
        res.redirect("/manager/disposal?created=success");
    } catch (err) {
        console.error(err);
        res.redirect("/manager/disposal?created=fail");
    }
};




/* ======================
   VIEW
====================== */
exports.view = async (req, res) => {
    try {
        const disposal = await DisposalReport
            .findById(req.params.id)
            .populate("items.device");

        if (!disposal) {
            return res.redirect("/manager/disposal");
        }

        res.render("disposal/views/view", {
            disposal,
            currentPage: "disposal",
            user: req.user
        });
    } catch (err) {
        console.error(err);
        res.redirect("/manager/disposal");
    }
};

/* ======================
   EDIT
====================== */
exports.edit = async (req, res) => {
    try {
        const disposal = await DisposalReport.findById(req.params.id)
            .populate("items.device")
            .populate("items.device.category");

        if (!disposal) {
            return res.redirect("/manager/disposal");
        }

        // ⛔ KHÔNG PHẢI NĂM HỌC HIỆN TẠI → CHỈ XEM
        if (!disposalService.isCurrentAcademicYear(disposal.year)) {
            return res.redirect(`/manager/disposal/view/${disposal._id}`);
        }

        res.render("disposal/views/edit", {
            disposal,
            currentPage: "disposal",
            user: req.user
        });
    } catch (err) {
        console.error(err);
        res.redirect("/manager/disposal");
    }
};


/* ======================
   UPDATE
====================== */
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { levels, reasons } = req.body;

        const report = await DisposalReport.findById(id).populate("items.device");
        if (!report) {
            return res.status(404).json({ success: false, message: "Không tìm thấy" });
        }

        // ⛔ KHÓA CHỈNH SỬA
        if (!disposalService.isCurrentAcademicYear(report.year)) {
            return res.status(403).json({
                success: false,
                message: "Chỉ được chỉnh sửa báo cáo năm học hiện tại"
            });
        }

        report.items.forEach((item, index) => {
            item.level = (levels && levels[index]) || "";
            item.reason = (reasons && reasons[index]) || "";
        });

        await report.save();

        res.redirect("/manager/disposal");
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};


/* ======================
   DELETE
====================== */
exports.delete = async (req, res) => {
    try {
        const report = await DisposalReport.findById(req.params.id);
        if (!report) {
            return res.redirect("/manager/disposal");
        }

        if (!disposalService.isCurrentAcademicYear(report.year)) {
            return res.redirect(`/manager/disposal/view/${report._id}`);
        }

        await DisposalReport.findByIdAndDelete(req.params.id);
        res.redirect("/manager/disposal");
    } catch (err) {
        console.error(err);
        res.redirect("/manager/disposal");
    }
};

/* ======================
   PRINCIPAL APPROVAL
====================== */
exports.approveIndex = async (req, res) => {
    try {
        // Lấy báo cáo "Hoạt động" để duyệt
        const reports = await DisposalReport.find({ status: "Hoạt động" }).sort({ createdAt: -1 });

        res.render("disposal/views/approve", {
            disposal: reports,
            currentPage: "disposal-approve",
            user: req.user || { role: "hieu_truong" }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send(`<h1>Lỗi</h1><p>${err.message}</p>`);
    }
};

exports.approveReport = async (req, res) => {
    try {
        await DisposalReport.findByIdAndUpdate(req.params.id, { status: "Đã duyệt" });
        res.redirect("/principal/disposal?status=approved");
    } catch (err) {
        console.error(err);
        res.status(500).send(`<h1>Lỗi</h1><p>${err.message}</p>`);
    }
};

exports.rejectReport = async (req, res) => {
    try {
        await DisposalReport.findByIdAndUpdate(req.params.id, { status: "Hủy" });
        res.redirect("/principal/disposal?status=rejected");
    } catch (err) {
        console.error(err);
        res.status(500).send(`<h1>Lỗi</h1><p>${err.message}</p>`);
    }
};

