let historyData = [];

function loadHistory() {
  const params = new URLSearchParams();
  const id = document.getElementById('filterId').value.trim();
  const status = document.getElementById('filterStatus').value;
  const from = document.getElementById('filterFrom').value;
  const to = document.getElementById('filterTo').value;
  if (id) params.append('id', id);
  if (status) params.append('status', status);
  if (from) params.append('createdFrom', from);
  if (to) params.append('createdTo', to);

  fetch(`/borrow/api/history?${params.toString()}`)
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        historyData = res.data;
        renderHistory();
      }
    });
}

function statusBadge(status) {
  switch (status) {
    case 'pending': return '<span class="badge bg-warning text-dark">Chờ duyệt</span>';
    case 'approved': return '<span class="badge bg-success">Đã duyệt</span>';
    case 'rejected': return '<span class="badge bg-danger">Không duyệt</span>';
    case 'completed': return '<span class="badge bg-secondary">Đã trả</span>';
    default: return `<span class="badge bg-light text-dark">${status || ''}</span>`;
  }
}

function renderHistory() {
  const tbody = document.getElementById('historyTbody');
  tbody.innerHTML = '';
  if (!historyData || historyData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">Không có dữ liệu</td></tr>';
    return;
  }
  historyData.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="fw-semibold">${item.id}</td>
      <td>${formatDate(item.createdAt)}</td>
      <td>${statusBadge(item.status)}</td>
      <td>
        <a class="btn btn-link p-0" href="/borrow/slip/${item.id}?from=history">Xem chi tiết phiếu</a>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString('vi-VN');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnApply').addEventListener('click', loadHistory);
  document.getElementById('btnReset').addEventListener('click', () => {
    document.getElementById('filterId').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterFrom').value = '';
    document.getElementById('filterTo').value = '';
    loadHistory();
  });
  loadHistory();
});


