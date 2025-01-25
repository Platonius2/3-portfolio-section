import { config } from './config.js';

export class SceneManager {
    constructor() {
        this.setupRenderer();
        this.setupScene();
        this.setupCamera();
        this.setupLighting();
        this.setupPostProcessing();
        this.setupResizeHandler();
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            premultipliedAlpha: false
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.NoToneMapping;
        this.renderer.setClearColor(0x000000, 0);
        document.querySelector('.canvas-container').appendChild(this.renderer.domElement);
    }

    setupScene() {
        this.scene = new THREE.Scene();
    }

    setupCamera() {
        // Adjust FOV based on screen aspect ratio
        const aspectRatio = window.innerWidth / window.innerHeight;
        const baseFOV = 45;
        const fov = aspectRatio < 1 ? baseFOV * 1.5 : baseFOV; // Increase FOV for portrait mode
        const near = 1;
        const far = 10000;
        
        this.camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
        
        // Calculate camera distance based on screen size and aspect ratio
        const baseDistance = Math.max(
            100,
            (window.innerHeight / 2) * (aspectRatio < 1 ? 1.2 : 1)
        );
        this.camera.position.z = baseDistance;
        
        this.camera.lookAt(this.scene.position);
    }

    setupLighting() {
        const light = new THREE.AmbientLight(0xFFFFFF, 1);
        this.scene.add(light);
    }

    setupPostProcessing() {
        this.composer = new THREE.EffectComposer(this.renderer);
        
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.2,    // Increased base bloom intensity
            0.35,   // Slightly reduced radius for better definition
            0.15    // Lower threshold to catch more of the cyan
        );

        // Fine-tune bloom parameters
        bloomPass.threshold = 0.12;     // Lower threshold to catch more particles
        bloomPass.strength = 1.4;       // Increased strength for better visibility
        bloomPass.radius = 0.75;        // Slightly tighter radius for definition
        bloomPass.exposure = 0.9;       // Slightly increased exposure

        this.composer.addPass(bloomPass);
    }

    setupResizeHandler() {
        window.addEventListener('resize', () => this.handleResize(), false);
    }

    handleResize() {
        const aspectRatio = window.innerWidth / window.innerHeight;
        const baseFOV = 45;
        
        this.camera.fov = aspectRatio < 1 ? baseFOV * 1.5 : baseFOV;
        this.camera.aspect = aspectRatio;
        
        const baseDistance = Math.max(
            100,
            (window.innerHeight / 2) * (aspectRatio < 1 ? 1.2 : 1)
        );
        this.camera.position.z = baseDistance;
        
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.composer.render();
    }
} 