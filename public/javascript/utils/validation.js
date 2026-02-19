import dayjs from 'dayjs';

export function isValidDate(dateString) {
    if (!dateString) return false;

    // Check format YYYY-MM-DD
    const date = dayjs(dateString, 'YYYY-MM-DD', true);
    if (!date.isValid()) return false;

    // Check ranges
    const currentYear = dayjs().year();
    const year = date.year();

    // Range: 1998 to Current Year + 3
    if (year < 1998 || year > currentYear + 3) return false;

    return true;
}

export function getDateRange() {
    const currentYear = dayjs().year();
    return {
        min: '1998-01-01',
        max: `${currentYear + 3}-12-31`
    };
}

/**
 * Shows a validation error message for a given input field.
 * @param {HTMLElement} input - The input element to show the error for.
 * @param {string} message - The error message to display.
 */
export function showFieldError(input, message) {
    if (!input) return;

    const container = input.closest('.form-group') || input.parentNode;
    let msgEl = container.querySelector('.required-message');

    if (!msgEl) {
        msgEl = document.createElement('div');
        msgEl.className = 'required-message';
        container.appendChild(msgEl);
    }

    msgEl.textContent = message;
    msgEl.style.display = 'block';

    if (input.type !== 'checkbox' && input.type !== 'radio' && input.tagName !== 'BUTTON') {
        input.classList.add('error');
    }
}

/**
 * Hides the validation error message for a given input field.
 * @param {HTMLElement} input - The input element to hide the error for.
 */
export function hideFieldError(input) {
    if (!input) return;

    const container = input.closest('.form-group') || input.parentNode;
    const msgEl = container.querySelector('.required-message');

    if (msgEl) {
        msgEl.style.display = 'none';
    }

    input.classList.remove('error');
}

/**
 * Initializes a global character limit listener for all textareas.
 */
export function initCharLimitHighlight() {
    document.addEventListener('input', (e) => {
        if (e.target.tagName === 'TEXTAREA' || e.target.classList.contains('form-textarea')) {
            const textarea = e.target;
            const container = textarea.closest('.form-group') || textarea.parentNode;
            let charLimitMsg = container.querySelector('.char-limit-msg');
            const limit = textarea.maxLength || 200;

            if (charLimitMsg) {
                if (textarea.value.length >= limit) {
                    charLimitMsg.style.display = 'block';
                    charLimitMsg.textContent = `* Characters are more than ${limit}`;
                } else {
                    charLimitMsg.style.display = 'none';
                }
            }
        }
    });
}
