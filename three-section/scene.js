import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
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
            premultipliedAlpha: false,
            stencil: false,
            depth: true,
            powerPreference: "high-performance",
            preserveDrawingBuffer: false
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.NoToneMapping;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.autoClear = true;
        this.renderer.autoClearColor = true;
        this.renderer.autoClearDepth = true;
        
        const container = document.querySelector('.canvas-container');
        container.appendChild(this.renderer.domElement);
        
        // Set canvas style for transparency
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.pointerEvents = 'none';
        this.renderer.domElement.style.mixBlendMode = 'screen';
        this.renderer.domElement.style.background = 'transparent';
        
        // Clear any background color on the container
        container.style.background = 'transparent';
        container.style.backgroundColor = 'transparent';
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = null;
        this.scene.fog = null;
    }

    setupCamera() {
        const aspectRatio = window.innerWidth / window.innerHeight;
        const baseFOV = 45;
        const fov = aspectRatio < 1 ? baseFOV * 1.5 : baseFOV;
        const near = 1;
        const far = 10000;
        
        this.camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
        
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
        const renderTarget = new THREE.WebGLRenderTarget(
            window.innerWidth, 
            window.innerHeight, 
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                encoding: THREE.sRGBEncoding,
                type: THREE.HalfFloatType,
                stencilBuffer: false,
                depthBuffer: true,
                alpha: true,
                premultiplyAlpha: false
            }
        );

        this.composer = new EffectComposer(this.renderer, renderTarget);
        this.composer.renderToScreen = true;
        
        const renderPass = new RenderPass(this.scene, this.camera);
        renderPass.clear = true;
        renderPass.clearDepth = true;
        renderPass.clearAlpha = true;
        renderPass.clearColor = new THREE.Color(0x000000);
        renderPass.clearAlpha = 0;
        this.composer.addPass(renderPass);

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.5,
            0.4,
            0.85
        );

        bloomPass.threshold = 0.05;
        bloomPass.strength = 0.8;
        bloomPass.radius = 1.5;
        bloomPass.exposure = 0.6;
        bloomPass.clear = true;
        bloomPass.clearAlpha = true;
        bloomPass.renderToScreen = true;

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
        // Clear with specific buffers
        this.renderer.clear(true, true, true);
        
        // Ensure scene is transparent
        this.scene.background = null;
        this.renderer.setClearColor(0x000000, 0);
        
        // Render with composer
        this.composer.render();
    }
} 