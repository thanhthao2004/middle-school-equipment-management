// Worker này chạy riêng biệt với app.js
const mongoose = require('mongoose');
const { connectRabbitMQ } = require('../../../config/rabbitmq');
const logger = require('../../../config/logger');
const borrowRepo = require('../repositories/borrow.repo');
const config = require('../../../config/env');

/**
 * Helper: Generate all time slots between borrow and return dates
 * @param {Date} startDate - Borrow date
 * @param {string} startShift - 'sang' or 'chieu'
 * @param {Date} endDate - Return date
 * @param {string} endShift - 'sang' or 'chieu'
 * @returns {Array} - Array of {date, shift} objects
 */
function generateSlots(startDate, startShift, endDate, endShift) {
    const slots = [];
    const shifts = ['sang', 'chieu'];

    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    const startIndex = shifts.indexOf(startShift);
    const endIndex = shifts.indexOf(endShift);

    if (startIndex === -1 || endIndex === -1) {
        throw new Error(`Invalid shift values: startShift=${startShift}, endShift=${endShift}`);
    }

    while (current <= end) {
        const isStartDay = current.getTime() === new Date(startDate).setHours(0, 0, 0, 0);
        const isEndDay = current.getTime() === end.getTime();

        const from = isStartDay ? startIndex : 0;
        const to = isEndDay ? endIndex : 1;

        for (let i = from; i <= to; i++) {
            slots.push({
                date: new Date(current),
                shift: shifts[i],
                displayDate: current.toLocaleDateString('vi-VN'),
                displayShift: shifts[i] === 'sang' ? 'Sáng' : 'Chiều'
            });
        }

        current.setDate(current.getDate() + 1);
    }

    logger.info(`Generated ${slots.length} slots from ${startDate.toLocaleDateString()} ${startShift} to ${endDate.toLocaleDateString()} ${endShift}`);

    return slots;
}

// Hàm xử lý logic nghiệp vụ thực tế
async function processBorrowRequest(msgPayload) {
    try {
        const { userId, borrowData } = msgPayload;
        logger.info(`🔄 Processing borrow request for user ${userId}...`);

        const Device = require('../../devices/models/device.model');

        // Step 1: Generate all slots to check
        const startDate = new Date(borrowData.borrowDate);
        const endDate = new Date(borrowData.returnDate);
        const startShift = borrowData.sessionTime || 'sang';
        const endShift = borrowData.sessionTimeReturn || borrowData.sessionTime || 'sang';

        const slots = generateSlots(startDate, startShift, endDate, endShift);

        logger.info(`📅 Need to validate ${slots.length} time slots for ${borrowData.devices.length} device(s)`);

        // Step 2: For each device, check inventory across ALL slots
        for (const deviceRequest of borrowData.devices) {
            const device = await Device.findOne({ maTB: deviceRequest.deviceId });

            if (!device) {
                throw new Error(`❌ Thiết bị "${deviceRequest.deviceId}" không tồn tại trong hệ thống`);
            }

            logger.info(`🔍 Checking device "${device.tenTB}" (${device.maTB}) - Total stock: ${device.soLuong}, Requested: ${deviceRequest.quantity}`);

            // CRITICAL: Check inventory for EVERY slot
            for (const slot of slots) {
                const borrowedQty = await borrowRepo.getBorrowedQuantityForSlot(
                    device.maTB,
                    slot.date,
                    slot.shift
                );

                const availableQty = device.soLuong - borrowedQty;

                logger.info(
                    `  📊 Slot [${slot.displayDate} - ${slot.displayShift}]: ` +
                    `Borrowed=${borrowedQty}, Available=${availableQty}, Requested=${deviceRequest.quantity}`
                );

                if (deviceRequest.quantity > availableQty) {
                    const errorMsg =
                        `❌ Không đủ số lượng thiết bị "${device.tenTB}" \n` +
                        `📅 Thời điểm: ${slot.displayDate} ca ${slot.displayShift}\n` +
                        `📦 Yêu cầu: ${deviceRequest.quantity}\n` +
                        `✅ Khả dụng: ${availableQty}\n` +
                        `⚠️  Đã được đặt: ${borrowedQty}/${device.soLuong}`;

                    logger.error(errorMsg);
                    throw new Error(errorMsg);
                }
            }

            logger.info(`✅ Device "${device.tenTB}" passed all ${slots.length} slot validations`);
        }

        // Step 3: All validations passed - Create ticket in DB
        logger.info('✅ All inventory checks passed! Creating ticket...');

        const result = await borrowRepo.createBorrowRequest(userId, borrowData);

        logger.info(`🎉 Successfully created borrow ticket: ${result.maPhieu}`);

        // TODO: Send email notification
        // await sendBorrowApprovalEmail(result);

        return result;

    } catch (err) {
        logger.error(`❌ Error processing borrow request: ${err.message}`);
        logger.error('Payload:', JSON.stringify(msgPayload, null, 2));

        // TODO: Update draft ticket status to 'rejected' if exists
        // await updateDraftTicketStatus(msgPayload, 'rejected', err.message);

        // Re-throw to trigger NACK
        throw err;
    }
}


// Hàm chính để khởi động worker
async function startWorker() {
    try {
        // CRITICAL: Connect to MongoDB first before consuming messages
        logger.info('🔌 Connecting to MongoDB...');
        await mongoose.connect(config.mongodb.uri);
        logger.info('✅ MongoDB connected for worker');

        const { channel, queueName } = await connectRabbitMQ();

        logger.info(`🚀 Worker is waiting for messages in queue: ${queueName}`);

        channel.consume(queueName, async (msg) => {
            if (msg !== null) {
                const msgContent = msg.content.toString();
                let msgPayload;

                try {
                    msgPayload = JSON.parse(msgContent);
                    logger.info('📨 Received new borrow request:', msgPayload);

                    // Gọi hàm xử lý nghiệp vụ
                    await processBorrowRequest(msgPayload);

                    // Nếu xử lý thành công, xác nhận (ACK)
                    channel.ack(msg);
                    logger.info('✅ Message ACKed successfully');

                } catch (err) {
                    // Nếu xử lý lỗi, từ chối (NACK)
                    // `requeue: false` nghĩa là không đưa lại vào hàng đợi (để tránh vòng lặp lỗi)
                    channel.nack(msg, false, false);
                    logger.error('❌ Message NACKed (will not requeue):', err.message);
                }
            }
        }, {
            noAck: false // Đặt là false để yêu cầu xác nhận (ACK/NACK) thủ công
        });

    } catch (err) {
        logger.error('💥 Worker failed to start:', err.message);
        process.exit(1);
    }
}

// Khởi động worker
startWorker();