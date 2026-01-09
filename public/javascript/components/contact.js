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

    const submitBtn = document.querySelector('.contact-card__button');

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

        // Step 2: Format validations (only if required fields are filled)
        if (!/^\d{10}$/.test(formData.phone)) {
            const phoneInput = document.getElementById('phone');
            const phoneMsg = phoneInput.parentNode.querySelector('.required-message');
            phoneMsg.textContent = '* number should contain 10 digits';
            phoneMsg.style.display = 'block';
            isValid = false;
        }

        if (!/^[a-zA-Z0-9._%+-]+@(gmail|outlook|yahoo|hotmail)\.com$/.test(formData.email)) {
            const emailInput = document.getElementById('email');
            const emailMsg = emailInput.parentNode.querySelector('.required-message');
            emailMsg.textContent = '* format: username@example.com';
            emailMsg.style.display = 'block';
            isValid = false;
        }

        if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
            const nameInput = document.getElementById('contact-name');
            const nameMsg = nameInput.parentNode.querySelector('.required-message');
            nameMsg.textContent = '* no special characters';
            nameMsg.style.display = 'block';
            isValid = false;
        }

        if (!isValid) return;

        // Step 3: Send request and show success/error messages
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/create-contact');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function () {
            const data = JSON.parse(xhr.responseText);
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Contact saved successfully!',
                    confirmButtonColor: '#BC5322'
                });
                inputs.forEach(({ id }) => document.getElementById(id).value = '');
                document.getElementById('contact-section').scrollIntoView({ behavior: 'smooth' });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: data.message,
                    confirmButtonColor: '#BC5322'
                });
            }
        };
        xhr.onerror = function () {
            Swal.fire({
                icon: 'error',
                title: 'Network Error!',
                text: 'Network error occurred',
                confirmButtonColor: '#BC5322'
            });
        };
        xhr.send(JSON.stringify(formData));
    });
});