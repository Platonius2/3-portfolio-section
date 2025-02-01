import * as THREE from 'three';
import { config, getResponsiveConfig, animationVars } from './config.js';

// Check if GSAP plugins are available
const hasBezierPlugin = gsap && gsap.plugins && gsap.plugins.BezierPlugin;
const hasGSAPCore = typeof gsap !== 'undefined';

if (hasGSAPCore && !hasBezierPlugin) {
    console.warn('GSAP BezierPlugin not found. Using fallback animation.');
}

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = new THREE.BufferGeometry();
        this.positions = new Float32Array(config.particleCount * 3);
        this.scales = new Float32Array(config.particleCount);
        this.setupParticles();
        this.setupResizeHandler();
    }

    setupParticles() {
        // Initialize all particles at origin with zero scale
        for (let i = 0; i < config.particleCount; i++) {
            const i3 = i * 3;
            this.positions[i3] = 0;     // x
            this.positions[i3 + 1] = 0; // y
            this.positions[i3 + 2] = 0; // z
            this.scales[i] = 0;         // start invisible
        }

        this.particles.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.particles.setAttribute('scale', new THREE.BufferAttribute(this.scales, 1));

        // Create shader material for scale support
        const pMaterial = new THREE.ShaderMaterial({
            uniforms: {
                size: { value: config.particleSize },
                color: { value: new THREE.Color(0xFFFFFF) },
                opacity: { value: 0.8 }
            },
            vertexShader: `
                attribute float scale;
                uniform float size;
                
                void main() {
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * scale * (2000.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform float opacity;
                
                void main() {
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    
                    if (dist > 0.5) {
                        discard;
                    }
                    
                    float core = smoothstep(0.15, 0.0, dist);
                    float edge = smoothstep(0.5, 0.15, dist);
                    float intensity = core + edge * 0.3;
                    
                    float alpha = intensity * opacity;
                    if (alpha < 0.01) discard;
                    
                    vec3 finalColor = color * (1.0 + core * 0.2);
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.CustomBlending,
            blendEquation: THREE.AddEquation,
            blendSrc: THREE.SrcAlphaFactor,
            blendDst: THREE.OneMinusSrcAlphaFactor,
            depthWrite: false,
            depthTest: true
        });

        this.system = new THREE.Points(this.particles, pMaterial);
        this.system.sortParticles = false;
        this.scene.add(this.system);
    }

    createVertices(emptyArray, points) {
        if (!points || points.length === 0) return null;
        
        const positions = new Float32Array(config.particleCount * 3);
        const scales = new Float32Array(config.particleCount);
        
        for (let i = 0; i < config.particleCount && i < points.length; i++) {
            const i3 = i * 3;
            if (points[i]) {
                positions[i3] = points[i].x || 0;
                positions[i3 + 1] = points[i].y || 0;
                positions[i3 + 2] = points[i].z || 0;
                scales[i] = 1;  // visible when positioned
            }
        }
        
        emptyArray.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        emptyArray.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
        return true;
    }

    morphTo(newParticles, color = '#FFFFFF') {
        if (!newParticles || !newParticles.attributes || !newParticles.attributes.position || !newParticles.attributes.scale) return;
        
        // Speed up rotation during morph
        if (hasGSAPCore) {
            gsap.to(animationVars, {
                duration: 0.1,
                ease: "power4.in",
                speed: config.morphAnimationSpeed / 100,
                onComplete: () => this.slowDown()
            });

            // Change color
            gsap.to(animationVars, {
                duration: 1,
                ease: "none",
                color: color
            });
        }

        // Morph particles with scale and animation
        const positions = this.particles.attributes.position.array;
        const scales = this.particles.attributes.scale.array;
        const newPositions = newParticles.attributes.position.array;
        const newScales = newParticles.attributes.scale.array;
        
        for (let i = 0; i < positions.length / 3; i++) {
            const i3 = i * 3;
            const currentVertex = {
                x: positions[i3],
                y: positions[i3 + 1],
                z: positions[i3 + 2],
                scale: scales[i]
            };

            const targetVertex = {
                x: newPositions[i3],
                y: newPositions[i3 + 1],
                z: newPositions[i3 + 2],
                scale: newScales[i]
            };

            // Calculate animation parameters
            const dx = targetVertex.x - currentVertex.x;
            const dy = targetVertex.y - currentVertex.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const radius = distance * 0.8;
            const delay = Math.random() * 0.2;
            const duration = 1.0 + Math.random() * 0.25;

            if (hasGSAPCore) {
                if (hasBezierPlugin) {
                    // Use bezier animation if plugin is available
                    gsap.to(currentVertex, {
                        duration: duration,
                        ease: "power1.inOut",
                        scale: targetVertex.scale,
                        delay: delay,
                        bezier: {
                            type: "thru",
                            curviness: 1,
                            values: [
                                { x: currentVertex.x, y: currentVertex.y, z: currentVertex.z },
                                { 
                                    x: currentVertex.x + (dx * 0.25) + (Math.random() - 0.5) * (radius * 0.2),
                                    y: currentVertex.y + (dy * 0.25) + Math.sin(Math.PI * 0.25) * radius,
                                    z: currentVertex.z + Math.cos(Math.PI * 0.25) * (radius * 0.5)
                                },
                                { 
                                    x: currentVertex.x + (dx * 0.5) + (Math.random() - 0.5) * (radius * 0.2),
                                    y: currentVertex.y + (dy * 0.5) + Math.sin(Math.PI * 0.5) * radius,
                                    z: currentVertex.z + Math.cos(Math.PI * 0.5) * (radius * 0.5)
                                },
                                { 
                                    x: currentVertex.x + (dx * 0.75) + (Math.random() - 0.5) * (radius * 0.2),
                                    y: currentVertex.y + (dy * 0.75) + Math.sin(Math.PI * 0.75) * radius,
                                    z: currentVertex.z + Math.cos(Math.PI * 0.75) * (radius * 0.5)
                                },
                                { x: targetVertex.x, y: targetVertex.y, z: targetVertex.z }
                            ]
                        },
                        onUpdate: () => this.updateParticle(i3, currentVertex, positions, scales)
                    });
                } else {
                    // Fallback to simple animation if plugin isn't available
                    gsap.to(currentVertex, {
                        duration: duration,
                        ease: "power1.inOut",
                        x: targetVertex.x,
                        y: targetVertex.y,
                        z: targetVertex.z,
                        scale: targetVertex.scale,
                        delay: delay,
                        onUpdate: () => this.updateParticle(i3, currentVertex, positions, scales)
                    });
                }
            }
        }

        // Camera rotation
        if (hasGSAPCore) {
            gsap.to(animationVars, {
                duration: 1,
                ease: "power1.inOut",
                rotation: animationVars.rotation === 45 ? -45 : 45
            });
        }
    }

    updateParticle(i3, vertex, positions, scales) {
        positions[i3] = vertex.x;
        positions[i3 + 1] = vertex.y;
        positions[i3 + 2] = vertex.z;
        scales[i3 / 3] = vertex.scale;
        this.particles.attributes.position.needsUpdate = true;
        this.particles.attributes.scale.needsUpdate = true;
    }

    slowDown() {
        gsap.to(animationVars, {
            duration: 0.3,
            ease: "power2.out",
            speed: config.defaultAnimationSpeed / 100,
            delay: 0.2
        });
    }

    update() {
        if (this.system && this.system.material) {
            this.system.material.uniforms.color.value.set(animationVars.color);
        }
    }

    setupResizeHandler() {
        window.addEventListener('resize', () => {
            const newConfig = getResponsiveConfig();
            if (this.system && this.system.material) {
                this.system.material.uniforms.size.value = newConfig.particleSize;
            }
        });
    }
} 