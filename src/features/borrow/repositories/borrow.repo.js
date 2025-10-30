// Borrow Repository
const db = require('../../../config/db');

class BorrowRepository {
    // Tạo yêu cầu mượn mới
    async createBorrowRequest(borrowData) {
        try {
            const query = `
                INSERT INTO borrow_requests 
                (user_id, devices, borrow_date, return_date, session_time, content, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                borrowData.userId,
                JSON.stringify(borrowData.devices),
                borrowData.borrowDate,
                borrowData.returnDate,
                borrowData.sessionTime,
                borrowData.content,
                borrowData.status,
                borrowData.createdAt,
                borrowData.updatedAt
            ];

            const result = await db.query(query, values);
            return result.insertId;
        } catch (error) {
            console.error('Error creating borrow request:', error);
            throw error;
        }
    }

    // Lấy phiếu mượn theo ID
    async getBorrowSlipById(slipId) {
        try {
            const query = `
                SELECT br.*, u.name as user_name, u.role as user_role
                FROM borrow_requests br
                JOIN users u ON br.user_id = u.id
                WHERE br.id = ?
            `;
            
            const result = await db.query(query, [slipId]);
            return result[0];
        } catch (error) {
            console.error('Error getting borrow slip:', error);
            throw error;
        }
    }

    // Lấy lịch sử mượn của user
    async getBorrowHistoryByUserId(userId, filters = {}) {
        try {
            let query = `
                SELECT br.*, u.name as user_name
                FROM borrow_requests br
                JOIN users u ON br.user_id = u.id
                WHERE br.user_id = ?
            `;
            
            const values = [userId];

            // Apply filters
            if (filters.status) {
                query += ' AND br.status = ?';
                values.push(filters.status);
            }

            if (filters.dateFrom) {
                query += ' AND br.borrow_date >= ?';
                values.push(filters.dateFrom);
            }

            if (filters.dateTo) {
                query += ' AND br.borrow_date <= ?';
                values.push(filters.dateTo);
            }

            query += ' ORDER BY br.created_at DESC';

            if (filters.limit) {
                query += ' LIMIT ?';
                values.push(filters.limit);
            }

            const result = await db.query(query, values);
            return result;
        } catch (error) {
            console.error('Error getting borrow history:', error);
            throw error;
        }
    }

    // Lấy danh sách thiết bị với bộ lọc
    async getDevices(filters = {}) {
        try {
            let query = `
                SELECT d.*, c.name as category_name
                FROM devices d
                LEFT JOIN categories c ON d.category_id = c.id
                WHERE 1=1
            `;
            
            const values = [];

            // Apply filters
            if (filters.category) {
                query += ' AND c.name = ?';
                values.push(filters.category);
            }

            if (filters.class) {
                query += ' AND d.class LIKE ?';
                values.push(`%${filters.class}%`);
            }

            if (filters.status) {
                query += ' AND d.status = ?';
                values.push(filters.status);
            }

            if (filters.condition) {
                query += ' AND d.condition = ?';
                values.push(filters.condition);
            }

            if (filters.location) {
                query += ' AND d.location = ?';
                values.push(filters.location);
            }

            if (filters.origin) {
                query += ' AND d.origin = ?';
                values.push(filters.origin);
            }

            if (filters.search) {
                query += ' AND (d.name LIKE ? OR d.id LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                values.push(searchTerm, searchTerm);
            }

            query += ' ORDER BY d.name';

            const result = await db.query(query, values);
            return result;
        } catch (error) {
            console.error('Error getting devices:', error);
            throw error;
        }
    }

    // Cập nhật trạng thái phiếu mượn
    async updateBorrowRequestStatus(slipId, status, approvedBy = null) {
        try {
            const query = `
                UPDATE borrow_requests 
                SET status = ?, approved_by = ?, approved_at = ?, updated_at = ?
                WHERE id = ?
            `;
            
            const values = [
                status,
                approvedBy,
                new Date(),
                new Date(),
                slipId
            ];

            const result = await db.query(query, values);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating borrow request status:', error);
            throw error;
        }
    }

    // Xóa yêu cầu mượn
    async deleteBorrowRequest(slipId) {
        try {
            const query = 'DELETE FROM borrow_requests WHERE id = ?';
            const result = await db.query(query, [slipId]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting borrow request:', error);
            throw error;
        }
    }
}

module.exports = new BorrowRepository();
