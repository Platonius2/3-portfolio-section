import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { TextManager } from './TextManager.js';

export class ThreeSection {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.composer = null;
        this.textManager = null;
        this.animationFrame = null;
        this.clock = new THREE.Clock();
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        document.querySelector('.three-section').appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.z = 5;

        // Setup post-processing
        this.setupPostProcessing();

        // Initialize text manager
        this.textManager = new TextManager(this.scene, this.camera);
        await this.textManager.loadFont('./public/fonts/helvetiker_regular.typeface.json');

        // Create text
        this.createText();

        // Setup resize handler
        window.addEventListener('resize', this.handleResize.bind(this));

        this.isInitialized = true;
        this.animate();
    }

    setupPostProcessing() {
        this.composer = new EffectComposer(this.renderer);
        
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5,  // strength
            0.4,  // radius
            0.85  // threshold
        );
        this.composer.addPass(bloomPass);
    }

    createText() {
        const texts = [
            { text: 'FAST', position: { x: 0, y: 1, z: 0 }, color: 0x00ff00 },
            { text: 'FORWARD', position: { x: 0, y: -1, z: 0 }, color: 0x00ff00 }
        ];

        texts.forEach(({ text, position, color }) => {
            this.textManager.createText(text, position, {
                size: 1,
                height: 0.2,
                color
            });
        });
    }

    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
    }

    animate() {
        const delta = this.clock.getElapsedTime();

        // Animate particles
        if (this.textManager) {
            this.textManager.animateParticles(delta);
        }

        // Render scene with post-processing
        this.composer.render();

        this.animationFrame = requestAnimationFrame(this.animate.bind(this));
    }

    dispose() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        if (this.textManager) {
            this.textManager.dispose();
        }

        this.scene.traverse((object) => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });

        this.renderer.dispose();
        this.composer.dispose();

        window.removeEventListener('resize', this.handleResize.bind(this));
    }
} 