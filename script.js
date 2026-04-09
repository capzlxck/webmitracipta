    (function() {
        // Slideshow otomatis + geser manual (tanpa dependensi eksternal)
        const slidesContainer = document.getElementById('carouselSlides');
        const slides = Array.from(document.querySelectorAll('.slide'));
        const dotsContainer = document.getElementById('carouselDots');
        let autoInterval = null;
        let currentIndex = 0;
        let isDragging = false;
        let startX = 0;
        let scrollLeft = 0;
        let autoPlayEnabled = true;

        function createDots() {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = '';
            slides.forEach((_, idx) => {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                if (idx === currentIndex) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    if (autoInterval) clearInterval(autoInterval);
                    goToSlide(idx);
                    resetAutoPlay();
                });
                dotsContainer.appendChild(dot);
            });
        }

        function updateDots() {
            const dots = document.querySelectorAll('.dot');
            dots.forEach((dot, idx) => {
                if (idx === currentIndex) dot.classList.add('active');
                else dot.classList.remove('active');
            });
        }

        function goToSlide(index) {
            if (!slidesContainer) return;
            if (index < 0) index = 0;
            if (index >= slides.length) index = slides.length - 1;
            const slideWidth = slidesContainer.clientWidth;
            if (slideWidth > 0) {
                slidesContainer.scrollTo({
                    left: index * slideWidth,
                    behavior: 'smooth'
                });
            }
            currentIndex = index;
            updateDots();
        }

        function getCurrentIndexFromScroll() {
            if (!slidesContainer) return 0;
            const scrollPos = slidesContainer.scrollLeft;
            const containerWidth = slidesContainer.clientWidth;
            if (containerWidth === 0) return 0;
            const approximateIndex = Math.round(scrollPos / containerWidth);
            return Math.min(Math.max(approximateIndex, 0), slides.length - 1);
        }

        function onScrollHandler() {
            if (!autoPlayEnabled) return;
            const newIndex = getCurrentIndexFromScroll();
            if (newIndex !== currentIndex) {
                currentIndex = newIndex;
                updateDots();
                resetAutoPlay();
            }
        }

        function startAutoSlide() {
            if (autoInterval) clearInterval(autoInterval);
            autoInterval = setInterval(() => {
                if (!autoPlayEnabled) return;
                let nextIndex = currentIndex + 1;
                if (nextIndex >= slides.length) nextIndex = 0;
                goToSlide(nextIndex);
            }, 5000);
        }

        function resetAutoPlay() {
            if (autoInterval) {
                clearInterval(autoInterval);
                startAutoSlide();
            }
        }

        function initDragScroll() {
            if (!slidesContainer) return;
            slidesContainer.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.pageX - slidesContainer.offsetLeft;
                scrollLeft = slidesContainer.scrollLeft;
                slidesContainer.style.cursor = 'grabbing';
                autoPlayEnabled = false;
                if (autoInterval) clearInterval(autoInterval);
            });
            window.addEventListener('mouseup', () => {
                if (!isDragging) return;
                isDragging = false;
                slidesContainer.style.cursor = 'grab';
                const newIdx = getCurrentIndexFromScroll();
                currentIndex = newIdx;
                updateDots();
                autoPlayEnabled = true;
                startAutoSlide();
            });
            slidesContainer.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
                const x = e.pageX - slidesContainer.offsetLeft;
                const walk = (x - startX) * 1.5;
                slidesContainer.scrollLeft = scrollLeft - walk;
            });
            slidesContainer.addEventListener('touchstart', (e) => {
                autoPlayEnabled = false;
                if (autoInterval) clearInterval(autoInterval);
            });
            slidesContainer.addEventListener('touchend', () => {
                setTimeout(() => {
                    const newIdx = getCurrentIndexFromScroll();
                    currentIndex = newIdx;
                    updateDots();
                    autoPlayEnabled = true;
                    startAutoSlide();
                }, 100);
            });
        }

        function ensureScrollSnapOnResize() {
            let resizeTimer;
            window.addEventListener('resize', () => {
                if (resizeTimer) clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    if (slidesContainer) {
                        const correctIndex = currentIndex;
                        const slideWidth = slidesContainer.clientWidth;
                        if (slideWidth > 0) {
                            slidesContainer.scrollTo({
                                left: correctIndex * slideWidth,
                                behavior: 'auto'
                            });
                        }
                    }
                }, 150);
            });
        }

        function init() {
            createDots();
            setTimeout(() => {
                if (slidesContainer) {
                    slidesContainer.scrollLeft = 0;
                    currentIndex = 0;
                    updateDots();
                    slidesContainer.addEventListener('scroll', onScrollHandler);
                    startAutoSlide();
                    slidesContainer.style.cursor = 'grab';
                }
            }, 100);
            initDragScroll();
            ensureScrollSnapOnResize();
        }

        init();
    })();