const express = require('express');
const router = express.Router();

// Dữ liệu mẫu
function sampleDamagedItems() {
    return [
        { categoryName: 'Thiết bị dạy học tối thiểu môn Toán', code: 'TB01', name: 'Bộ thiết bị dạy về trắc nghiệm, bảng trong dạy học toán', quantity: 5, unit: 'Bộ', status: true, severity: 'nang' },
        { categoryName: 'Thiết bị dạy học tối thiểu môn Vật lý', code: 'TB02', name: 'Bộ thí nghiệm cơ học', quantity: 3, unit: 'Bộ', status: true, severity: 'nang' },
        { categoryName: 'Thiết bị dạy học tối thiểu môn Hóa học', code: 'TB03', name: 'Bộ dụng cụ thí nghiệm hóa chất cơ bản', quantity: 4, unit: 'Bộ', status: true, severity: 'trungbinh' },
        { categoryName: 'Thiết bị dạy học tối thiểu môn Sinh học', code: 'TB04', name: 'Bộ kính hiển vi', quantity: 6, unit: 'Chiếc', status: true, severity: 'kha' },
        { categoryName: 'Thiết bị dạy học tối thiểu môn Tin học', code: 'TB05', name: 'Máy chiếu Projector', quantity: 2, unit: 'Chiếc', status: true, severity: 'kha' }
    ];
}

// Index - redirect đến báo cáo
router.get('/', (req, res) => {
    return res.redirect('/teacher/reports/damaged-summary');
});

// Route hiển thị báo cáo (trang device-stats)
router.get('/device-stats', (req, res) => {
    const items = sampleDamagedItems();
    res.render('reports/views/damaged-summary', {
        title: 'Báo cáo thiết bị hỏng',
        items,
        currentPage: 'reports',
        user: req.user || { role: 'to_truong' }
    });
});

// Route chính /damaged-summary
router.get('/damaged-summary', (req, res) => {
    const items = sampleDamagedItems();
    res.render('reports/views/damaged-summary', {
        title: 'Báo cáo thiết bị hỏng',
        items,
        currentPage: 'reports',
        user: req.user || { role: 'to_truong' }
    });
});

// Xuất CSV (bỏ cột "Tình trạng")
router.get('/damaged-summary/export', (req, res) => {
    const items = sampleDamagedItems();

    // CSV headers (bỏ cột Tình trạng)
    const headers = ['Danh mục', 'Mã TB', 'Tên TB', 'Số lượng', 'ĐVT', 'Mức độ hỏng'];

    // Tạo từng dòng CSV
    const rows = items.map(i => [
        `"${i.categoryName}"`,
        i.code,
        `"${i.name}"`,
        i.quantity,
        i.unit,
        i.severity === 'nang' ? 'Nặng' : (i.severity === 'kha' ? 'Khá' : (i.severity === 'trungbinh' ? 'Trung bình' : '-'))
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Disposition', 'attachment; filename="damaged-summary.csv"');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    return res.send(csv);
});

module.exports = router;
