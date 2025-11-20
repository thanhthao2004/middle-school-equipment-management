// Worker này chạy riêng biệt với app.js
const { connectRabbitMQ } = require('../../../config/rabbitmq');
const logger = require('../../../config/logger');
const borrowRepo = require('../repositories/borrow.repo'); // Giả sử repo xử lý DB
const { BorrowTicket } = require('../models/borrow-ticket.model'); // Import Model
const { getNextCode } = require('../../../core/libs/sequence'); // Import hàm tạo mã

// Hàm xử lý logic nghiệp vụ thực tế (trước đây nằm trong service)
async function processBorrowRequest(msgPayload) {
    try {
        const { userId, borrowData } = msgPayload;
        logger.info(`Processing borrow request for user ${userId}...`);

        // --- Đây là logic đáng lẽ phải xảy ra khi xử lý ---
        // (Bạn có thể dùng logic từ models/repo thật)
        
        // 1. Tạo mã phiếu mượn
        const slipId = await getNextCode('PM', 4); // Ví dụ: PM0001
        
        // 2. Tạo đối tượng BorrowTicket (từ model)
        const newTicket = new BorrowTicket({
            maPhieu: slipId,
            ngayMuon: new Date(borrowData.borrowDate),
            ngayDuKienTra: new Date(borrowData.returnDate),
            lyDo: borrowData.content,
            nguoiLapPhieuId: userId, // Cần userId thật, ở đây đang dùng mock
            trangThai: 'pending', // Trạng thái ban đầu khi worker nhận
        });

        // 3. (Quan trọng) Lưu vào MongoDB
        // await newTicket.save(); 
        
        // (Nếu dùng Repo, ví dụ:)
        // await borrowRepo.createBorrowRequest(newTicketData);

        // 4. Xử lý chi tiết phiếu mượn (BorrowDetail)
        // ... (lặp qua borrowData.devices và lưu BorrowDetail) ...
        
        logger.info(`Successfully processed borrow request ${slipId}`);

        // TODO: Gửi email/thông báo cho giáo viên và QLTB

    } catch (err) {
        logger.error(`Error processing borrow request: ${err.message}`, msgPayload);
        // Nếu lỗi, chúng ta ném lỗi để message được NACK (xem bên dưới)
        throw err;
    }
}


// Hàm chính để khởi động worker
async function startWorker() {
    try {
        const { channel, queueName } = await connectRabbitMQ();
        
        logger.info(`Worker is waiting for messages in queue: ${queueName}`);

        channel.consume(queueName, async (msg) => {
            if (msg !== null) {
                const msgContent = msg.content.toString();
                let msgPayload;

                try {
                    msgPayload = JSON.parse(msgContent);
                    logger.info('Received new borrow request:', msgPayload);
                    
                    // Gọi hàm xử lý nghiệp vụ
                    await processBorrowRequest(msgPayload);

                    // Nếu xử lý thành công, xác nhận (ACK)
                    channel.ack(msg);
                    logger.info('Message ACKed');

                } catch (err) {
                    // Nếu xử lý lỗi, từ chối (NACK)
                    // `requeue: false` nghĩa là không đưa lại vào hàng đợi (để tránh vòng lặp lỗi)
                    // Bạn nên cấu hình RabbitMQ để có 1 "Dead Letter Exchange" (DLX)
                    // để lưu lại các message lỗi này.
                    channel.nack(msg, false, false);
                    logger.error('Message NACKed (will not requeue)', err);
                }
            }
        }, {
            noAck: false // Đặt là false để yêu cầu xác nhận (ACK/NACK) thủ công
        });

    } catch (err) {
        logger.error('Worker failed to start:', err.message);
    }
}

// Khởi động worker
startWorker();