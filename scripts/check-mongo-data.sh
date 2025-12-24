#!/bin/bash

# Script kiểm tra MongoDB data trong Docker
# Usage: ./scripts/check-mongo-data.sh [database_name]

CONTAINER_NAME="mse-mongo"
DB_NAME="${1:-middle-school-equipment}"  # Default database name

echo "=========================================="
echo "MongoDB Data Check"
echo "=========================================="
echo "Container: $CONTAINER_NAME"
echo "Database: $DB_NAME"
echo ""

# Kiểm tra container có đang chạy không
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ Container $CONTAINER_NAME không đang chạy!"
    exit 1
fi

echo "✅ Container đang chạy"
echo ""

# List tất cả databases
echo "=== 📚 Databases ==="
docker exec -it $CONTAINER_NAME mongosh --quiet --eval "show dbs" 2>/dev/null
echo ""

# List collections trong database
echo "=== 📋 Collections trong database '$DB_NAME' ==="
docker exec -it $CONTAINER_NAME mongosh $DB_NAME --quiet --eval "show collections" 2>/dev/null
echo ""

# Đếm số documents trong mỗi collection
echo "=== 📊 Document Counts ==="
docker exec -it $CONTAINER_NAME mongosh $DB_NAME --quiet --eval "
  db.getCollectionNames().forEach(function(collection) {
    try {
      var count = db[collection].countDocuments();
      if (count > 0) {
        print(collection + ': ' + count + ' documents');
      }
    } catch(e) {
      // Skip if error
    }
  });
" 2>/dev/null
echo ""

# Sample data từ các collections chính
echo "=== 🔍 Sample Data ==="

# Devices
echo "--- Devices (first 2) ---"
docker exec -it $CONTAINER_NAME mongosh $DB_NAME --quiet --eval "
  var devices = db.devices.find().limit(2).toArray();
  devices.forEach(function(d) {
    print('Mã TB: ' + d.maTB + ', Tên: ' + d.tenTB + ', SL: ' + (d.soLuong || 0));
  });
" 2>/dev/null
echo ""

# Users
echo "--- Users (first 2) ---"
docker exec -it $CONTAINER_NAME mongosh $DB_NAME --quiet --eval "
  var users = db.users.find().limit(2).toArray();
  users.forEach(function(u) {
    print('Email: ' + (u.email || 'N/A') + ', Tên: ' + (u.hoTen || 'N/A') + ', Role: ' + (u.role || 'N/A'));
  });
" 2>/dev/null
echo ""

# Categories
echo "--- Categories (first 3) ---"
docker exec -it $CONTAINER_NAME mongosh $DB_NAME --quiet --eval "
  var cats = db.categories.find().limit(3).toArray();
  cats.forEach(function(c) {
    print('ID: ' + (c.id || c._id) + ', Tên: ' + (c.name || c.tenDM || 'N/A'));
  });
" 2>/dev/null
echo ""

# Borrow Tickets
echo "--- Borrow Tickets (first 2) ---"
docker exec -it $CONTAINER_NAME mongosh $DB_NAME --quiet --eval "
  var tickets = db.borrowtickets.find().limit(2).toArray();
  tickets.forEach(function(t) {
    print('Mã PM: ' + (t.maPhieu || 'N/A') + ', Trạng thái: ' + (t.trangThai || 'N/A'));
  });
" 2>/dev/null
echo ""

echo "=========================================="
echo "✅ Hoàn thành!"
echo ""
echo "💡 Tips:"
echo "  - Vào MongoDB shell: docker exec -it $CONTAINER_NAME mongosh $DB_NAME"
echo "  - Xem chi tiết: docker exec -it $CONTAINER_NAME mongosh $DB_NAME --eval \"db.devices.findOne()\""
echo "=========================================="

