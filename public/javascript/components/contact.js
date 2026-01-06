document.addEventListener('DOMContentLoaded', function () {

    const inputs = ['contact-name', 'address', 'phone', 'email'];

    inputs.forEach(id => {
        const input = document.getElementById(id);

        const msg = document.createElement('div');
        msg.className = 'required-message';
        msg.textContent = '* required';
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

        inputs.forEach(id => {
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

        const formData = {
            name: document.getElementById('contact-name').value.trim(),
            address: document.getElementById('address').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim()
        };

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/create-contact');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function () {
            const data = JSON.parse(xhr.responseText);
            if (data.success) {
                alert('Message sent successfully!');
                input.forEach(id => document.getElementById(id).value = '');
            } else {
                alert(data.message || 'Error occurred');
            }
        };
        xhr.onerror = function () {
            alert('Network error occurred');
        };
        xhr.send(JSON.stringify(formData));
    });
});