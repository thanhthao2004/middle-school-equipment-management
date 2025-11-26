let historyData = [];

function loadHistory() {
  const params = new URLSearchParams();
  const id = document.getElementById('filterId').value.trim();
  const type = document.getElementById('filterType').value;
  const status = document.getElementById('filterStatus').value;
  const from = document.getElementById('filterFrom').value;
  const to = document.getElementById('filterTo').value;
  if (id) params.append('search', id);
  if (type) params.append('type', type);
  if (status) params.append('status', status);
  if (from) params.append('createdFrom', from);
  if (to) params.append('createdTo', to);

  fetch(`/teacher/borrow/api/history?${params.toString()}`)
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        historyData = res.data;
        renderHistory();
      }
    });
}

function statusBadge(status, type) {
  if (type === 'return') {
    return '<span class="badge bg-info">Phiếu trả</span>';
  }
  
  switch (status) {
    case 'pending':
    case 'dang_muon': return '<span class="badge bg-warning text-dark">Chờ duyệt</span>';
    case 'approved': return '<span class="badge bg-success">Đã duyệt</span>';
    case 'rejected': return '<span class="badge bg-danger">Không duyệt</span>';
    case 'completed':
    case 'da_hoan_tat': return '<span class="badge bg-secondary">Đã hoàn tất</span>';
    case 'huy': return '<span class="badge bg-danger">Đã hủy</span>';
    default: return `<span class="badge bg-light text-dark">${status || ''}</span>`;
  }
}

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString('vi-VN');
}

function renderHistory() {
  const tbody = document.getElementById('historyTbody');
  tbody.innerHTML = '';
  if (!historyData || historyData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Không có dữ liệu</td></tr>';
    return;
  }
  historyData.forEach(item => {
    const tr = document.createElement('tr');
    const isReturn = item.type === 'return';
    const maPhieu = isReturn ? item.maPhieuTra : item.maPhieu;
    const linkHref = isReturn 
      ? `/teacher/borrow/return/${item.maPhieuTra}?from=history` 
      : `/teacher/borrow/${item.maPhieu}?from=history`;
    const linkText = isReturn ? 'Xem chi tiết phiếu trả' : 'Xem chi tiết phiếu mượn';
    const icon = isReturn ? '<i class="fas fa-undo-alt me-1"></i>' : '<i class="fas fa-clipboard-list me-1"></i>';
    
    tr.innerHTML = `
      <td class="fw-semibold">
        ${icon}${maPhieu}
        ${isReturn ? `<br><small class="text-muted">Thuộc phiếu mượn: ${item.maPhieuMuon}</small>` : ''}
      </td>
      <td>${formatDate(item.ngayTao || item.createdAt)}</td>
      <td>${statusBadge(item.trangThai || item.status, item.type)}</td>
      <td>${isReturn ? formatDate(item.ngayTra) : formatDate(item.ngayMuon)}</td>
      <td>
        <a class="btn btn-link p-0" href="${linkHref}">${linkText}</a>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnApply').addEventListener('click', loadHistory);
  document.getElementById('btnReset').addEventListener('click', () => {
    document.getElementById('filterId').value = '';
    document.getElementById('filterType').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterFrom').value = '';
    document.getElementById('filterTo').value = '';
    loadHistory();
  });
  loadHistory();
});


