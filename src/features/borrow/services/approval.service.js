class ApprovalService {
    async getPendingBorrows() {
        return [
            { id: 'PM001', createdAt: '2025-11-15', note: 'Mượn thiết bị dạy Tin học 7A', status: 'pending' },
            { id: 'PM002', createdAt: '2025-11-16', note: 'Mượn bộ thí nghiệm Hóa 9B', status: 'pending' }
        ];
    }

    async approveBorrow(id) {
        console.log(`✅ Approved borrow ${id}`);
        return true;
    }

    async rejectBorrow(id) {
        console.log(`❌ Rejected borrow ${id}`);
        return true;
    }

    async getPendingReturns() {
        return [
            { id: 'PT001', maPhieuMuon: 'PM001', ngayTra: '2025-11-18', status: 'pending' },
            { id: 'PT002', maPhieuMuon: 'PM002', ngayTra: '2025-11-19', status: 'pending' }
        ];
    }

    async approveReturn(id) {
        console.log(`✅ Approved return ${id}`);
        return true;
    }

    async rejectReturn(id) {
        console.log(`❌ Rejected return ${id}`);
        return true;
    }
}

module.exports = new ApprovalService();
