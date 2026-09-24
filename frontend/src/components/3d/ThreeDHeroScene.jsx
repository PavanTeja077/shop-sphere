// frontend/src/components/3d/ThreeDHeroScene.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function ThreeDHeroSceneContent({ tiltX = 0, tiltY = 0, theme = 'cyber' }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const targetRotationRef = useRef({ x: 0, y: 0 });

  // Update target rotation from external motion sensors
  useEffect(() => {
    targetRotationRef.current = {
      x: tiltY * 0.8,
      y: tiltX * 0.9
    };
  }, [tiltX, tiltY]);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // 1. Scene, Camera & Renderer
    const width = currentMount.clientWidth || 500;
    const height = currentMount.clientHeight || 500;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 6.5;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    currentMount.appendChild(renderer.domElement);

    // Theme-based colors (Luxe Light vs Cyber Dark)
    const isLight = theme === 'light' || theme === 'graphite' || theme === 'vintage';

    const coreColor = isLight ? 0x0f172a : 0x0f172a;
    const coreEmissive = isLight ? 0x0d9488 : 0x14b8a6;
    const cageColor = isLight ? 0x0f172a : 0x2dd4bf;
    const ring1Color = isLight ? 0x0d9488 : 0x38bdf8;
    const ring2Color = isLight ? 0x64748b : 0xa855f7;

    // 2. Main 3D Crystal Core (Icosahedron)
    const coreGeometry = new THREE.IcosahedronGeometry(1.6, 1);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: coreColor,
      emissive: coreEmissive,
      emissiveIntensity: isLight ? 0.2 : 0.25,
      roughness: 0.1,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
      flatShading: true
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreMesh);

    // 3. Outer Holographic Wireframe Cage
    const cageGeometry = new THREE.IcosahedronGeometry(2.1, 1);
    const cageMaterial = new THREE.MeshStandardMaterial({
      color: cageColor,
      wireframe: true,
      transparent: true,
      opacity: isLight ? 0.5 : 0.35
    });
    const cageMesh = new THREE.Mesh(cageGeometry, cageMaterial);
    scene.add(cageMesh);

    // 4. Orbital Ring 1
    const ringGeometry = new THREE.TorusGeometry(2.7, 0.035, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: ring1Color,
      transparent: true,
      opacity: 0.6
    });
    const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    scene.add(ring1);

    // 5. Orbital Ring 2 (Counter-angle)
    const ring2Geometry = new THREE.TorusGeometry(3.1, 0.02, 16, 100);
    const ring2Material = new THREE.MeshBasicMaterial({
      color: ring2Color,
      transparent: true,
      opacity: 0.4
    });
    const ring2 = new THREE.Mesh(ring2Geometry, ring2Material);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);

    // 6. Floating Ambient Particle Starfield
    const particlesCount = 140;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 12;
      positions[i + 1] = (Math.random() - 0.5) * 12;
      positions[i + 2] = (Math.random() - 0.5) * 8;
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x5eead4,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    const particleField = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleField);

    // 7. Dynamic Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const cyanPoint = new THREE.PointLight(0x2dd4bf, 3.5, 50);
    cyanPoint.position.set(4, 3, 4);
    scene.add(cyanPoint);

    const purplePoint = new THREE.PointLight(0xa855f7, 3.0, 50);
    purplePoint.position.set(-4, -3, 3);
    scene.add(purplePoint);

    const goldPoint = new THREE.PointLight(0xf59e0b, 2.0, 30);
    goldPoint.position.set(0, 4, -2);
    scene.add(goldPoint);

    // 8. Animation & Motion Sensor Physics Loop
    let animationId;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Continuous ambient rotation
      coreMesh.rotation.y += 0.005;
      coreMesh.rotation.x += 0.002;

      cageMesh.rotation.y -= 0.003;
      cageMesh.rotation.z += 0.002;

      ring1.rotation.z += 0.008;
      ring2.rotation.z -= 0.006;
      particleField.rotation.y = elapsedTime * 0.02;

      // Floating wave animation (bobbing up/down in 3D)
      const bobOffset = Math.sin(elapsedTime * 1.5) * 0.12;
      coreMesh.position.y = bobOffset;
      cageMesh.position.y = bobOffset;

      // Smoothly tilt entire scene based on Motion Sensors (gyro/mouse)
      const targetX = targetRotationRef.current.x;
      const targetY = targetRotationRef.current.y;

      scene.rotation.x += (targetX - scene.rotation.x) * 0.08;
      scene.rotation.y += (targetY - scene.rotation.y) * 0.08;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    // 9. Resize Observer
    const handleResize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(currentMount);

    // 10. Clean Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      coreGeometry.dispose();
      coreMaterial.dispose();
      cageGeometry.dispose();
      cageMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      ring2Geometry.dispose();
      ring2Material.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[460px] md:h-[540px] flex items-center justify-center">
      {/* Three.js Canvas Container */}
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Floating 3D Depth Rings Glow */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-radial from-brand-500/10 via-transparent to-transparent blur-3xl opacity-60" />
    </div>
  );
}

class ThreeDHeroSceneErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('ThreeDHeroScene WebGL Error caught safely:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="relative w-full h-[460px] md:h-[540px] flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-brand-500/30 to-teal-400/20 blur-3xl animate-pulse" />
        </div>
      );
    }
    return <ThreeDHeroSceneContent {...this.props} />;
  }
}

export default ThreeDHeroSceneErrorBoundary;
