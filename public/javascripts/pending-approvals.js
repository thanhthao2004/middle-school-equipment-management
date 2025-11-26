// Pending approvals page logic
let pendingData = [];
let cancelTargetId = null;

function loadPending() {
  const params = new URLSearchParams();
  const id = document.getElementById('filterId').value.trim();
  const from = document.getElementById('filterFrom').value;
  const to = document.getElementById('filterTo').value;
  if (id) params.append('id', id);
  if (from) params.append('createdFrom', from);
  if (to) params.append('createdTo', to);

  fetch(`/teacher/borrow/api/pending-approvals?${params.toString()}`)
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        pendingData = res.data;
        renderTable();
      }
    });
}

function renderTable() {
  const tbody = document.getElementById('pendingTbody');
  tbody.innerHTML = '';
  if (!pendingData || pendingData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">Không có phiếu chờ duyệt</td></tr>';
    return;
  }
  pendingData.forEach(item => {
    const slipId = item.maPhieu || item.id || '';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="fw-semibold">${slipId}</td>
      <td>${formatDate(item.createdAt)}</td>
      <td>
        <button class="btn btn-link p-0" data-id="${slipId}" onclick="viewSlip('${slipId}')">Xem</button>
      </td>
      <td>
        <button class="btn btn-outline-danger btn-sm" onclick="openCancel('${slipId}')">Hủy mượn</button>
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

function viewSlip(id) {
  window.location.href = `/teacher/borrow/${id}?from=pending`;
}

function openCancel(id) {
  cancelTargetId = id;
  const modal = new bootstrap.Modal(document.getElementById('confirmCancelModal'));
  modal.show();
}

function confirmCancel() {
  if (!cancelTargetId) return;
  fetch(`/teacher/borrow/api/cancel/${cancelTargetId}`, { method: 'POST' })
    .then(r => r.json())
    .then(res => {
      const modalEl = document.getElementById('confirmCancelModal');
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal.hide();
      if (res.success) {
        // Remove the canceled item from the list
        pendingData = pendingData.filter(x => x.id !== cancelTargetId);
        renderTable();
        showSuccess();
      } else {
        alert('Không thể hủy phiếu.');
      }
    });
}

function showSuccess() {
  const html = `
    <div class="modal fade" id="successCancel" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-body text-center py-4">
            <h5 class="mb-3">THÔNG BÁO</h5>
            <p class="mb-4">Hủy mượn thành công!</p>
            <button class="btn btn-primary" data-bs-dismiss="modal">OK</button>
          </div>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  const m = new bootstrap.Modal(document.getElementById('successCancel'));
  m.show();
  setTimeout(() => {
    const el = document.getElementById('successCancel');
    if (el) el.remove();
  }, 6000);
}

// Event bindings
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnApply').addEventListener('click', loadPending);
  document.getElementById('btnReset').addEventListener('click', () => {
    document.getElementById('filterId').value = '';
    document.getElementById('filterFrom').value = '';
    document.getElementById('filterTo').value = '';
    loadPending();
  });
  document.getElementById('btnConfirmCancel').addEventListener('click', confirmCancel);
  loadPending();
});


