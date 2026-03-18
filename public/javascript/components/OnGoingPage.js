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
        // Collect all gallery images
        const allGalleryImages = Array.from(galleryCards).map(card => ({
            src: card.getAttribute('data-image'),
            title: card.getAttribute('data-title')
        }));

        let currentImageIndex = 0;

        const updateMainImage = (index) => {
            currentImageIndex = index;
            const img = allGalleryImages[index];
            mainImage.src = img.src;
            mainImage.alt = img.title || 'Gallery Image';
            
            document.querySelectorAll('.galleryThumbs').forEach((t, i) => {
                t.classList.toggle('active', i === index);
            });
        };

        const navigateGallery = (direction) => {
            let newIndex = currentImageIndex + direction;
            if (newIndex < 0) newIndex = allGalleryImages.length - 1;
            if (newIndex >= allGalleryImages.length) newIndex = 0;
            updateMainImage(newIndex);
        };

        galleryCards.forEach((card, index) => {
            card.addEventListener('click', () => {
                const clickedImage = card.getAttribute('data-image');
                const clickedTitle = card.getAttribute('data-title');
                
                if (!clickedImage) return;

                currentImageIndex = index;
                mainImage.src = clickedImage;
                mainImage.alt = clickedTitle || 'Gallery Image';

                // Render thumbnails from all gallery images
                galleryThumbnails.innerHTML = '';
                allGalleryImages.forEach((img, imgIndex) => {
                    const thumb = document.createElement('div');
                    thumb.className = 'galleryThumbs';
                    if (imgIndex === index) thumb.classList.add('active');

                    thumb.innerHTML = `<img src="${img.src}" alt="${img.title || 'Thumbnail'}">`;
                    thumb.addEventListener('click', () => {
                        updateMainImage(imgIndex);
                    });
                    galleryThumbnails.appendChild(thumb);
                });

                modalOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        const handleKeyPress = (e) => {
            if (!modalOverlay.classList.contains('active')) return;
            
            if (e.key === 'ArrowLeft') {
                navigateGallery(-1);
            } else if (e.key === 'ArrowRight') {
                navigateGallery(1);
            } else if (e.key === 'Escape') {
                closeGallery();
            }
        };

        const closeGallery = () => {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        closeModal?.addEventListener('click', closeGallery);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeGallery();
        });
        document.addEventListener('keydown', handleKeyPress);
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