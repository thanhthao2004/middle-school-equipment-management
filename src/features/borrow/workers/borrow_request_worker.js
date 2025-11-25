// Worker này chạy riêng biệt với app.js
const { connectRabbitMQ } = require('../../../config/rabbitmq');
const logger = require('../../../config/logger');
const borrowRepo = require('../repositories/borrow.repo');

// Hàm xử lý logic nghiệp vụ thực tế
async function processBorrowRequest(msgPayload) {
    try {
        const { userId, borrowData } = msgPayload;
        logger.info(`Processing borrow request for user ${userId}...`);

        // Gọi Repo để lưu vào DB
        const result = await borrowRepo.createBorrowRequest(userId, borrowData);

        logger.info(`Successfully processed borrow request ${result.maPhieu}`);

        // TODO: Gửi email/thông báo cho giáo viên và QLTB

    } catch (err) {
        logger.error(`Error processing borrow request: ${err.message}`, msgPayload);
        // Nếu lỗi, chúng ta ném lỗi để message được NACK
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