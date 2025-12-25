# Hướng dẫn kiểm tra MongoDB trong Docker

## 1. Kiểm tra Container đang chạy

```bash
# Xem container MongoDB
docker ps | grep mongo

# Hoặc
docker ps --filter "name=mongo"
```

## 2. Truy cập MongoDB Shell (mongosh)

### Cách 1: Truy cập trực tiếp vào container

```bash
# Vào MongoDB shell
docker exec -it mse-mongo mongosh

# Hoặc nếu dùng mongo (legacy)
docker exec -it mse-mongo mongo
```

### Cách 2: Kết nối với database cụ thể

```bash
# Kết nối với database cụ thể (thay YOUR_DB_NAME bằng tên DB của bạn)
docker exec -it mse-mongo mongosh YOUR_DB_NAME

# Ví dụ: nếu DB name là "equipment_management"
docker exec -it mse-mongo mongosh equipment_management
```

### Cách 3: Chạy lệnh MongoDB trực tiếp

```bash
# List tất cả databases
docker exec -it mse-mongo mongosh --eval "show dbs"

# List collections trong database
docker exec -it mse-mongo mongosh YOUR_DB_NAME --eval "show collections"

# Đếm số documents trong collection
docker exec -it mse-mongo mongosh YOUR_DB_NAME --eval "db.devices.countDocuments()"

# Xem một document
docker exec -it mse-mongo mongosh YOUR_DB_NAME --eval "db.devices.findOne()"
```

## 3. Các lệnh MongoDB hữu ích

### Trong MongoDB Shell:

```javascript
// Chuyển database
use equipment_management

// List collections
show collections

// Đếm documents
db.devices.countDocuments()
db.users.countDocuments()
db.categories.countDocuments()

// Xem tất cả documents (giới hạn 20)
db.devices.find().pretty()
db.users.find().pretty()

// Xem document đầu tiên
db.devices.findOne()
db.users.findOne()

// Tìm theo điều kiện
db.devices.find({ maTB: "TB001" }).pretty()
db.users.find({ role: "giao_vien" }).pretty()

// Tìm và limit
db.devices.find().limit(5).pretty()

// Sort
db.devices.find().sort({ createdAt: -1 }).limit(10).pretty()

// Aggregate
db.devices.aggregate([
  { $group: { _id: "$maDM", count: { $sum: 1 } } }
])

// Xem indexes
db.devices.getIndexes()

// Xem stats
db.devices.stats()
```

## 4. Export/Import Data

### Export collection ra file JSON

```bash
# Export một collection
docker exec -it mse-mongo mongodump --db=equipment_management --collection=devices --out=/tmp/backup

# Export toàn bộ database
docker exec -it mse-mongo mongodump --db=equipment_management --out=/tmp/backup

# Copy file từ container ra host
docker cp mse-mongo:/tmp/backup ./backup
```

### Import data từ file

```bash
# Copy file vào container
docker cp ./backup mse-mongo:/tmp/backup

# Import
docker exec -it mse-mongo mongorestore --db=equipment_management /tmp/backup
```

## 5. Sử dụng MongoDB Compass (GUI Tool)

### Kết nối từ MongoDB Compass:

**Connection String:**
```
mongodb://localhost:27017
```

**Hoặc với authentication (nếu có):**
```
mongodb://username:password@localhost:27017
```

**Các bước:**
1. Download MongoDB Compass: https://www.mongodb.com/try/download/compass
2. Mở MongoDB Compass
3. Nhập connection string: `mongodb://localhost:27017`
4. Click "Connect"
5. Chọn database và collection để xem data

## 6. Kiểm tra Logs

```bash
# Xem logs của MongoDB container
docker logs mse-mongo

# Xem logs real-time
docker logs -f mse-mongo

# Xem logs với giới hạn dòng
docker logs --tail 100 mse-mongo
```

## 7. Kiểm tra Status và Health

```bash
# Kiểm tra health check
docker inspect mse-mongo | grep -A 10 Health

# Xem thông tin container
docker inspect mse-mongo

# Xem resource usage
docker stats mse-mongo
```

## 8. Scripts hữu ích

### Script kiểm tra nhanh collections và số lượng documents

