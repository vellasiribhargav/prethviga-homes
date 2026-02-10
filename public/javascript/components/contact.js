import $ from 'jquery';
window.$ = window.jQuery = $;
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', function () {

    const inputs = [
        { id: 'contact-name', message: '* Name is required' },
        { id: 'address', message: '* Address is required' },
        { id: 'phone', message: '* Phone number is required' },
        { id: 'email', message: '* Email is required' }
    ];

    inputs.forEach(({ id, message }) => {
        const input = document.getElementById(id);
        if (!input) return;

        const msg = document.createElement('div');
        msg.className = 'required-message';
        msg.textContent = message;
        msg.style.cssText =
            'font-size:12px;color:#e74c3c;margin-top:4px;display:none;font-style:italic';

        input.parentNode.appendChild(msg);

        input.addEventListener('input', () => {
            msg.style.display = 'none';
        });
    });

    // Real-time input filtering
    const nameInput = document.getElementById('contact-name');
    if (nameInput) {
        nameInput.addEventListener('input', function () {
            this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
        });
    }

    const phoneInputRealTime = document.getElementById('phone');
    if (phoneInputRealTime) {
        phoneInputRealTime.addEventListener('input', function () {
            this.value = this.value.replace(/[^\d+]/g, '');
        });
    }

    const submitBtn = document.querySelector('.contact-card__button');
    if (!submitBtn) return;

    submitBtn.addEventListener('click', function (e) {
        e.preventDefault();

        let isValid = true;

        const formData = {
            name: document.getElementById('contact-name').value.trim(),
            address: document.getElementById('address').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim()
        };

        // Step 1: Check required fields
        inputs.forEach(({ id }) => {
            const input = document.getElementById(id);
            const msg = input.parentNode.querySelector('.required-message');

            if (input.value.trim() === '') {
                msg.style.display = 'block';
                isValid = false;
            } else {
                msg.style.display = 'none';
            }
        });

        if (!isValid) return;

        // Step 2: Format validations
        const phoneInput = document.getElementById('phone');
        const phoneMsg = phoneInput.parentNode.querySelector('.required-message');

        // remove spaces & hyphens
        const phone = formData.phone.replace(/[\s-]/g, '');

        const showError = (msg) => {
            phoneMsg.textContent = msg;
            phoneMsg.style.display = 'block';
            isValid = false;
        };

        phoneMsg.style.display = 'none';

        // +91 (India)
        if (phone.startsWith('+91')) {
            const number = phone.slice(3);

            if (!/^[6-9]\d{9}$/.test(number)) {
                showError('* Indian numbers must be 10 digits starting with 6–9');
            }

        // Other international numbers
        } else if (phone.startsWith('+')) {
            const number = phone.slice(1);

            if (!/^\d{7,15}$/.test(number)) {
                showError('* International numbers must be 7–15 digits');
            }

        // No country code
        } else {
            if (!/^\d{10,15}$/.test(phone)) {
                showError('* Number must be 10–15 digits');
            }
        }

        const emailInput = document.getElementById('email');
        const emailMsg = emailInput.parentNode.querySelector('.required-message');
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
            emailMsg.textContent = '* format: username@example.any';
            emailMsg.style.display = 'block';
            isValid = false;
        } else {
            emailMsg.style.display = 'none';
        }

        const nameInputForVal = document.getElementById('contact-name');
        if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
            const nameMsg = nameInputForVal.parentNode.querySelector('.required-message');
            nameMsg.textContent = '* Only letters and spaces allowed';
            nameMsg.style.display = 'block';
            isValid = false;
        }

        if (!isValid) return;

        // Step 3: Send request using jQuery AJAX
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        $.ajax({
            url: '/create-contact',
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(formData),
            success: function (data) {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: 'Contact saved successfully!',
                        confirmButtonColor: '#BC5322'
                    });
                    inputs.forEach(({ id }) => {
                        const input = document.getElementById(id);
                        if (input) input.value = '';
                    });
                    const contactSection = document.getElementById('contact-section');
                    if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: data.message || 'Failed to save contact',
                        confirmButtonColor: '#BC5322'
                    });
                }
            },
            error: function (xhr) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: xhr.responseJSON?.message || 'Network error occurred',
                    confirmButtonColor: '#BC5322'
                });
            },
            complete: function () {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    });
});