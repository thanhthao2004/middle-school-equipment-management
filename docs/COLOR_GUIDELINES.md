# 🎨 BẢNG MÃ MÀU THỐNG NHẤT - MIDDLE SCHOOL EQUIPMENT MANAGEMENT

## 📋 Tổng quan
Bảng màu này được thiết kế dựa trên phân tích code của các component trong hệ thống quản lý thiết bị trường học, đảm bảo tính nhất quán và chuyên nghiệp.

---

## 🎯 **MÀU CHÍNH (Primary Colors)**

### **1. Màu Xanh Chủ Đạo (Primary Blue)**
```css
/* Màu chính của hệ thống */
--primary-blue: #1e3a8a;        /* Sidebar background */
--primary-blue-hover: #3b82f6;  /* Hover states */
--primary-blue-light: #007bff;  /* Buttons, links */
```

### **2. Màu Trắng/Xám (Neutral Colors)**
```css
/* Màu nền và text chính */
--white: #ffffff;                /* Background chính */
--light-gray: #f8f9fa;          /* Table headers, card backgrounds */
--medium-gray: #e9ecef;         /* Form backgrounds, info sections */
--border-gray: #dee2e6;         /* Borders, dividers */
--text-gray: #6c757d;           /* Secondary text, icons */
--dark-gray: #495057;           /* Primary text */
```

---

## 🚦 **MÀU TRẠNG THÁI (Status Colors)**

### **3. Màu Thành Công (Success Green)**
```css
/* Trạng thái tích cực */
--success-green: #28a745;       /* Available status, good condition */
--success-text: #28a745;        /* Text màu xanh lá */
```

### **4. Màu Cảnh Báo/Lỗi (Error Red)**
```css
/* Trạng thái tiêu cực */
--error-red: #dc3545;           /* Borrowed status, damaged condition */
--error-text: #dc3545;          /* Text màu đỏ */
--cancel-red: #dc3545;          /* Cancel buttons */
```

---

## 🎨 **MÀU COMPONENT CỤ THỂ**

### **5. Sidebar Navigation**
```css
.sidebar {
    background-color: #1e3a8a;     /* Xanh navy đậm */
}

.sidebar .nav-link {
    color: #ffffff;                /* Text trắng */
}

.sidebar .nav-link:hover,
.sidebar .nav-link.active {
    background-color: #3b82f6;     /* Xanh dương sáng */
}
```

### **6. Tables (Bảng dữ liệu)**
```css
/* Header của bảng */
.equipment-table th {
    background-color: #f8f9fa;     /* Xám nhạt */
    color: #495057;                /* Text xám đậm */
}

/* Nền của phiếu mượn */
.borrow-slip {
    background-color: #f8f9fa;     /* Xám nhạt */
    border: 2px solid #dee2e6;    /* Viền xám */
}

/* Thông tin người mượn */
.borrower-info {
    background-color: #e9ecef;      /* Xám trung bình */
}
```

### **7. Buttons (Nút bấm)**
```css
/* Nút đăng ký/chính */
.btn-register {
    background-color: #007bff;     /* Xanh dương */
    border-color: #007bff;
    color: #ffffff;
}

/* Nút hủy */
.btn-cancel {
    background-color: #dc3545;     /* Đỏ */
    border-color: #dc3545;
    color: #ffffff;
}

/* Nút đóng */
.btn-close {
    color: #dc3545;                /* Đỏ cho nút X */
}
```

### **8. Status Indicators (Chỉ báo trạng thái)**
```css
/* Trạng thái có sẵn */
.status-available {
    color: #28a745;                /* Xanh lá */
    font-weight: 600;
}

/* Trạng thái đã mượn */
.status-borrowed {
    color: #dc3545;                /* Đỏ */
    font-weight: 600;
}

/* Tình trạng tốt */
.condition-good {
    color: #28a745;                /* Xanh lá */
}

/* Tình trạng hỏng */
.condition-damaged {
    color: #dc3545;                /* Đỏ */
}
```

