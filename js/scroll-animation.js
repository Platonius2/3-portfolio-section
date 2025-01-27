export class ScrollAnimation {
    constructor(textManager) {
        this.textManager = textManager;
        this.lastScrollTime = 0;
        this.scrollThreshold = 500; // ms between scroll transitions
        this.isLocked = true; // Start with scroll locked
        this.setupScrollHandler();
        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        const options = {
            threshold: 0.2,
            rootMargin: "0px 0px -100px 0px"
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const section = entry.target;
                    this.animateSection(section);
                }
            });
        }, options);

        // Observe all sections
        document.querySelectorAll('.section').forEach(section => {
            observer.observe(section);
        });
    }

    animateSection(section) {
        const elements = section.querySelectorAll('.appear, .appear-left, .appear-right, .appear-scale');
        elements.forEach((el, i) => {
            setTimeout(() => {
                el.classList.add('active');
            }, i * 100); // Stagger animations by 100ms
        });
    }

    setupScrollHandler() {
        // Prevent default scroll and handle manually
        window.addEventListener('wheel', (e) => {
            if (this.isLocked) {
                e.preventDefault();
                
                const now = Date.now();
                if (now - this.lastScrollTime < this.scrollThreshold) return;

                const scrollingDown = e.deltaY > 0;
                
                if (scrollingDown && this.textManager.currentIndex < 2) {
                    this.textManager.currentIndex++;
                    this.textManager.updateActiveText(this.textManager.currentIndex);
                    this.lastScrollTime = now;
                    
                    if (this.textManager.currentIndex === 2) {
                        this.isLocked = false;
                    }
                } else if (!scrollingDown && this.textManager.currentIndex > 0) {
                    this.textManager.currentIndex--;
                    this.textManager.updateActiveText(this.textManager.currentIndex);
                    this.lastScrollTime = now;
                }
            }
        }, { passive: false });

        // Handle touch events for mobile
        let touchStartY = 0;
        let lastTouchY = 0;
        
        window.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            lastTouchY = touchStartY;
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (this.isLocked) {
                e.preventDefault();
                
                const touchY = e.touches[0].clientY;
                const deltaY = lastTouchY - touchY;
                const scrollingDown = deltaY > 0;
                
                const now = Date.now();
                if (now - this.lastScrollTime < this.scrollThreshold) return;

                if (Math.abs(deltaY) > 5) { // Add a small threshold for touch movement
                    if (scrollingDown && this.textManager.currentIndex < 2) {
                        this.textManager.currentIndex++;
                        this.textManager.updateActiveText(this.textManager.currentIndex);
                        this.lastScrollTime = now;
                        
                        if (this.textManager.currentIndex === 2) {
                            this.isLocked = false;
                        }
                    } else if (!scrollingDown && this.textManager.currentIndex > 0) {
                        this.textManager.currentIndex--;
                        this.textManager.updateActiveText(this.textManager.currentIndex);
                        this.lastScrollTime = now;
                    }
                }
            }
            
            lastTouchY = touchY;
        }, { passive: false });
    }
} 