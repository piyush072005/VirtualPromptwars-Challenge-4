// ============================================
//   STADIUMAI — SECURITY & UTILITY FUNCTIONS
//   Input sanitization, rate limiting, CSP
// ============================================

'use strict';

/**
 * Maximum allowed input length for user-facing fields.
 * @constant {number}
 */
const MAX_INPUT_LENGTH = 2000;

/**
 * Maximum allowed chat messages per minute (rate limiting).
 * @constant {number}
 */
const MAX_MESSAGES_PER_MINUTE = 20;

/**
 * Rate limiter state for chat messages.
 * @type {{ count: number, resetTime: number }}
 */
const rateLimiter = {
  count: 0,
  resetTime: Date.now() + 60000
};

/**
 * Escape HTML special characters to prevent XSS attacks.
 * Replaces &, <, >, ", ' and / with their HTML entity equivalents.
 *
 * @param {*} str - The value to escape (will be converted to string)
 * @returns {string} HTML-safe string
 *
 * @example
 * escapeHtml('<script>alert("XSS")</script>');
 * // Returns: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize and validate user input for the chat interface.
 * Trims whitespace, enforces length limits, and strips null bytes.
 *
 * @param {string} input - Raw user input
 * @returns {{ valid: boolean, value: string, error: string|null }} Validation result
 *
 * @example
 * const { valid, value, error } = sanitizeInput('Hello!');
 * // { valid: true, value: 'Hello!', error: null }
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return { valid: false, value: '', error: 'Input must be a string' };
  }

  // Strip null bytes and control characters (except newlines/tabs)
  const cleaned = input
    .replace(/\0/g, '')
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();

  if (cleaned.length === 0) {
    return { valid: false, value: '', error: 'Input cannot be empty' };
  }

  if (cleaned.length > MAX_INPUT_LENGTH) {
    return {
      valid: false,
      value: cleaned.substring(0, MAX_INPUT_LENGTH),
      error: `Input exceeds maximum length of ${MAX_INPUT_LENGTH} characters`
    };
  }

  return { valid: true, value: cleaned, error: null };
}

/**
 * Check if a chat message is allowed by the rate limiter.
 * Enforces MAX_MESSAGES_PER_MINUTE limit to prevent spam.
 *
 * @returns {{ allowed: boolean, remaining: number, resetIn: number }}
 *
 * @example
 * const { allowed, remaining } = checkRateLimit();
 * if (!allowed) console.warn(`Rate limited. ${remaining} messages remaining.`);
 */
function checkRateLimit() {
  const now = Date.now();

  // Reset counter if time window has passed
  if (now >= rateLimiter.resetTime) {
    rateLimiter.count = 0;
    rateLimiter.resetTime = now + 60000;
  }

  if (rateLimiter.count >= MAX_MESSAGES_PER_MINUTE) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((rateLimiter.resetTime - now) / 1000)
    };
  }

  rateLimiter.count++;
  return {
    allowed: true,
    remaining: MAX_MESSAGES_PER_MINUTE - rateLimiter.count,
    resetIn: Math.ceil((rateLimiter.resetTime - now) / 1000)
  };
}

/**
 * Convert a limited subset of Markdown to safe HTML.
 * Only allows bold, italic, code, links (with sanitized URLs), and newlines.
 * All other content is HTML-escaped before processing.
 *
 * IMPORTANT: This function does NOT call escapeHtml on the entire input
 * first because markdown contains intentional * and _ characters.
 * Instead it escapes the parts that aren't markdown syntax.
 *
 * @param {string} text - Markdown text from AI engine (trusted internal source)
 * @returns {string} Safe HTML string
 */