### **9. Text Colors (Màu chữ)**
```css
/* Tiêu đề chính */
.slip-title {
    color: #495057;                /* Xám đậm */
}

/* Tiêu đề phụ */
.slip-id {
    color: #6c757d;                /* Xám nhạt */
}

/* Icon tìm kiếm */
.search-icon {
    color: #6c757d;               /* Xám nhạt */
}
```

---

## 📱 **MÀU RESPONSIVE & INTERACTION**

### **10. Hover Effects**
```css
/* Hiệu ứng hover */
.nav-link:hover {
    background-color: #3b82f6;    /* Xanh dương sáng */
    transition: background-color 0.3s;
}

/* Button hover effects sử dụng Bootstrap mặc định */
.btn-primary:hover {
    background-color: #0056b3;     /* Xanh đậm hơn */
}
```

### **11. Modal Colors**
```css
/* Modal backgrounds sử dụng Bootstrap mặc định */
.modal-content {
    background-color: #ffffff;     /* Trắng */
}

.modal-header {
    border-bottom: 1px solid #dee2e6; /* Viền xám */
}
```

---

## 🎯 **QUY TẮC SỬ DỤNG MÀU**

### **Nguyên tắc chung:**
1. **Xanh Navy (#1e3a8a)**: Chỉ dùng cho sidebar và navigation chính
2. **Xanh Dương (#3b82f6, #007bff)**: Dùng cho buttons chính và hover states
3. **Xanh Lá (#28a745)**: Chỉ dùng cho trạng thái tích cực (có sẵn, tốt)
4. **Đỏ (#dc3545)**: Chỉ dùng cho trạng thái tiêu cực (đã mượn, hỏng, hủy)
5. **Xám**: Dùng cho backgrounds, borders, và text phụ

### **Khi thiết kế component mới:**
- **Background chính**: `#ffffff` (trắng)
- **Background phụ**: `#f8f9fa` (xám nhạt)
- **Text chính**: `#495057` (xám đậm)
- **Text phụ**: `#6c757d` (xám nhạt)
- **Borders**: `#dee2e6` (xám viền)

### **Khi thiết kế buttons:**
- **Primary Action**: `#007bff` (xanh dương)
- **Secondary Action**: `#6c757d` (xám)
- **Danger Action**: `#dc3545` (đỏ)
- **Success Action**: `#28a745` (xanh lá)

---

## 📝 **CSS Variables để sử dụng**

```css
:root {
    /* Primary Colors */
    --primary-blue: #1e3a8a;
    --primary-blue-hover: #3b82f6;
    --primary-blue-light: #007bff;
    
    /* Neutral Colors */
    --white: #ffffff;
    --light-gray: #f8f9fa;
    --medium-gray: #e9ecef;
    --border-gray: #dee2e6;
    --text-gray: #6c757d;
    --dark-gray: #495057;
    
    /* Status Colors */
    --success-green: #28a745;
    --error-red: #dc3545;
    
    /* Component Specific */
    --sidebar-bg: var(--primary-blue);
    --sidebar-hover: var(--primary-blue-hover);
    --table-header-bg: var(--light-gray);
    --button-primary: var(--primary-blue-light);
    --button-danger: var(--error-red);
    --status-success: var(--success-green);
    --status-error: var(--error-red);
}
```

---

## ✅ **CHECKLIST CHO TEAM MEMBERS**

Khi thiết kế component mới, hãy đảm bảo:

- [ ] Sử dụng đúng màu theo bảng trên
- [ ] Không tự ý thay đổi mã màu
- [ ] Sử dụng CSS variables khi có thể
- [ ] Kiểm tra contrast ratio cho accessibility
- [ ] Test trên cả light và dark mode (nếu có)
- [ ] Đảm bảo màu sắc nhất quán với design system

---

## 🔗 **Tài liệu tham khảo**

- **Bootstrap 5 Color System**: https://getbootstrap.com/docs/5.0/customize/color/
- **Material Design Colors**: https://material.io/design/color/
- **WCAG Contrast Guidelines**: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html

---

*Bảng màu này được tạo dựa trên phân tích code hiện tại và tuân thủ các nguyên tắc thiết kế UI/UX chuyên nghiệp.*
