// OnGoingPage.js

document.addEventListener('DOMContentLoaded', () => {
    // FAQ accordion functionality
    const faqCards = document.querySelectorAll('.faq-item-card');

    faqCards.forEach(card => {
        const questionHeader = card.querySelector('.faq-question-header');
        const toggleIcon = card.querySelector('.faq-toggle-icon');
        const answerContent = card.querySelector('.faq-answer-content');

        questionHeader.addEventListener('click', () => {
            const isExpanded = answerContent.classList.contains('visible');

            // Close all other FAQs
            faqCards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.querySelector('.faq-answer-content').classList.remove('visible');
                    otherCard.querySelector('.faq-toggle-icon').classList.remove('expanded');
                }
            });

            // Toggle current FAQ
            if (isExpanded) {
                answerContent.classList.remove('visible');
                toggleIcon.classList.remove('expanded');
            } else {
                answerContent.classList.add('visible');
                toggleIcon.classList.add('expanded');
            }
        });
    });

    // Gallery modal functionality
    const modalOverlay = document.getElementById('modalOverlay');
    const mainImage = document.getElementById('mainImage');
    const galleryThumbnails = document.getElementById('galleryThumbnails');
    const closeModal = document.getElementById('closeModal');
    const galleryCards = document.querySelectorAll('.gallery-card');

    if (modalOverlay && galleryCards.length > 0) {
        galleryCards.forEach(card => {
            card.addEventListener('click', () => {
                const images = JSON.parse(card.getAttribute('data-images') || '[]');
                if (images.length === 0) return;

                // Set initial image
                const initialImg = card.querySelector('img')?.src;
                mainImage.src = initialImg || images[0];

                // Render thumbnails
                galleryThumbnails.innerHTML = '';
                images.forEach(imgSrc => {
                    const thumb = document.createElement('div');
                    thumb.className = 'galleryThumbs';
                    if (imgSrc === (initialImg || images[0])) thumb.classList.add('active');

                    thumb.innerHTML = `<img src="${imgSrc}" alt="Thumbnail">`;
                    thumb.addEventListener('click', () => {
                        mainImage.src = imgSrc;
                        document.querySelectorAll('.galleryThumbs').forEach(t => t.classList.remove('active'));
                        thumb.classList.add('active');
                    });
                    galleryThumbnails.appendChild(thumb);
                });

                modalOverlay.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            });
        });

        const closeGallery = () => {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        closeModal?.addEventListener('click', closeGallery);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeGallery();
        });
    }

    // scroll option
    const scrollBtn = document.getElementById("scrollToTopBtn");
    window.addEventListener("scroll", () => {
        scrollBtn.classList.toggle("show", window.scrollY > 200);
    });
    scrollBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});