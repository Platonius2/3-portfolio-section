export class ScrollAnimation {
    constructor(textManager) {
        this.textManager = textManager;
        this.lastScrollTime = 0;
        this.scrollThreshold = 500; // ms between scroll transitions
        this.isLocked = true; // Start with scroll locked
        this.setupScrollHandler();
    }

    setupScrollHandler() {
        // Prevent default scroll and handle manually
        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            const now = Date.now();
            if (now - this.lastScrollTime < this.scrollThreshold) return;

            const scrollingDown = e.deltaY > 0;
            
            if (scrollingDown && this.textManager.currentIndex < 2) {
                this.textManager.currentIndex++;
                this.textManager.updateActiveText(this.textManager.currentIndex);
                this.lastScrollTime = now;
                
                // Unlock scroll when reaching the last word
                if (this.textManager.currentIndex === 2) {
                    this.isLocked = false;
                }
            } else if (!scrollingDown && this.textManager.currentIndex > 0) {
                // Lock scroll when going back up
                this.isLocked = true;
                this.textManager.currentIndex--;
                this.textManager.updateActiveText(this.textManager.currentIndex);
                this.lastScrollTime = now;
            } else if (!this.isLocked) {
                // Allow normal scrolling only after last word
                window.scrollBy(0, e.deltaY);
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
            const touchY = e.touches[0].clientY;
            const deltaY = lastTouchY - touchY;
            const scrollingDown = deltaY > 0;
            
            if (this.isLocked) {
                e.preventDefault();
                
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
                        this.isLocked = true;
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