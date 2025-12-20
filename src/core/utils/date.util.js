/**
 * Date Utility Functions
 * Format dates for display in Vietnamese format
 */

/**
 * Format a date to DD/MM/YYYY format
 * @param {Date|string} date - Date to format
 * @param {string} format - Format string (default: 'DD/MM/YYYY')
 * @returns {string} Formatted date string
 */
function formatDate(date, format = 'DD/MM/YYYY') {
    if (!date) return '';

    const d = new Date(date);

    // Check if date is valid
    if (isNaN(d.getTime())) {
        return '';
    }

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return format
        .replace('DD', day)
        .replace('MM', month)
        .replace('YYYY', year);
}

/**
 * Format date to Vietnamese locale string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date with time
 */
function formatDateTime(date) {
    if (!date) return '';

    const d = new Date(date);

    if (isNaN(d.getTime())) {
        return '';
    }

    return d.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Get today's date at midnight (00:00:00)
 * @returns {Date} Today's date with time set to 00:00:00
 */
function getTodayAtMidnight() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

/**
 * Check if a date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
function isPastDate(date) {
    const d = new Date(date);
    const today = getTodayAtMidnight();

    d.setHours(0, 0, 0, 0);

    return d < today;
}

/**
 * Get difference in days between two dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} Number of days between dates
 */
function getDaysDifference(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

module.exports = {
    formatDate,
    formatDateTime,
    getTodayAtMidnight,
    isPastDate,
    getDaysDifference
};
