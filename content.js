// content.js
// Sidebar open & Close
let sidebar = document.querySelector(".sidebar");
let openBtn = document.querySelector(".bx-menu");
let closeBtn = document.querySelector(".bxs-left-arrow");

openBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

closeBtn.addEventListener("click", () => {
    sidebar.classList.remove("open");
});

// HOME INTRO - Typing Effect
document.addEventListener("DOMContentLoaded", function () {
    const words = ["Designer", "Make Up Artist", "Hair Stylist", "Nail Artist"];
    let index = 0;
    let charIndex = 0;
    let isDeleting = false;
    const textElement = document.querySelector(".changing-text");

    function typeEffect() {
        const currentWord = words[index];
        const currentText = currentWord.substring(0, charIndex);

        textElement.textContent = currentText;

        if (!isDeleting && charIndex < currentWord.length) {
            charIndex++;
            setTimeout(typeEffect, 100);
        } else if (isDeleting && charIndex > 0) {
            charIndex--;
            setTimeout(typeEffect, 50);
        } else {
            isDeleting = !isDeleting;
            if (!isDeleting) {
                index = (index + 1) % words.length;
            }
            setTimeout(typeEffect, 1000);
        }
    }
    typeEffect();
});

// SLIDE EFFECTS
document.addEventListener("DOMContentLoaded", function () {
    const sliderWrapper = document.querySelector(".courses-slider .slider-wrapper");
    const originalCards = document.querySelectorAll(".courses-slider .slider-card");
    const dots = document.querySelectorAll(".courses-slider .slider-dots .dot");
    const prevArrow = document.querySelector(".courses-slider .prev-arrow");
    const nextArrow = document.querySelector(".courses-slider .next-arrow");
    let currentIndex = 0;
    let zoomedCard = null;
    let autoSlideInterval = null;
    const autoSlideDelay = 4000; // 4 seconds
    const clonesPerSide = 2; // Fixed number of clone sets for simplicity
    let allCards = [];

    // Clone cards for infinite scrolling
    const totalOriginalCards = originalCards.length;
    for (let i = 0; i < clonesPerSide; i++) {
        originalCards.forEach(card => {
            const cloneStart = card.cloneNode(true);
            const cloneEnd = card.cloneNode(true);
            sliderWrapper.insertBefore(cloneStart, sliderWrapper.firstChild);
            sliderWrapper.appendChild(cloneEnd);
        });
    }
    allCards = document.querySelectorAll(".courses-slider .slider-card");

    // Function to update the slider position and active states
    function updateSlider(transition = true, forceCenterIndex = null) {
        const cardWidth = originalCards[0].offsetWidth + 8; // Card width + gap (0.5rem = 8px)
        let centerIndex = forceCenterIndex !== null ? forceCenterIndex : currentIndex;

        // Calculate offset to center the selected card
        let offset = -((centerIndex + clonesPerSide) * cardWidth) + (window.innerWidth / 2 - cardWidth / 2);

        // Apply transform
        sliderWrapper.style.transition = transition ? "transform 0.5s ease-in-out" : "none";
        sliderWrapper.style.transform = `translateX(${offset}px)`;

        // Seamless loop: reposition when approaching edges
        const maxIndex = totalOriginalCards + clonesPerSide;
        const minIndex = -clonesPerSide;
        if (centerIndex >= maxIndex || centerIndex < minIndex) {
            // Calculate new index within original card range
            currentIndex = ((centerIndex % totalOriginalCards) + totalOriginalCards) % totalOriginalCards;
            // Recalculate offset without transition
            offset = -((currentIndex + clonesPerSide) * cardWidth) + (window.innerWidth / 2 - cardWidth / 2);
            requestAnimationFrame(() => {
                sliderWrapper.style.transition = "none";
                sliderWrapper.style.transform = `translateX(${offset}px)`;
                // Force reflow
                sliderWrapper.offsetHeight;
                sliderWrapper.style.transition = "transform 0.5s ease-in-out";
            });
        } else {
            currentIndex = centerIndex;
        }

        // Update active card, pyramid effect, and dots
        allCards.forEach((card, index) => {
            card.classList.remove("active", "near", "far");
            const adjustedIndex = ((index - clonesPerSide) % totalOriginalCards + totalOriginalCards) % totalOriginalCards;
            const distance = Math.min(
                Math.abs(adjustedIndex - ((currentIndex % totalOriginalCards + totalOriginalCards) % totalOriginalCards)),
                totalOriginalCards - Math.abs(adjustedIndex - ((currentIndex % totalOriginalCards + totalOriginalCards) % totalOriginalCards))
            );
            if (distance === 0 && !card.classList.contains("zoomed")) {
                card.classList.add("active");
            } else if (distance === 1) {
                card.classList.add("near");
            } else {
                card.classList.add("far");
            }
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle("active", index === ((currentIndex % totalOriginalCards + totalOriginalCards) % totalOriginalCards));
        });
    }

    // Start auto-sliding
    function startAutoSlide() {
        stopAutoSlide(); // Clear any existing interval
        autoSlideInterval = setInterval(() => {
            if (!zoomedCard) {
                currentIndex++;
                updateSlider();
            }
        }, autoSlideDelay);
    }

    // Stop auto-sliding
    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    // Click event to zoom/unzoom cards
    allCards.forEach((card, index) => {
        card.addEventListener("click", () => {
            const actualIndex = index - clonesPerSide; // Index in full set (including clones)
            const adjustedIndex = ((index - clonesPerSide) % originalCards.length + originalCards.length) % originalCards.length;

            if (zoomedCard === card) {
                // Unzoom
                card.classList.remove("zoomed");
                zoomedCard = null;
                startAutoSlide();
                updateSlider(true, adjustedIndex);
            } else {
                // Zoom
                if (zoomedCard) {
                    zoomedCard.classList.remove("zoomed");
                }
                card.classList.add("zoomed");
                zoomedCard = card;
                stopAutoSlide();
                updateSlider(true, actualIndex);
            }
        });
    });

    // Next button
    nextArrow.addEventListener("click", () => {
        if (zoomedCard) {
            zoomedCard.classList.remove("zoomed");
            zoomedCard = null;
            startAutoSlide();
        }
        currentIndex++;
        updateSlider();
    });

    // Previous button
    prevArrow.addEventListener("click", () => {
        if (zoomedCard) {
            zoomedCard.classList.remove("zoomed");
            zoomedCard = null;
            startAutoSlide();
        }
        currentIndex--;
        updateSlider();
    });

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            if (zoomedCard) {
                zoomedCard.classList.remove("zoomed");
                zoomedCard = null;
                startAutoSlide();
            }
            currentIndex = index;
            updateSlider();
        });
    });

    // Pause auto-slide on hover
    sliderWrapper.addEventListener("mouseenter", stopAutoSlide);
    sliderWrapper.addEventListener("mouseleave", () => {
        if (!zoomedCard) startAutoSlide();
    });

    // Initial setup
    updateSlider(false);
    startAutoSlide();

    // Recalculate on window resize
    window.addEventListener("resize", () => {
        updateSlider(false);
    });
});

// Dynamically populate birthdate fields and form validation
document.addEventListener('DOMContentLoaded', () => {
    const birthDaySelect = document.querySelector('.trainee-birth-day');
    const birthYearSelect = document.querySelector('.trainee-birth-year');

    // Populate days (1 to 31)
    for (let day = 1; day <= 31; day++) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = day;
        birthDaySelect.appendChild(option);
    }

    // Populate years (current year to 1900)
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1900; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        birthYearSelect.appendChild(option);
    }

    const form = document.getElementById('trainee-progress-form');
    const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
    const termsCheckbox = form.querySelector('input[name="terms"]');

    // Function to validate the form
    const validateForm = () => {
        let isValid = true;
        let firstEmptyField = null;

        if (termsCheckbox && !termsCheckbox.checked) {
            termsCheckbox.parentElement.classList.add('highlight-error');
            isValid = false;
            if (!firstEmptyField) {
                firstEmptyField = termsCheckbox;
            }
        }

        if (firstEmptyField) {
            firstEmptyField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        return isValid;
    };

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (validateForm()) {
            alert('Form submitted successfully!');
            console.log('Form submitted successfully!');
            form.reset();
            removeHighlights();
        }
    });
});