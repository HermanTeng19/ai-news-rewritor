/**
 * Utility functions for formatting and content management
 */

/**
 * Format large numbers to a more readable format
 * e.g., 1234567 -> 123.5万, 1234567890 -> 12.3亿
 * 
 * @param {number} num - The number to format
 * @returns {string} - Formatted number string
 */
export function formatNumber(num) {
    if (!num && num !== 0) return '';
    
    if (num >= 100000000) {
        return (num / 100000000).toFixed(1) + '亿';
    } else if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    } else {
        return num.toString();
    }
}

/**
 * Format a date to a readable string
 * 
 * @param {Date|string} date - Date object or date string
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} - Formatted date string
 */
export function formatDate(date, includeTime = false) {
    if (!date) return '';
    
    const d = new Date(date);
    
    if (isNaN(d.getTime())) {
        return '';
    }
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    if (!includeTime) {
        return `${year}-${month}-${day}`;
    }
    
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Truncate text to a maximum length with ellipsis
 * 
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - Truncated text
 */
export function truncateText(text, maxLength = 100) {
    if (!text) return '';
    
    if (text.length <= maxLength) {
        return text;
    }
    
    return text.substring(0, maxLength) + '...';
}

/**
 * Extract keywords from text
 * Basic implementation - in production, use NLP
 * 
 * @param {string} text - Text to extract keywords from
 * @param {number} count - Maximum number of keywords to extract
 * @returns {string[]} - Array of keywords
 */
export function extractKeywords(text, count = 5) {
    if (!text) return [];
    
    // In production, use a proper NLP library
    // This is a very basic implementation
    const words = text.toLowerCase()
        .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 1);
    
    // Count word frequency
    const frequency = {};
    words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
    });
    
    // Sort by frequency
    return Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(entry => entry[0]);
}

/**
 * Generate a random ID
 * 
 * @param {number} length - Length of the ID
 * @returns {string} - Random ID
 */
export function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
} 