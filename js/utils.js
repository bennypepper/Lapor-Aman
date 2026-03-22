/**
 * Utility Functions for Lapor-Aman
 * Common helpers, sanitization, validation, and rate limiting
 */

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
function sanitizeHTML(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * Validate NIK (16 digits)
 * @param {string} nik - NIK to validate
 * @returns {boolean} - True if valid
 */
function isValidNIK(nik) {
    return /^\d{16}$/.test(nik);
}

/**
 * Validate phone number (Indonesian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
function isValidPhone(phone) {
    return /^[\d+\-]+$/.test(phone) && phone.length >= 10 && phone.length <= 15;
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid
 */
function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Rate limiter to prevent abuse
 */
class RateLimiter {
    constructor() {
        this.timestamps = new Map();
    }

    /**
     * Check if action is allowed
     * @param {string} key - Identifier for the action
     * @param {number} limit - Time limit in milliseconds
     * @returns {boolean} - True if allowed
     */
    isAllowed(key, limit) {
        const now = Date.now();
        const lastAction = this.timestamps.get(key);

        if (!lastAction || now - lastAction > limit) {
            this.timestamps.set(key, now);
            return { allowed: true };
        }

        const remaining = Math.ceil((limit - (now - lastAction)) / 1000);
        return { allowed: false, remaining };
    }

    /**
     * Get remaining time for an action
     * @param {string} key - Identifier for the action
     * @param {number} limit - Time limit in milliseconds
     * @returns {number} - Remaining seconds
     */
    getRemainingTime(key, limit) {
        const lastAction = this.timestamps.get(key);
        if (!lastAction) return 0;

        const elapsed = Date.now() - lastAction;
        return Math.max(0, Math.ceil((limit - elapsed) / 1000));
    }
}

/**
 * Format date to Indonesian locale
 * @param {Date|number} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
function formatDate(date, options = {}) {
    const d = date instanceof Date ? date : new Date(date);
    const defaultOptions = { dateStyle: 'medium', timeStyle: 'short' };
    return d.toLocaleDateString('id-ID', { ...defaultOptions, ...options });
}

/**
 * Generate unique ticket ID
 * @returns {string} - Ticket ID in format LP-XXXXXX-XXX
 */
function generateTicketId() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `LP-${timestamp}-${random}`;
}

/**
 * Compress and strip EXIF metadata from image
 * @param {File} file - Image file to compress
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<Blob>} - Compressed image blob
 */
function compressImage(file, maxWidth = 1280, maxHeight = 1280, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() =>
            reject(new Error("Timeout: Proses gambar terlalu lama.")), 5000
        );

        if (!file.type.startsWith('image/')) {
            clearTimeout(timeout);
            reject(new Error("File bukan gambar."));
            return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    clearTimeout(timeout);
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error("Canvas toBlob failed."));
                    }
                }, 'image/jpeg', quality);
            };
            img.onerror = () => {
                clearTimeout(timeout);
                reject(new Error("Image load failed."));
            };
            img.src = event.target.result;
        };

        reader.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("FileReader failed."));
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Set button loading state
 * @param {HTMLElement} btn - Button element
 * @param {boolean} isLoading - Loading state
 * @param {string} originalText - Original button text
 */
function setButtonLoading(btn, isLoading, originalText = '') {
    if (!btn) return;
    if (isLoading) {
        btn.disabled = true;
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = '<span class="loader-small inline-block animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full mr-2"></span> Memproses...';
        btn.classList.add('opacity-80', 'cursor-not-allowed');
    } else {
        btn.disabled = false;
        btn.innerHTML = btn.dataset.originalText || originalText;
        btn.classList.remove('opacity-80', 'cursor-not-allowed');
    }
}

/**
 * Show loading overlay
 * @param {HTMLElement} overlay - Overlay element
 * @param {boolean} show - Show or hide
 */
function showLoading(overlay, show) {
    if (overlay) overlay.classList.toggle('hidden', !show);
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success' or 'error'
 */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'check-circle' : 'alert-circle';

    toast.innerHTML = `
        <i data-lucide="${icon}" class="w-6 h-6"></i>
        <span>${sanitizeHTML(message)}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Export for modular usage
window.utils = {
    sanitizeHTML,
    isValidNIK,
    isValidPhone,
    isValidURL,
    debounce,
    RateLimiter,
    formatDate,
    generateTicketId,
    compressImage,
    setButtonLoading,
    showLoading,
    showToast
};
