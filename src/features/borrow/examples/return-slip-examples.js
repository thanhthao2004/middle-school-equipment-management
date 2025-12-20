/**
 * Example usage scripts for the new borrowing system API
 * These demonstrate how to use the new createReturnSlip endpoints
 */

// ============================================
// Example 1: Create a borrowing request with multiple items
// ============================================
async function createBorrowingRequestExample() {
    const endpoint = '/borrow/api/register'; // or '/borrow'

    const borrowData = {
        borrowDate: '2025-12-20',
        returnDate: '2025-12-27',
        sessionTime: 'sang',
        sessionTimeReturn: 'chieu',
        content: 'Dạy thí nghiệm Hóa học lớp 9A',
        devices: [
            { deviceId: 'TB001', quantity: 5 },  // Ống nghiệm
            { deviceId: 'TB002', quantity: 2 },  // Bình cầu
            { deviceId: 'TB005', quantity: 3 }   // Nam châm điện
        ]
    };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(borrowData)
    });

    const result = await response.json();
    console.log('Created borrowing slip:', result.data.maPhieu);

    return result.data.maPhieu;
}

// ============================================
// Example 2: Get borrowed items for return
// ============================================
async function getBorrowedItemsExample(maPhieu) {
    const endpoint = `/borrow/api/borrowed-items?maPhieu=${maPhieu}`;

    const response = await fetch(endpoint);
    const result = await response.json();

    console.log('Borrowed items available for return:', result.data);

    // Show items with remaining quantities
    result.data.forEach(item => {
        console.log(`- ${item.device.tenTB}: ${item.remainingQty} còn lại`);
    });

    return result.data;
}

// ============================================
// Example 3: Create a return slip for selected items
// ============================================
async function createReturnSlipExample(borrowedItems) {
    const endpoint = '/borrow/api/return-slips';

    // Select first 2 items to return
    const itemsToReturn = borrowedItems.slice(0, 2);

    const returnData = {
        borrowedItemIds: itemsToReturn.map(item => item._id),
        returnDate: new Date().toISOString().split('T')[0], // Today
        returnShift: 'chieu',
        notes: 'Trả thiết bị sau buổi thí nghiệm',
        quantities: {
            // Optional: specify custom quantities for partial returns
            // [itemId]: returnQuantity
        }
    };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(returnData)
    });

    const result = await response.json();
    console.log('Created return slip:', result.data.maPhieuTra);

    return result.data;
}

// ============================================
// Example 4: Partial return - Return only some quantity
// ============================================
async function partialReturnExample(borrowedItems) {
    const endpoint = '/borrow/api/return-slips';

    // Select an item and return only partial quantity
    const itemToReturn = borrowedItems[0];
    const returnQuantity = Math.floor(itemToReturn.remainingQty / 2); // Return half

    const returnData = {
        borrowedItemIds: [itemToReturn._id],
        returnDate: new Date().toISOString().split('T')[0],
        returnShift: 'sang',
        notes: `Trả một phần: ${returnQuantity}/${itemToReturn.remainingQty}`,
        quantities: {
            [itemToReturn._id]: returnQuantity
        }
    };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(returnData)
    });

    const result = await response.json();
    console.log('Partial return created:', result.data.maPhieuTra);
    console.log(`Returned ${returnQuantity} items, ${itemToReturn.remainingQty - returnQuantity} remaining`);

    return result.data;
}

// ============================================
// Complete workflow example
// ============================================
async function completeWorkflowExample() {
    console.log('=== Complete Borrowing and Return Workflow ===\n');

    // Step 1: Create borrowing request
    console.log('Step 1: Creating borrowing request...');
    const maPhieu = await createBorrowingRequestExample();
    console.log('✓ Borrowing slip created:', maPhieu);
    console.log('');

    // Wait a bit (in real scenario, this would be approved by QLTB)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: Get borrowed items
    console.log('Step 2: Fetching borrowed items...');
    const borrowedItems = await getBorrowedItemsExample(maPhieu);
    console.log('✓ Found', borrowedItems.length, 'borrowed items');
    console.log('');

    // Step 3: Create first return slip (return 2 items)
    console.log('Step 3: Creating return slip for 2 items...');
    const returnSlip1 = await createReturnSlipExample(borrowedItems);
    console.log('✓ Return slip created:', returnSlip1.maPhieuTra);
    console.log('');

    // Step 4: Create partial return for the remaining item
    console.log('Step 4: Creating partial return for remaining item...');
    const remainingItems = borrowedItems.slice(2);
    if (remainingItems.length > 0) {
        const returnSlip2 = await partialReturnExample(remainingItems);
        console.log('✓ Partial return created:', returnSlip2.maPhieuTra);
    }
    console.log('');

    console.log('=== Workflow Complete ===');
}

// Export for use
module.exports = {
    createBorrowingRequestExample,
    getBorrowedItemsExample,
    createReturnSlipExample,
    partialReturnExample,
    completeWorkflowExample
};
