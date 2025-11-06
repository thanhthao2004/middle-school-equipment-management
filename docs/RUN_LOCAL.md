## Chạy dự án cục bộ (teammate setup)

Yêu cầu: Docker hoặc đã cài MongoDB local. Khuyên dùng Docker để tránh lỗi dịch vụ.

1) Clone & cài dependency

```bash
git clone <repo-url>
cd middle-school-equipment-management
npm install
```

2) Tạo file môi trường

```bash
cp env.example .env
# Chỉnh JWT_SECRET, SESSION_SECRET nếu cần
```

3) Khởi chạy MongoDB bằng Docker

```bash
npm run db:up
# Docker sẽ mở MongoDB tại 127.0.0.1:27017
```

4) Chạy ứng dụng

```bash
npm run dev
# Server: http://localhost:3000
```

5) Kiểm tra dữ liệu (tuỳ chọn)

```bash
# Nếu đã cài mongosh
mongosh --host 127.0.0.1 --port 27017
use middle-school-equipment
show collections
```

6) Dừng MongoDB Docker khi không dùng

```bash
npm run db:down
```

Ghi chú:
- Chỉ cần thêm `.env` và có Docker là chạy được, không cần cài MongoDB qua Homebrew.
- Xem chi tiết schema: `docs/DB_SCHEMA.md`.


