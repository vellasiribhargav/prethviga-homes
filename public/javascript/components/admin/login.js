import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('.login-form');
    if (!loginForm) return;

    const fields = [
        { id: 'username', message: '* username is required', pattern: /^[a-zA-Z0-9._%+-]+@(gmail)\.com$/, patternMessage: '* Invalid username format' },
        { id: 'password', message: '* Password is required' }
    ];

    // Cookie helper functions
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    /*
    // Autofill username from cookie ONLY if it looks like a valid email
    const rememberedUsername = getCookie('remembered_admin_username');
    if (rememberedUsername) {
        // Simple regex to check if it's an email (doesn't have to be gmail specifically for the check)
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailPattern.test(rememberedUsername)) {
            const usernameInput = document.getElementById('username');
            if (usernameInput) {
                usernameInput.value = rememberedUsername;
            }
        }
    }
    */

    // Create and append message elements
    fields.forEach(({ id, message }) => {
        const input = document.getElementById(id);
        if (!input) return;

        const msg = document.createElement('div');
        msg.className = 'required-message';
        msg.textContent = message;
        msg.style.display = 'none';

        input.closest('.form-group').appendChild(msg);

        // Hide message on input and reset text
        input.addEventListener('input', () => {
            msg.style.display = 'none';
            msg.textContent = message; // Reset to original "required" message
        });
    });

    // Password Toggle Logic
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    if (togglePassword && passwordInput) {
        const eyeOpen = togglePassword.querySelector('.eye-open');
        const eyeClosed = togglePassword.querySelector('.eye-closed');

        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            if (type === 'password') {
                eyeOpen.style.display = 'block';
                eyeClosed.style.display = 'none';
            } else {
                eyeOpen.style.display = 'none';
                eyeClosed.style.display = 'block';
            }
        });
    }

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        let isValid = true;

        const formData = {
            username: '',
            password: ''
        };

        fields.forEach(({ id, message, pattern, patternMessage }) => {
            const input = document.getElementById(id);
            const msg = input.closest('.form-group').querySelector('.required-message');
            const value = input.value.trim();

            if (value === '') {
                msg.textContent = message;
                msg.style.display = 'block';
                isValid = false;
            } else if (pattern && !pattern.test(value)) {
                msg.textContent = patternMessage;
                msg.style.display = 'block';
                isValid = false;
            } else {
                msg.style.display = 'none';
                formData[id] = value;
            }
        });

        if (!isValid) return;

        // Show loading state
        const submitBtn = loginForm.querySelector('.login-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Verifying...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(formData)
            });

            // Log status for debugging
            // console.log('[Login] Response Status:', response.status);

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();

                if (data.success) {
                    // Store username in cookie for 30 days
                    setCookie('remembered_admin_username', formData.username, 30);
                    window.location.href = '/admin/list';
                } else {
                    const passwordInput = document.getElementById('password');
                    const msg = passwordInput.closest('.form-group').querySelector('.required-message');

                    if (msg) {
                        msg.textContent = '* ' + (data.message || 'Invalid username or password');
                        msg.style.display = 'block';
                    }

                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            } else {
                // Not JSON! Probably an error page or redirect
                const text = await response.text();
                console.error('[Login] Received non-JSON response:', text.substring(0, 500));

                const passwordInput = document.getElementById('password');
                const msg = passwordInput.closest('.form-group').querySelector('.required-message');
                if (msg) {
                    msg.textContent = '* Server error (invalid response format)';
                    msg.style.display = 'block';
                }
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('[Login] Fetch error:', error);
            const passwordInput = document.getElementById('password');
            const msg = passwordInput.closest('.form-group').querySelector('.required-message');

            if (msg) {
                msg.textContent = '* Connection error. Please try again.';
                msg.style.display = 'block';
            }

            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
});