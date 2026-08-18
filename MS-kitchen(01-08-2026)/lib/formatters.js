/**
 * Format number with Indian thousand separators (e.g., 10,00,000)
 * @param {number} value - The number to format
 * @returns {string} Formatted number string
 */
export function formatIndianNumber(value) {
    if (!value && value !== 0) return '0';
    return new Intl.NumberFormat('en-IN', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 2 
    }).format(Number(value));
}

/**
 * Format currency with Indian rupee symbol and separators
 * @param {number} value - The amount to format
 * @returns {string} Formatted currency (e.g., ₹10,00,000)
 */
export function formatCurrency(value) {
    if (!value && value !== 0) return '₹0';
    return '₹' + formatIndianNumber(Math.abs(value));
}

/**
 * Format date in Indian format
 * @param {string|Date} dateStr - The date string or Date object
 * @returns {string} Formatted date
 */
export function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