Tạo file `scripts/check-mongo-data.sh`:

```bash
#!/bin/bash

DB_NAME="equipment_management"  # Thay bằng tên DB của bạn
CONTAINER_NAME="mse-mongo"

echo "=== MongoDB Collections ==="
docker exec -it $CONTAINER_NAME mongosh $DB_NAME --quiet --eval "show collections"

echo ""
echo "=== Document Counts ==="
docker exec -it $CONTAINER_NAME mongosh $DB_NAME --quiet --eval "
  db.getCollectionNames().forEach(function(collection) {
    var count = db[collection].countDocuments();
    print(collection + ': ' + count);
  });
"
```

Chạy script:
```bash
chmod +x scripts/check-mongo-data.sh
./scripts/check-mongo-data.sh
```

### Script xem sample data

Tạo file `scripts/view-mongo-samples.sh`:

```bash
#!/bin/bash

DB_NAME="equipment_management"
CONTAINER_NAME="mse-mongo"

echo "=== Sample Devices ==="
docker exec -it $CONTAINER_NAME mongosh $DB_NAME --quiet --eval "db.devices.find().limit(3).pretty()"

echo ""
echo "=== Sample Users ==="
docker exec -it $CONTAINER_NAME mongosh $DB_NAME --quiet --eval "db.users.find().limit(3).pretty()"

echo ""
echo "=== Sample Categories ==="
docker exec -it $CONTAINER_NAME mongosh $DB_NAME --quiet --eval "db.categories.find().limit(3).pretty()"
```

## 9. Các Collections phổ biến trong hệ thống

Dựa trên code, các collections có thể có:

- `devices` - Thiết bị
- `deviceunits` - Đơn vị thiết bị
- `users` - Người dùng
- `categories` - Danh mục
- `suppliers` - Nhà cung cấp
- `borrowtickets` - Phiếu mượn
- `borrowdetails` - Chi tiết mượn
- `returnslips` - Phiếu trả
- `returndetails` - Chi tiết trả
- `acceptanceminutes` - Biên bản nghiệm thu
- `purchasingplans` - Kế hoạch mua sắm
- `trainingplans` - Kế hoạch đào tạo
- `periodic_reports` - Báo cáo định kỳ

## 10. Troubleshooting

### Container không chạy

```bash
# Xem logs
docker logs mse-mongo

# Khởi động lại
docker restart mse-mongo

# Xem status
docker ps -a | grep mongo
```

### Không kết nối được

```bash
# Kiểm tra port
docker port mse-mongo

# Kiểm tra network
docker network ls
docker network inspect <network_name>
```

### Reset database (CẨN THẬN - XÓA TẤT CẢ DATA)

```bash
# XÓA TẤT CẢ DATA - CHỈ DÙNG KHI CẦN THIẾT
docker exec -it mse-mongo mongosh YOUR_DB_NAME --eval "db.dropDatabase()"
```

## 11. Backup và Restore

### Backup toàn bộ database

```bash
# Tạo backup
docker exec mse-mongo mongodump --db=equipment_management --archive=/tmp/backup.archive

# Copy ra host
docker cp mse-mongo:/tmp/backup.archive ./backup-$(date +%Y%m%d).archive
```

### Restore từ backup

```bash
# Copy backup vào container
docker cp ./backup-20240101.archive mse-mongo:/tmp/backup.archive

# Restore
docker exec mse-mongo mongorestore --db=equipment_management --archive=/tmp/backup.archive
```

## 12. Quick Reference

```bash
# Vào MongoDB shell
docker exec -it mse-mongo mongosh

# List databases
docker exec -it mse-mongo mongosh --eval "show dbs"

# List collections
docker exec -it mse-mongo mongosh YOUR_DB_NAME --eval "show collections"

# Count documents
docker exec -it mse-mongo mongosh YOUR_DB_NAME --eval "db.devices.countDocuments()"

# Find one document
docker exec -it mse-mongo mongosh YOUR_DB_NAME --eval "db.devices.findOne()"

# Find all (limit 10)
docker exec -it mse-mongo mongosh YOUR_DB_NAME --eval "db.devices.find().limit(10).pretty()"
```

