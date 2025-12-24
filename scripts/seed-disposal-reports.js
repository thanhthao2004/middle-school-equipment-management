/**
 * Seed Disposal Reports Script
 *
 * Usage:
 *   node scripts/seed-disposal-reports.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const config = require("../src/config/env");

const DisposalReport = require("../src/features/disposal/models/disposal-report.model");
const Device = require("../src/features/devices/models/device.model");

/* ======================
   CONFIG
====================== */

const ACADEMIC_YEARS = [
    "2020-2021",
    "2021-2022",
    "2022-2023",
    "2023-2024"
];

const LEVELS = ["Hỏng nhẹ", "Hỏng nặng"];

const REASONS = [
    "Thiết bị đã xuống cấp",
    "Hỏng linh kiện không thể sửa",
    "Sử dụng quá thời hạn",
    "Hỏng do nguồn điện",
    "Không còn phù hợp giảng dạy"
];

/* ======================
   HELPERS
====================== */

// Random ngày trong năm học (01/09 → 31/08)
function randomDateInAcademicYear(year) {
    const [startYear, endYear] = year.split("-").map(Number);

    const startDate = new Date(startYear, 8, 1);  // 01/09
    const endDate = new Date(endYear, 7, 31);     // 31/08

    const randomTime =
        startDate.getTime() +
        Math.random() * (endDate.getTime() - startDate.getTime());

    return new Date(randomTime);
}

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/* ======================
   MAIN
====================== */

async function seedDisposalReports() {
    try {
        await mongoose.connect(config.mongodb.uri, {
            dbName: config.mongodb.dbName
        });

        console.log("✅ Connected to MongoDB");
        console.log("🌱 Seeding disposal reports...\n");

        // Lấy danh sách thiết bị hỏng
        const brokenDevices = await Device.find({
            tinhTrangThietBi: { $regex: /hỏng/i }
        });

        if (!brokenDevices.length) {
            console.log("❌ Không có thiết bị hỏng để tạo báo cáo");
            process.exit(1);
        }

        let createdCount = 0;
        let skippedCount = 0;

        for (let i = 0; i < ACADEMIC_YEARS.length; i++) {
            const year = ACADEMIC_YEARS[i];

            // Mỗi năm học chỉ có 1 báo cáo
            const existing = await DisposalReport.findOne({ year });
            if (existing) {
                console.log(`⚠️  Đã tồn tại báo cáo năm học ${year}, bỏ qua`);
                skippedCount++;
                continue;
            }

            // 🔑 Mã biên bản TL00X
            const code = `TL${String(i + 1).padStart(3, "0")}`;

            // Chọn ngẫu nhiên 2–5 thiết bị hỏng
            const selectedDevices = brokenDevices
                .sort(() => 0.5 - Math.random())
                .slice(0, Math.floor(Math.random() * 4) + 2);

            const items = selectedDevices.map(device => ({
                device: device._id,
                broken_date: randomDateInAcademicYear(year),
                level: randomItem(LEVELS),
                reason: randomItem(REASONS),
                price: Math.floor(Math.random() * 500000) + 100000
            }));

            await DisposalReport.create({
                code,
                year,
                created_at: randomDateInAcademicYear(year),
                items,
                status: "Hoạt động"
            });

            console.log(`✅ Created disposal report ${code} (${year})`);
            createdCount++;
        }

        console.log("\n════════════════════════════════════");
        console.log(`🎉 CREATED : ${createdCount}`);
        console.log(`⚠️  SKIPPED : ${skippedCount}`);
        console.log("════════════════════════════════════\n");

        process.exit(0);

    } catch (error) {
        console.error("❌ Error seeding disposal reports:", error);
        process.exit(1);
    }
}

seedDisposalReports();
