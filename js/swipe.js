export class SwipeHandler {
  constructor(element, callbacks) {
    this.element = element;
    this.callbacks = callbacks;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
    this.minSwipeDistance = 50;
    
    this.init();
  }
  
  init() {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
  }
  
  handleTouchStart(e) {
    this.touchStartX = e.changedTouches[0].screenX;
    this.touchStartY = e.changedTouches[0].screenY;
  }
  
  handleTouchMove(e) {
    // Prevent default scrolling if swiping horizontally
    const currentX = e.changedTouches[0].screenX;
    const currentY = e.changedTouches[0].screenY;
    const diffX = Math.abs(currentX - this.touchStartX);
    const diffY = Math.abs(currentY - this.touchStartY);
    
    if (diffX > diffY && diffX > 10) {
      e.preventDefault();
    }
  }
  
  handleTouchEnd(e) {
    this.touchEndX = e.changedTouches[0].screenX;
    this.touchEndY = e.changedTouches[0].screenY;
    this.handleSwipe();
  }
  
  handleSwipe() {
    const diffX = this.touchEndX - this.touchStartX;
    const diffY = this.touchEndY - this.touchStartY;
    const absDiffX = Math.abs(diffX);
    const absDiffY = Math.abs(diffY);
    
    // Only consider horizontal swipes
    if (absDiffX > absDiffY && absDiffX > this.minSwipeDistance) {
      if (diffX > 0) {
        this.callbacks.onSwipeRight?.();
      } else {
        this.callbacks.onSwipeLeft?.();
      }
    }
  }
}

export function enableSwipeGestures(sidebar, overlay, menuToggle) {
  // Swipe on sidebar to close
  new SwipeHandler(sidebar, {
    onSwipeLeft: () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
  
  // Swipe on main content to open sidebar
  const main = document.querySelector('.main');
  new SwipeHandler(main, {
    onSwipeRight: () => {
      if (window.innerWidth <= 768 && !sidebar.classList.contains('active')) {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
      }
    }
  });
}