/**
 * Notification Model
 * Lưu trữ thông báo cho các người dùng
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        recipientRole: {
            type: String,
            enum: ['hieu_truong', 'to_truong', 'giao_vien', 'admin'],
            required: true,
            index: true
        },
        type: {
            type: String,
            enum: [
                'purchasing_plan',      // Kế hoạch mua sắm
                'disposal_plan',        // Kế hoạch thanh lý
                'training_plan',        // Kế hoạch đào tạo
                'borrow_request',       // Yêu cầu mượn
                'approval_required'     // Cần phê duyệt
            ],
            required: true
        },
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        data: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true
        },
        relatedLink: String
    },
    {
        timestamps: true
    }
);

// Auto-delete old unread notifications after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

const Notification = mongoose.model('Notification', notificationSchema, 'notifications');

module.exports = Notification;
