/**
 * Notification Service
 * Xử lý gửi thông báo cho các người dùng
 */

const Notification = require('../models/notification.model');

class NotificationService {
    /**
     * Gửi thông báo đến principal khi có kế hoạch mua sắm mới
     */
    async notifyPrincipalNewPlan(planData, teacherName) {
        try {
            const notification = new Notification({
                recipientRole: 'hieu_truong',
                type: 'purchasing_plan',
                title: 'Kế hoạch mua sắm mới',
                message: `${teacherName} đã gửi kế hoạch mua sắm: ${planData.maKeHoachMuaSam}`,
                data: {
                    planId: planData._id,
                    planCode: planData.maKeHoachMuaSam,
                    year: planData.namHoc,
                    status: planData.trangThai
                },
                isRead: false
            });

            await notification.save();
            console.log(`✓ Thông báo gửi đến Hiệu trưởng: ${planData.maKeHoachMuaSam}`);
            return notification;
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    }

    /**
     * Lấy thông báo chưa đọc của người dùng
     */
    async getUnreadNotifications(recipientRole) {
        try {
            const notifications = await Notification.find({
                recipientRole,
                isRead: false
            }).sort({ createdAt: -1 }).limit(10);

            return notifications;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }

    /**
     * Đánh dấu thông báo đã đọc
     */
    async markAsRead(notificationId) {
        try {
            await Notification.findByIdAndUpdate(notificationId, { isRead: true });
            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }
}

module.exports = new NotificationService();
