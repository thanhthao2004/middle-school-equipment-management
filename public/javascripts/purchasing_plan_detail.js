// Purchasing Plan Detail - Export to Excel functionality
(function () {
    // Get plan data from hidden element's data attribute
    let planData = {};

    function initializePlanData() {
        const container = document.getElementById('planDataContainer');
        if (container) {
            try {
                const dataString = container.getAttribute('data-plan');
                planData = JSON.parse(dataString);
            } catch (error) {
                console.error('Error parsing plan data:', error);
                planData = {};
            }
        }
    }

    // Format currency
    function formatCurrency(value) {
        if (!value) return '0';
        return new Intl.NumberFormat('vi-VN').format(value);
    }

    // Format date
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN');
    }

    // Export to Excel
    function exportToExcel() {
        try {
            // Create workbook
            const wb = XLSX.utils.book_new();

            // Sheet 1: General information
            const infoData = [
                ['Quản lý kế hoạch mua sắm thiết bị'],
                [],
                ['Mã kế hoạch', planData.maKeHoachMuaSam],
                ['Ngày lập', formatDate(planData.createdAt)],
                ['Trạng thái', planData.trangThai === 'cho_phe_duyet' ? 'Đang chờ duyệt' : planData.trangThai === 'da_duyet' ? 'Đã duyệt' : 'Khác'],
                []
            ];

            const infoWs = XLSX.utils.aoa_to_sheet(infoData);
            infoWs['!cols'] = [{ wch: 20 }, { wch: 30 }];
            XLSX.utils.book_append_sheet(wb, infoWs, 'Thông tin');

            // Sheet 2: Device details
            const detailHeaders = [
                ['Tên Danh Mục TB', 'Mã TB', 'Tên TB', 'Số lượng', 'ĐVT', 'Đơn giá', 'Dự toán kinh phí', 'Thời gian dự kiến mua', 'Lý do']
            ];

            const detailRows = (planData.details || []).map(detail => [
                detail.tenDanhMuc || '',
                detail.maTB || '',
                detail.tenTB || '',
                detail.soLuongDuKienMua,
                detail.donViTinh,
                detail.donGia || 0,
                detail.duToanKinhPhi || 0,
                formatDate(detail.thoiGianDuKienMua),
                detail.lyDoMua || ''
            ]);

            const detailData = [...detailHeaders, ...detailRows];
            const detailWs = XLSX.utils.aoa_to_sheet(detailData);

            // Format columns
            detailWs['!cols'] = [
                { wch: 20 },
                { wch: 12 },
                { wch: 30 },
                { wch: 12 },
                { wch: 10 },
                { wch: 15 },
                { wch: 18 },
                { wch: 18 },
                { wch: 25 }
            ];

            XLSX.utils.book_append_sheet(wb, detailWs, 'Chi tiết thiết bị');

            // Export file
            const fileName = `KH_${planData.maKeHoachMuaSam}_${new Date().toISOString().slice(0, 10)}.xlsx`;
            XLSX.writeFile(wb, fileName);
        } catch (error) {
            console.error('Error exporting Excel:', error);
            alert('Lỗi khi xuất file: ' + error.message);
        }
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function () {
        // Load plan data from data attribute
        initializePlanData();

        // Attach export event
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportToExcel);
        }
    });
})();
