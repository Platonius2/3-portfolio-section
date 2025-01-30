import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

export class TextManager {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.font = null;
        this.particles = [];
        this.texts = [];
        this.textMeshes = new Map();
        this.particleGroups = new Map();
    }

    async loadFont(fontPath) {
        return new Promise((resolve, reject) => {
            const loader = new FontLoader();
            loader.load(fontPath, (font) => {
                this.font = font;
                resolve(font);
            }, undefined, reject);
        });
    }

    createText(text, position = { x: 0, y: 0, z: 0 }, options = {}) {
        const {
            size = 0.5,
            height = 0.2,
            curveSegments = 12,
            bevelEnabled = true,
            bevelThickness = 0.03,
            bevelSize = 0.02,
            bevelOffset = 0,
            bevelSegments = 5,
            color = 0xffffff
        } = options;

        if (!this.font) {
            console.error('Font not loaded');
            return;
        }

        const geometry = new TextGeometry(text, {
            font: this.font,
            size,
            height,
            curveSegments,
            bevelEnabled,
            bevelThickness,
            bevelSize,
            bevelOffset,
            bevelSegments
        });

        geometry.computeBoundingBox();
        geometry.center();

        const material = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position.x, position.y, position.z);
        this.scene.add(mesh);
        this.textMeshes.set(text, mesh);

        // Create particles
        const particles = this.createParticlesFromGeometry(geometry, color);
        this.particleGroups.set(text, particles);
        
        return { mesh, particles };
    }

    createParticlesFromGeometry(geometry, color) {
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 10000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const tempGeometry = geometry.clone();
        const tempMesh = new THREE.Mesh(tempGeometry);
        const box = new THREE.Box3().setFromObject(tempMesh);
        const size = box.getSize(new THREE.Vector3());

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * size.x * 3;
            positions[i * 3 + 1] = (Math.random() - 0.5) * size.y * 3;
            positions[i * 3 + 2] = (Math.random() - 0.5) * size.z * 3;

            const colorRGB = new THREE.Color(color);
            colors[i * 3] = colorRGB.r;
            colors[i * 3 + 1] = colorRGB.g;
            colors[i * 3 + 2] = colorRGB.b;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.02,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });

        const particleSystem = new THREE.Points(particlesGeometry, particleMaterial);
        this.scene.add(particleSystem);
        
        return particleSystem;
    }

    animateParticles(delta) {
        this.particleGroups.forEach((particles) => {
            const positions = particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += Math.sin(delta + i) * 0.001;
                positions[i + 1] += Math.cos(delta + i) * 0.001;
                positions[i + 2] += Math.sin(delta + i) * 0.001;
            }
            particles.geometry.attributes.position.needsUpdate = true;
        });
    }

    dispose() {
        this.textMeshes.forEach((mesh) => {
            mesh.geometry.dispose();
            mesh.material.dispose();
            this.scene.remove(mesh);
        });

        this.particleGroups.forEach((particles) => {
            particles.geometry.dispose();
            particles.material.dispose();
            this.scene.remove(particles);
        });

        this.textMeshes.clear();
        this.particleGroups.clear();
    }
} 