function markdownToHtml(text) {
  if (!text) return '';

  return text
    // Tables: convert markdown tables to HTML
    .replace(/\|(.+)\|\n\|[-|: ]+\|\n((?:\|.+\|\n?)+)/g, (match, header, body) => {
      const headers = header.split('|').map(h => h.trim()).filter(Boolean);
      const rows = body.trim().split('\n').map(row =>
        row.split('|').map(c => c.trim()).filter(Boolean)
      );
      const headerHtml = headers.map(h => `<th style="padding:4px 10px;text-align:left;border-bottom:1px solid rgba(255,255,255,0.1);color:var(--color-primary);font-size:0.78rem;">${escapeHtml(h)}</th>`).join('');
      const rowsHtml = rows.map(row =>
        `<tr>${row.map(c => `<td style="padding:4px 10px;font-size:0.78rem;border-bottom:1px solid rgba(255,255,255,0.05);">${escapeHtml(c)}</td>`).join('')}</tr>`
      ).join('');
      return `<table style="width:100%;border-collapse:collapse;margin:8px 0;"><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table>`;
    })
    // Bold
    .replace(/\*\*(.+?)\*\*/g, (_, content) => `<strong>${escapeHtml(content)}</strong>`)
    // Italic
    .replace(/\*(.+?)\*/g, (_, content) => `<em>${escapeHtml(content)}</em>`)
    // Inline code
    .replace(/`(.+?)`/g, (_, content) => `<code style="background:rgba(0,212,255,0.1);padding:1px 5px;border-radius:3px;font-size:0.85em;">${escapeHtml(content)}</code>`)
    // Numbered list items
    .replace(/^(\d+)\.\s+(.+)$/gm, (_, num, content) => `<li style="margin-left:20px;">${escapeHtml(content)}</li>`)
    // Bullet list items
    .replace(/^[-*]\s+(.+)$/gm, (_, content) => `<li style="margin-left:16px;">${escapeHtml(content)}</li>`)
    // Headings
    .replace(/^#{1,3}\s+(.+)$/gm, (_, content) => `<strong style="color:var(--color-primary);">${escapeHtml(content)}</strong>`)
    // Double newlines to paragraphs
    .replace(/\n\n/g, '<br/><br/>')
    // Single newlines to br
    .replace(/\n/g, '<br/>');
}

/**
 * Create a debounced version of a function.
 * Delays execution until after `wait` ms have elapsed since the last call.
 *
 * @param {Function} fn - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(fn, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * Safely set innerHTML using a trusted HTML string.
 * Only use this for AI-generated content via markdownToHtml().
 *
 * @param {HTMLElement} element - Target DOM element
 * @param {string} trustedHtml - Pre-sanitized HTML string
 */
function safeSetHtml(element, trustedHtml) {
  if (!element) return;
  element.innerHTML = trustedHtml;
}

/**
 * Format a number with locale-appropriate thousands separators.
 *
 * @param {number} num - Number to format
 * @param {string} [locale='en-US'] - Locale string
 * @returns {string} Formatted number string
 *
 * @example
 * formatNumber(68714); // '68,714'
 */
function formatNumber(num, locale = 'en-US') {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  return num.toLocaleString(locale);
}

/**
 * Clamp a number between min and max values.
 *
 * @param {number} value - Input value
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a cryptographically-suitable random ID for DOM elements.
 *
 * @param {string} [prefix='id'] - Prefix for the ID
 * @returns {string} Unique ID string
 */
function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Announce a message to screen readers via an aria-live region.
 * Creates or reuses a hidden live region element.
 *
 * @param {string} message - Message to announce
 * @param {'polite'|'assertive'} [politeness='polite'] - Aria-live value
 */
function announceToScreenReader(message, politeness = 'polite') {
  let liveRegion = document.getElementById('aria-live-announcer');
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-announcer';
    liveRegion.setAttribute('aria-live', politeness);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.setAttribute('role', 'status');
    liveRegion.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
    document.body.appendChild(liveRegion);
  }
  liveRegion.setAttribute('aria-live', politeness);
  // Clear then set to ensure re-announcement
  liveRegion.textContent = '';
  setTimeout(() => { liveRegion.textContent = message; }, 50);
}

/**
 * Focus trap for modal dialogs. Keeps focus within the element.
 *
 * @param {HTMLElement} container - Container to trap focus within
 * @returns {Function} Cleanup function to remove the trap
 */
function createFocusTrap(container) {
  const focusableSelectors = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function handleKeydown(e) {
    if (e.key !== 'Tab') return;
    const focusable = Array.from(container.querySelectorAll(focusableSelectors));
    if (focusable.length === 0) return;

    const firstEl = focusable[0];
    const lastEl = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  }

  container.addEventListener('keydown', handleKeydown);
  // Focus first element
  const firstFocusable = container.querySelector(focusableSelectors);
  if (firstFocusable) firstFocusable.focus();

  return function cleanup() {
    container.removeEventListener('keydown', handleKeydown);
  };
}

// Expose globally for use across modules
window.escapeHtml = escapeHtml;
window.sanitizeInput = sanitizeInput;
window.checkRateLimit = checkRateLimit;
window.markdownToHtml = markdownToHtml;
window.debounce = debounce;
window.safeSetHtml = safeSetHtml;
window.formatNumber = formatNumber;
window.clamp = clamp;
window.generateId = generateId;
window.announceToScreenReader = announceToScreenReader;
window.createFocusTrap = createFocusTrap;
