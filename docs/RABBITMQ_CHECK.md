# Hướng dẫn kiểm tra RabbitMQ khi đã mượn thiết bị

## 1. Truy cập RabbitMQ Management UI

RabbitMQ đang chạy trong Docker với Management UI được bật.

**URL:** http://localhost:15672

**Thông tin đăng nhập mặc định:**
- Username: `guest`
- Password: `guest`

## 2. Kiểm tra Queue và Messages

### Bước 1: Đăng nhập vào Management UI
1. Mở trình duyệt và truy cập: http://localhost:15672
2. Đăng nhập với `guest/guest`

### Bước 2: Kiểm tra Queue
1. Vào tab **"Queues"** ở menu trên
2. Tìm queue: `borrow_request_queue`
3. Xem thông tin:
   - **Ready**: Số message đang chờ xử lý
   - **Unacked**: Số message đang được xử lý
   - **Total**: Tổng số message đã nhận

### Bước 3: Xem chi tiết Message
1. Click vào queue `borrow_request_queue`
2. Scroll xuống phần **"Get messages"**
3. Chọn:
   - **Ack mode**: `Nack message requeue true` (để xem message nhưng không xóa)
   - Hoặc `Ack` (để xem và xóa message)
4. Click **"Get Message(s)"**
5. Xem nội dung message (JSON format)

### Bước 4: Kiểm tra Exchange
1. Vào tab **"Exchanges"**
2. Tìm exchange: `borrow_events`
3. Xem:
   - **Type**: `direct`
   - **Bindings**: Liên kết với queue nào

## 3. Kiểm tra bằng Command Line

### Kiểm tra RabbitMQ container
```bash
docker ps | grep rabbitmq
```

### Xem logs của RabbitMQ
```bash
docker logs mse-rabbitmq
```

### Kiểm tra queue bằng rabbitmqctl (trong container)
```bash
docker exec -it mse-rabbitmq rabbitmqctl list_queues
docker exec -it mse-rabbitmq rabbitmqctl list_exchanges
docker exec -it mse-rabbitmq rabbitmqctl list_bindings
```

### Xem message trong queue
```bash
# List queues với số lượng message
docker exec -it mse-rabbitmq rabbitmqctl list_queues name messages

# Xem chi tiết queue
docker exec -it mse-rabbitmq rabbitmqctl list_queues name messages consumers
```

## 4. Lưu ý quan trọng

**Hiện tại hệ thống đang dùng SYNC MODE (RabbitMQ disabled):**

Trong file `src/features/borrow/services/borrow.service.js`, dòng 151 có comment:
```javascript
// Direct DB creation - SYNC MODE (RabbitMQ disabled for reliability)
```

Điều này có nghĩa là:
- Khi giáo viên đăng ký mượn, hệ thống **KHÔNG** publish message vào RabbitMQ
- Thay vào đó, tạo phiếu mượn trực tiếp vào database (synchronous)
- RabbitMQ queue sẽ **KHÔNG có message** khi mượn thiết bị

## 5. Nếu muốn test RabbitMQ

Nếu bạn muốn test RabbitMQ và xem message trong queue, cần:

1. **Enable RabbitMQ trong code:**
   - Sửa `src/features/borrow/services/borrow.service.js`
   - Thay thế phần "Direct DB creation" bằng code publish message

2. **Chạy Worker để xử lý message:**
   ```bash
   node src/features/borrow/workers/borrow_request_worker.js
   ```

3. **Kiểm tra .env có RABBITMQ_URI:**
   ```bash
   RABBITMQ_URI=amqp://guest:guest@localhost:5672
   ```

## 6. Test thủ công với RabbitMQ

### Publish message test vào queue
```bash
docker exec -it mse-rabbitmq rabbitmqadmin publish exchange=borrow_events routing_key=borrow.request.created payload='{"test": "message"}'
```

### Consume message từ queue
```bash
docker exec -it mse-rabbitmq rabbitmqadmin get queue=borrow_request_queue
```

## 7. Monitoring

Trong Management UI, bạn có thể:
- Xem **Overview**: Tổng quan về RabbitMQ
- Xem **Connections**: Các kết nối hiện tại
- Xem **Channels**: Các channel đang mở
- Xem **Queues**: Tất cả queues và số lượng message
- Xem **Exchanges**: Tất cả exchanges
- Xem **Admin**: Quản lý users, permissions

