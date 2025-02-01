function initializeScrolling() {
    // Wait for React root to be populated
    const waitForReactRoot = () => {
        // Get all sections including React sections
        const reactRoot = document.querySelector('#root');
        const nonReactSections = Array.from(document.querySelectorAll('.page-wrapper .section'));
        
        // If React root exists but its content isn't ready, wait and try again
        if (reactRoot && (!reactRoot.children.length || !reactRoot.firstElementChild)) {
            setTimeout(waitForReactRoot, 100);
            return;
        }

        // Get the React section if it exists
        const reactSection = reactRoot ? reactRoot.firstElementChild : null;
        
        // Combine all sections in the correct order
        const sections = nonReactSections.reduce((acc, section) => {
            if (section.classList.contains('three-section')) {
                acc.push(section);
            } else if (reactSection && !acc.includes(reactSection)) {
                acc.push(reactSection);
                acc.push(section);
            } else {
                acc.push(section);
            }
            return acc;
        }, []);

        const navDots = document.querySelectorAll('.section-nav button');
        let isScrolling = false;
        let currentSectionIndex = 0;
        let lastScrollTime = Date.now();
        const scrollThreshold = 100;

        // Ensure we have sections and nav dots before proceeding
        if (!sections.length || !navDots.length) {
            console.warn('Missing sections or navigation dots');
            return;
        }

        function updateActiveDot(index) {
            if (index >= 0 && index < navDots.length) {
                navDots.forEach(dot => dot.classList.remove('active'));
                navDots[index].classList.add('active');
                currentSectionIndex = index;
            }
        }

        function getCurrentSectionIndex() {
            const viewportMiddle = window.innerHeight / 2;
            let closest = { index: 0, distance: Infinity };

            sections.forEach((section, index) => {
                if (!section) return;
                const rect = section.getBoundingClientRect();
                const distance = Math.abs(rect.top + rect.height / 2 - viewportMiddle);
                if (distance < closest.distance) {
                    closest = { index, distance };
                }
            });

            return closest.index;
        }

        function smoothScrollToSection(index) {
            // Validate index and section existence
            if (isScrolling || index < 0 || index >= sections.length) {
                return;
            }

            const targetSection = sections[index];
            if (!targetSection || typeof targetSection.offsetTop !== 'number') {
                console.warn('Invalid target section');
                return;
            }
            
            isScrolling = true;
            const startPosition = window.scrollY;
            const targetPosition = targetSection.offsetTop;
            const startTime = performance.now();
            const duration = 1000;

            function easeInOutQuint(t) {
                return t < 0.5 
                    ? 16 * t * t * t * t * t 
                    : 1 - Math.pow(-2 * t + 2, 5) / 2;
            }

            function animate(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const easedProgress = easeInOutQuint(progress);
                const currentPosition = startPosition + (targetPosition - startPosition) * easedProgress;
                
                window.scrollTo({
                    top: currentPosition,
                    behavior: 'auto' // Use auto to prevent conflicts with smooth scrolling
                });
                
                updateActiveDot(index);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    setTimeout(() => {
                        isScrolling = false;
                        // Verify final position and update dot if needed
                        const finalIndex = getCurrentSectionIndex();
                        if (finalIndex !== index) {
                            updateActiveDot(finalIndex);
                        }
                    }, 100);
                }
            }

            requestAnimationFrame(animate);
        }

        // Handle navigation dot clicks
        navDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                if (!isScrolling && !document.querySelector('.overlay.active')) {
                    smoothScrollToSection(index);
                }
            });
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (isScrolling || document.querySelector('.overlay.active')) return;

            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const currentIndex = getCurrentSectionIndex();
                const direction = e.key === 'ArrowDown' ? 1 : -1;
                const newIndex = Math.max(0, Math.min(sections.length - 1, currentIndex + direction));
                
                if (newIndex !== currentIndex) {
                    smoothScrollToSection(newIndex);
                }
            }
        });

        // Handle wheel events with debounce
        let wheelTimeout;
        window.addEventListener('wheel', (e) => {
            const now = Date.now();
            if (isScrolling || document.querySelector('.overlay.active') || now - lastScrollTime < scrollThreshold) {
                e.preventDefault();
                return;
            }
            lastScrollTime = now;

            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(() => {
                const currentIndex = getCurrentSectionIndex();
                updateActiveDot(currentIndex);
            }, 150);

            const direction = e.deltaY > 0 ? 1 : -1;
            const currentIndex = getCurrentSectionIndex();
            const newIndex = Math.max(0, Math.min(sections.length - 1, currentIndex + direction));

            if (newIndex !== currentIndex) {
                e.preventDefault();
                smoothScrollToSection(newIndex);
            }
        }, { passive: false });

        // Initial dot update
        updateActiveDot(getCurrentSectionIndex());
    };

    // Start the initialization process
    waitForReactRoot();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScrolling);
} else {
    initializeScrolling();
} 