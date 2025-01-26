import { NeatGradient } from "./node_modules/@firecms/neat/dist/index.es.js";

// Define your config
const config = {
    colors: [
        {
            color: '#5E5E5E',
            enabled: true,
        },
        {
            color: '#03162D',
            enabled: true,
        },
        {
            color: '#000000',
            enabled: true,
        },
        {
            color: '#121212',
            enabled: true,
        },
        {
            color: '#02192B',
            enabled: true,
        },
    ],
    speed: 2,
    horizontalPressure: 3,
    verticalPressure: 5,
    waveFrequencyX: 3,
    waveFrequencyY: 5,
    waveAmplitude: 6,
    shadows: 3,
    highlights: 4,
    colorBrightness: 1,
    colorSaturation: 1,
    wireframe: false,
    colorBlending: 7,
    backgroundColor: '#003FFF',
    backgroundAlpha: 1,
    grainScale: 2,
    grainSparsity: 0.1,
    grainIntensity: 0.1,
    grainSpeed: 1.5,
    resolution: 0.35,
};

// Initialize the gradient
const neat = new NeatGradient({
    ref: document.getElementById("gradient"),
    ...config
});

// Create a long scrollable content
const content = document.createElement('div');
content.style.height = '500vh';
content.style.position = 'relative';
content.style.zIndex = '1';
document.body.appendChild(content);

let lastScrollY = window.scrollY;
let scrollSpeed = 0;
const maxSpeed = 10;

// Update animation based on scroll
window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    scrollSpeed = Math.abs(currentScrollY - lastScrollY);
    lastScrollY = currentScrollY;
    
    neat.speed = Math.min(scrollSpeed, maxSpeed);
    
    clearTimeout(window.scrollTimeout);
    window.scrollTimeout = setTimeout(() => {
        neat.speed = 0;
    }, 150);
}); 