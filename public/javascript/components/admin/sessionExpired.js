import Swal from 'sweetalert2';

(function setupSessionInterceptors() {
    function handleExpiry() {
        if (window._sessionExpiredAlertShown) return;
        window._sessionExpiredAlertShown = true;

        // Ensure any other Swal alerts are closed or overridden
        Swal.fire({
            icon: 'warning',
            title: 'Session Expired',
            text: 'Your session has expired. Please log in again to continue.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#BC5322',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showCancelButton: false,
            // Ensure this alert is at the highest priority
            focusConfirm: true,
            scrollbarPadding: false
        }).then(() => {
            window.location.href = '/admin/logout';
        });
    }

    // --- Intercept Fetch ---
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        let [resource, config] = args;
        config = config || {};

        // Ensure headers object exists and add X-Requested-With
        if (!config.headers) {
            config.headers = {};
        }

        if (config.headers instanceof Headers) {
            config.headers.set('X-Requested-With', 'XMLHttpRequest');
            config.headers.set('Accept', 'application/json, text/plain, */*');
        } else if (Array.isArray(config.headers)) {
            // Handle array of headers [k, v]
            config.headers.push(['X-Requested-With', 'XMLHttpRequest']);
            config.headers.push(['Accept', 'application/json, text/plain, */*']);
        } else {
            // Plain object
            config.headers['X-Requested-With'] = 'XMLHttpRequest';
            config.headers['Accept'] = 'application/json, text/plain, */*';
        }

        args[1] = config;

        try {
            const response = await originalFetch.apply(this, args);
            // Handle 401 explicitly
            if (response.status === 401) {
                handleExpiry();
                // Reject the promise to stop further processing in local handlers
                return Promise.reject(new Error('Session Expired'));
            }
            return response;
        } catch (error) {
            // If it's the error we just threw, rethrow it
            if (error.message === 'Session Expired') throw error;

            // Check if the error itself indicates a 401 if it was handled by some other middleware
            throw error;
        }
    };

    // --- Intercept jQuery AJAX ---
    const setupJQueryInterceptor = () => {
        if (typeof jQuery !== 'undefined' || typeof $ !== 'undefined') {
            const jq = typeof jQuery !== 'undefined' ? jQuery : $;

            // Global setup for all future AJAX calls
            jq.ajaxSetup({
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            jq(document).ajaxError((event, xhr, settings, thrownError) => {
                if (xhr.status === 401) {
                    handleExpiry();
                }
            });
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupJQueryInterceptor);
    } else {
        setupJQueryInterceptor();
    }
})();
