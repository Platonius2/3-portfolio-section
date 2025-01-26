import { NeatGradient } from "./node_modules/@firecms/neat/dist/index.es.js";

// Define your config
const config = {
    colors: [
        {
            color: '#1E1E1E',
            enabled: true,
        },
        {
            color: '#2C2C2C',
            enabled: true,
        },
        {
            color: '#000000',
            enabled: true,
        },
        {
            color: '#333333',
            enabled: true,
        },
        {
            color: '#1A1A1A',
            enabled: true,
        },
    ],
    speed: 1,
    horizontalPressure: 5,
    verticalPressure: 5,
    waveFrequencyX: 2,
    waveFrequencyY: 2,
    waveAmplitude: 10,
    shadows: 5,
    highlights: 5,
    colorBrightness: 1.2,
    colorSaturation: 1.2,
    wireframe: false,
    colorBlending: 10,
    backgroundColor: '#000000',
    backgroundAlpha: 1,
    grainScale: 1.5,
    grainSparsity: 0.2,
    grainIntensity: 0.2,
    grainSpeed: 1,
    resolution: 1,
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
const maxSpeed = 5;

// Update animation based on scroll
window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    scrollSpeed = Math.abs(currentScrollY - lastScrollY);
    lastScrollY = currentScrollY;
    
    neat.speed = Math.min(scrollSpeed, maxSpeed);
    
    clearTimeout(window.scrollTimeout);
    window.scrollTimeout = setTimeout(() => {
        neat.speed = 1;
    }, 150);
}); 