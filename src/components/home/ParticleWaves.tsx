"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ParticleWaves = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const particlesRef = useRef<THREE.Sprite[]>([]);
  const materialRef = useRef<THREE.SpriteMaterial | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const density = 50;
  const speed = 0.1;
  const amplitude = 50;
  const separation = 100;
  const particleColor = '#735FE9'; // Keep AIMNIS primary color, but exactly same look
  
  const countRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const windowHalfRef = useRef({ x: 0, y: 0 });

  const createParticleMaterial = (color: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    
    if (context) {
      context.clearRect(0, 0, 32, 32);

      // 보라색 단색 — AIMNIS primary purple
      const gradient = context.createRadialGradient(16, 16, 2, 16, 16, 12);
      gradient.addColorStop(0, '#a78bfa'); // violet-400 (밝은 보라)
      gradient.addColorStop(1, '#7c3aed'); // violet-600 (기본 보라)

      context.fillStyle = gradient;
      context.beginPath();
      context.arc(16, 16, 12, 0, Math.PI * 2, true);
      context.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    return new THREE.SpriteMaterial({
      map: texture,
      transparent: true
    });
  };

  const recreateParticles = () => {
    if (!sceneRef.current || !materialRef.current) return;
    
    particlesRef.current.forEach(particle => sceneRef.current?.remove(particle));
    particlesRef.current = [];
    
    for (let ix = 0; ix < density; ix++) {
      for (let iy = 0; iy < density; iy++) {
        const particle = new THREE.Sprite(materialRef.current);
        particle.position.x = ix * separation - ((density * separation) / 2);
        particle.position.z = iy * separation - ((density * separation) / 2);
        particle.position.y = -400;
        particle.scale.setScalar(10);
        
        particlesRef.current.push(particle);
        sceneRef.current.add(particle);
      }
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    mouseRef.current.x = event.clientX - windowHalfRef.current.x;
    mouseRef.current.y = event.clientY - windowHalfRef.current.y;
  };

  const handleResize = () => {
    if (!cameraRef.current || !rendererRef.current) return;
    
    windowHalfRef.current.x = window.innerWidth / 2;
    windowHalfRef.current.y = window.innerHeight / 2;
    cameraRef.current.aspect = window.innerWidth / window.innerHeight;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
  };

  const animate = () => {
    if (!cameraRef.current || !rendererRef.current || !sceneRef.current) return;
    
    animationRef.current = requestAnimationFrame(animate);
    
    // Update camera exactly like original source
    cameraRef.current.position.x += (mouseRef.current.x - cameraRef.current.position.x) * 0.05;
    cameraRef.current.position.y += (-mouseRef.current.y - cameraRef.current.position.y) * 0.05;
    cameraRef.current.lookAt(sceneRef.current.position);
    
    // Update particles exactly like original source
    let i = 0;
    for (let ix = 0; ix < density; ix++) {
      for (let iy = 0; iy < density; iy++) {
        if (i < particlesRef.current.length) {
          const particle = particlesRef.current[i++];
          
          particle.position.y = -400 + 
            (Math.sin((ix + countRef.current) * 0.3) * amplitude) + 
            (Math.sin((iy + countRef.current) * 0.5) * amplitude);
          
          const scale = (Math.sin((ix + countRef.current) * 0.3) + 1) * 2 + 
                       (Math.sin((iy + countRef.current) * 0.5) + 1) * 2;
          particle.scale.setScalar(scale * 2);
        }
      }
    }
    
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    countRef.current += speed;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    windowHalfRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;
    camera.position.y = 800; // Drops to near 0 instantly via animate, giving original feel
    cameraRef.current = camera;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Keep transparent bg
    rendererRef.current = renderer;

    containerRef.current.appendChild(renderer.domElement);

    materialRef.current = createParticleMaterial(particleColor);
    recreateParticles();

    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      particlesRef.current.forEach(p => p.material.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-0 pointer-events-none opacity-80"
    />
  );
};

export default ParticleWaves;
