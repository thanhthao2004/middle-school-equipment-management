const express = require("express");
const path = require("path");
const app = express();

// Thiết lập EJS view engine
app.set("view engine", "ejs");

// Đặt thư mục gốc cho các view (tất cả các module sẽ nằm trong src/features)
app.set("views", path.join(__dirname, "src/features"));

// Cho phép sử dụng file tĩnh (CSS, hình ảnh, JS frontend)
app.use("/public", express.static(path.join(__dirname, "public")));

// ==========================
// ⚙️ ROUTES
// ==========================

// Categories feature
const categoriesRoutes = require("./src/features/categories/routes/categories.routes");
app.use("/categories", categoriesRoutes);

// ==========================
// 🏠 Trang chủ
// ==========================
app.get("/", (req, res) => {
  res.send("Trang chủ đang chạy!");
});

// ==========================
// 🚀 Khởi động server
// ==========================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});
