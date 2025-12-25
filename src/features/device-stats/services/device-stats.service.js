const Device = require('../../devices/models/device.model');
const DeviceUnit = require('../../devices/models/device-unit.model');
const Category = require('../../categories/models/category.model');

class DeviceStatsService {
    async getOverviewStats() {
        // 1. Total records
        const totalDeviceTypes = await Device.countDocuments();
        const totalDeviceUnits = await DeviceUnit.countDocuments();

        // 2. Total Value (Estimated)
        // Since price is on Device, and quantity is on Device, we sum (giaThanh * soLuong)
        const valueStats = await Device.aggregate([
            {
                $group: {
                    _id: null,
                    totalValue: { $sum: { $multiply: ["$giaThanh", "$soLuong"] } }
                }
            }
        ]);
        const totalValue = valueStats.length > 0 ? valueStats[0].totalValue : 0;

        // 3. Stats by Category
        const categoryStats = await Device.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $unwind: {
                    path: '$categoryInfo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$category',
                    categoryName: { $first: { $ifNull: ['$categoryInfo.name', '$categoryInfo.tenDM', 'Khác'] } },
                    totalQuantity: { $sum: '$soLuong' },
                    totalValue: { $sum: { $multiply: ["$giaThanh", "$soLuong"] } }
                }
            },
            { $sort: { totalValue: -1 } }
        ]);

        // 4. Stats by Condition (Based on DeviceUnit)
        const conditionStats = await DeviceUnit.aggregate([
            {
                $group: {
                    _id: '$tinhTrang',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format condition stats for easy consumption
        const formattedConditionStats = {
            'Tốt': 0, 'Khá': 0, 'Trung bình': 0, 'Hỏng': 0
        };
        conditionStats.forEach(stat => {
            if (formattedConditionStats.hasOwnProperty(stat._id)) {
                formattedConditionStats[stat._id] = stat.count;
            }
        });

        // 5. Stats by Status (Availability)
        const statusStats = await DeviceUnit.aggregate([
            {
                $group: {
                    _id: '$trangThai',
                    count: { $sum: 1 }
                }
            }
        ]);

        const formattedStatusStats = {
            'san_sang': 0, 'dang_muon': 0, 'bao_tri': 0, 'thanh_ly': 0
        };
        statusStats.forEach(stat => {
            if (formattedStatusStats.hasOwnProperty(stat._id)) {
                formattedStatusStats[stat._id] = stat.count;
            }
        });

        return {
            totalDeviceTypes,
            totalDeviceUnits,
            totalValue,
            categoryStats,
            conditionStats: formattedConditionStats,
            statusStats: formattedStatusStats
        };
    }
}

module.exports = new DeviceStatsService();
