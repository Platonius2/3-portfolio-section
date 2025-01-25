$(function(){
  'use strict';
  
  // Initialize enhanced tilt effect
  $('.card').tilt({
    maxTilt: 15,
    perspective: 1500,
    scale: 1.05,
    speed: 1000,
    glare: true,
    maxGlare: 0.3,
    easing: "cubic-bezier(.03,.98,.52,.99)",
    transition: true
  });

  // Initialize Intersection Observer for scroll animations
  const cards = document.querySelectorAll('.card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('appear');
        observer.unobserve(entry.target); // Stop observing once animation is triggered
      }
    });
  }, {
    threshold: 0.1, // Trigger when at least 10% of the card is visible
    rootMargin: '50px' // Start animation slightly before the card comes into view
  });

  cards.forEach(card => {
    observer.observe(card);
  });
});