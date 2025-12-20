(function () {
    const addBtn = document.getElementById('add-row');
    const tbody = document.getElementById('items-tbody');
    
    // Get initial row count from data attribute
    const itemsTbody = document.getElementById('items-tbody');
    const initialRows = itemsTbody ? itemsTbody.querySelectorAll('tr').length : 1;
    let rowCount = initialRows;
    let idx = rowCount;
    let allDevices = [];
    let selectedDeviceModal = new bootstrap.Modal(document.getElementById('selectDeviceModal'));

    // Utility: Format currency
    function formatCurrency(value) {
        if (!value) return '';
        return new Intl.NumberFormat('vi-VN').format(Math.round(value));
    }

    // Utility: Parse currency (remove dots)
    function parseCurrency(str) {
        if (!str) return 0;
        return parseInt(str.replace(/\./g, ''), 10);
    }

    // Load devices from API
    async function loadDevices() {
        try {
            const response = await fetch('/teacher/purchasing-plans/api/devices');
            const result = await response.json();
            if (result.success) {
                allDevices = result.data;
            }
        } catch (error) {
            console.error('Error loading devices:', error);
        }
    }

    // Render device table in modal
    function renderDeviceTable(devices) {
        const tbody = document.getElementById('deviceTableBody');
        tbody.innerHTML = '';
        devices.forEach((device, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="checkbox" class="form-check-input device-checkbox" value="${device.id}" 
                    data-code="${device.code}" data-name="${device.name}" data-price="${device.price}" 
                    data-source="${device.source || ''}"></td>
                <td>${device.code}</td>
                <td>${device.name}</td>
                <td>
                    <div class="input-group input-group-sm">
                        <button class="btn btn-outline-secondary qty-decrease" type="button">−</button>
                        <input type="number" class="form-control text-center device-quantity" min="0" value="1" style="width: 50px;">
                        <button class="btn btn-outline-secondary qty-increase" type="button">+</button>
                    </div>
                </td>
                <td><input type="text" class="form-control form-control-sm device-uom" value="${device.uom || ''}"></td>
                <td><input type="text" class="form-control form-control-sm device-unit-price" value="${formatCurrency(device.price || 0)}"></td>
                <td><input type="text" class="form-control form-control-sm device-source" value="${device.source || ''}" readonly></td>
            `;
            tbody.appendChild(tr);
        });

        // Add quantity adjustment listeners
        document.querySelectorAll('.qty-decrease').forEach(btn => {
            btn.addEventListener('click', function () {
                const input = this.nextElementSibling;
                let val = parseInt(input.value) || 0;
                if (val > 0) input.value = val - 1;
            });
        });

        document.querySelectorAll('.qty-increase').forEach(btn => {
            btn.addEventListener('click', function () {
                const input = this.previousElementSibling;
                let val = parseInt(input.value) || 0;
                input.value = val + 1;
            });
        });
    }

    // Handle add devices button
    addBtn.addEventListener('click', function () {
        renderDeviceTable(allDevices);
        selectedDeviceModal.show();
    });

    // Handle device search
    document.getElementById('searchDevice').addEventListener('keyup', function (e) {
        const query = e.target.value.toLowerCase();
        const categoryId = document.getElementById('categoryFilter').value;
        let filtered = allDevices.filter(device =>
            device.code.toLowerCase().includes(query) ||
            device.name.toLowerCase().includes(query)
        );
        if (categoryId) {
            filtered = filtered.filter(device => device.category === categoryId);
        }
        renderDeviceTable(filtered);
    });

    document.getElementById('searchBtn').addEventListener('click', function () {
        document.getElementById('searchDevice').dispatchEvent(new Event('keyup'));
    });

    // Handle category filter
    document.getElementById('categoryFilter').addEventListener('change', function (e) {
        document.getElementById('searchDevice').dispatchEvent(new Event('keyup'));
    });

    // Handle confirm device selection
    document.getElementById('confirmSelectDevice').addEventListener('click', function () {
        const rows = document.querySelectorAll('#deviceTableBody tr');
        let selectedCount = 0;

        rows.forEach(row => {
            const checkbox = row.querySelector('.device-checkbox:checked');
            if (checkbox) {
                const quantity = parseInt(row.querySelector('.device-quantity').value) || 1;
                const uom = row.querySelector('.device-uom').value || '';
                const unitPrice = parseCurrency(row.querySelector('.device-unit-price').value) || 0;
                const source = checkbox.dataset.source || '';
                const totalBudget = unitPrice * quantity;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><input name="items[${idx}][category]" class="form-control" /></td>
                    <td><input name="items[${idx}][code]" class="form-control" value="${checkbox.dataset.code}" readonly /></td>
                    <td><input name="items[${idx}][name]" class="form-control" value="${checkbox.dataset.name}" readonly /></td>
                    <td><input name="items[${idx}][quantity]" type="number" min="0" class="form-control quantity-field" value="${quantity}" /></td>
                    <td><input name="items[${idx}][uom]" class="form-control" value="${uom}" /></td>
                    <td><input name="items[${idx}][unitPrice]" type="text" class="form-control price-input" 
                        data-index="${idx}" value="${formatCurrency(unitPrice)}" /></td>
                    <td><input name="items[${idx}][source]" class="form-control" value="${source}" /></td>
                    <td><input name="items[${idx}][budget]" type="text" class="form-control budget-output" 
                        data-index="${idx}" value="${formatCurrency(totalBudget)}" readonly /></td>
                    <td><input name="items[${idx}][expectedAt]" type="date" class="form-control" /></td>
                    <td><input name="items[${idx}][reason]" class="form-control" /></td>
                    <td class="text-end"><button type="button" class="btn btn-sm btn-outline-danger remove-row">✖</button></td>
                `;
                tbody.appendChild(tr);
                idx++;
                selectedCount++;
            }
        });

        // Show notification
        if (selectedCount > 0) {
            alert(`Đã thêm ${selectedCount} thiết bị vào bảng.`);
        } else {
            alert('Vui lòng chọn ít nhất một thiết bị.');
            return;
        }

        selectedDeviceModal.hide();

        // Reset search and filter
        document.getElementById('searchDevice').value = '';
        document.getElementById('categoryFilter').value = '';
    });

    // Handle budget input formatting
    // Auto calculate budget when quantity or unit price changes
    document.addEventListener('input', function (e) {
        if (e.target.classList.contains('quantity-field') || e.target.classList.contains('price-input')) {
            const row = e.target.closest('tr');
            const quantityInput = row.querySelector('.quantity-field');
            const priceInput = row.querySelector('.price-input');
            const budgetOutput = row.querySelector('.budget-output');

            if (quantityInput && priceInput && budgetOutput) {
                const quantity = parseInt(quantityInput.value) || 0;
                const unitPrice = parseCurrency(priceInput.value) || 0;
                const total = quantity * unitPrice;
                budgetOutput.value = formatCurrency(total);
            }
        }

        if (e.target.classList.contains('price-input')) {
            let value = e.target.value.replace(/\./g, '');
            if (value) {
                value = formatCurrency(value);
                e.target.value = value;
            }
        }
    });

    // Handle remove row
    document.addEventListener('click', function (e) {
        if (e.target && e.target.classList.contains('remove-row')) {
            const tr = e.target.closest('tr');
            if (tr) tr.remove();
        }
    });

    // Handle form submit - convert currency to number
    document.getElementById('editForm').addEventListener('submit', function (e) {
        const priceInputs = document.querySelectorAll('.price-input');
        const budgetOutputs = document.querySelectorAll('.budget-output');
        priceInputs.forEach(input => {
            const value = parseCurrency(input.value);
            input.value = value || '';
        });
        budgetOutputs.forEach(input => {
            const value = parseCurrency(input.value);
            input.value = value || '';
        });
    });

    // Load devices on page load
    loadDevices();
})();
