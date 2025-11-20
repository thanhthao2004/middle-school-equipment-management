const amqp = require('amqplib');
const config = require('./env');
const logger = require('./logger');

let connection = null;
let channel = null;

const exchangeName = 'borrow_events';
const queueName = 'borrow_request_queue';
const routingKey = 'borrow.request.created';

async function connectRabbitMQ() {
    if (channel) {
        return { connection, channel, exchangeName, queueName, routingKey };
    }

    try {
        logger.info('Connecting to RabbitMQ...');
        connection = await amqp.connect(config.rabbitmq.uri);
        channel = await connection.createChannel();

        // 1. Khai báo Exchange (nơi nhận message từ publisher)
        await channel.assertExchange(exchangeName, 'direct', { durable: true });
        
        // 2. Khai báo Queue (nơi lưu trữ message)
        await channel.assertQueue(queueName, { durable: true });

        // 3. Liên kết (Bind) Exchange với Queue
        // Tất cả message gửi đến `exchangeName` với `routingKey` này sẽ đi vào `queueName`
        await channel.bindQueue(queueName, exchangeName, routingKey);

        logger.info('RabbitMQ connected and channel created');
        
        connection.on('error', (err) => {
            logger.error('RabbitMQ connection error:', err.message);
            channel = null;
            connection = null;
        });

        connection.on('close', () => {
            logger.warn('RabbitMQ connection closed. Reconnecting...');
            channel = null;
            connection = null;
            // Tùy chọn: Thêm logic tự động kết nối lại
        });

        return { connection, channel, exchangeName, queueName, routingKey };

    } catch (err) {
        logger.error('Failed to connect to RabbitMQ:', err.message);
        logger.warn('App will continue without RabbitMQ. Make sure RabbitMQ is running for borrow request processing.');
        // Không exit, app vẫn chạy được nhưng không có RabbitMQ
        return null;
    }
}

// Hàm helper để gửi message (sẽ dùng trong service)
async function publishMessage(msg) {
    if (!channel) {
        const result = await connectRabbitMQ();
        if (!result || !result.channel) {
            logger.error('Cannot publish message: RabbitMQ not connected');
            throw new Error('RabbitMQ connection failed');
        }
    }
    
    try {
        const msgBuffer = Buffer.from(JSON.stringify(msg));
        channel.publish(exchangeName, routingKey, msgBuffer, { persistent: true });
        logger.info(`Message published to ${exchangeName} (${routingKey})`);
    } catch (err) {
        logger.error('Failed to publish message:', err.message);
        throw err;
    }
}

module.exports = {
    connectRabbitMQ,
    publishMessage
};