// frontend/src/components/3d/SpatialBackground.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function SpatialBackground({ tiltX = 0, tiltY = 0, theme = 'cyber' }) {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const isLight = theme === 'light' || theme === 'graphite' || theme === 'vintage';

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 transition-colors duration-500"
      style={{
        backgroundColor: isLight ? '#f8fafc' : '#04060b'
      }}
    >
      {/* 1. Dynamic Cursor Spotlight */}
      <div 
        className="absolute inset-0 opacity-40 transition-opacity duration-700"
        style={{
          background: isLight
            ? `radial-gradient(800px circle at ${mousePos.x}% ${mousePos.y}%, rgba(15, 23, 42, 0.04), transparent 70%)`
            : `radial-gradient(800px circle at ${mousePos.x}% ${mousePos.y}%, rgba(20, 184, 166, 0.08), rgba(99, 102, 241, 0.04) 40%, transparent 80%)`
        }}
      />

      {/* 2. Floating Luminous Orbs (Parallax with Motion Sensors) */}
      <motion.div
        animate={{
          x: tiltX * 45,
          y: tiltY * 35,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 60 }}
        className={`absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[140px] ${
          isLight 
            ? 'bg-slate-300/30' 
            : 'bg-gradient-to-br from-brand-500/15 via-teal-500/10 to-transparent'
        }`}
      />

      <motion.div
        animate={{
          x: -tiltX * 55,
          y: -tiltY * 45,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 50 }}
        className={`absolute top-1/3 -right-40 w-[550px] h-[550px] rounded-full blur-[150px] ${
          isLight 
            ? 'bg-teal-100/30' 
            : 'bg-gradient-to-bl from-indigo-500/12 via-purple-600/08 to-transparent'
        }`}
      />

      <motion.div
        animate={{
          x: tiltX * 30,
          y: -tiltY * 30,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 70 }}
        className={`absolute bottom-10 left-1/4 w-[500px] h-[400px] rounded-full blur-[160px] ${
          isLight 
            ? 'bg-gray-200/30' 
            : 'bg-gradient-to-tr from-amber-500/08 via-emerald-500/06 to-transparent'
        }`}
      />

      {/* 3. 3D Spatial Perspective Horizon Grid */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[450px] origin-bottom overflow-hidden opacity-30"
        style={{
          perspective: '800px',
        }}
      >
        <motion.div
          animate={{
            rotateX: 62 + tiltY * 6,
            rotateZ: tiltX * 4,
            translateY: tiltY * 10
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 45 }}
          className="w-[200%] h-[200%] -left-[50%] absolute bottom-0 perspective-grid origin-bottom"
          style={{
            backgroundImage: isLight
              ? 'linear-gradient(to right, rgba(15, 23, 42, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.08) 1px, transparent 1px)'
              : undefined
          }}
        />
        {/* Horizon Fade Mask */}
        <div 
          className="absolute inset-0"
          style={{
            background: isLight
              ? 'linear-gradient(to top, transparent, rgba(248, 250, 252, 0.7), #f8fafc)'
              : 'linear-gradient(to top, transparent, rgba(4, 6, 11, 0.7), #04060b)'
          }}
        />
      </div>

      {/* 4. Subtle Micro Depth Particles (Calm, static, non-blinking) */}
      <div className="absolute inset-0 opacity-20">
        <div className={`absolute top-[15%] left-[20%] w-1.5 h-1.5 rounded-full ${isLight ? 'bg-slate-400' : 'bg-brand-400'}`} />
        <div className={`absolute top-[35%] right-[25%] w-1.5 h-1.5 rounded-full ${isLight ? 'bg-slate-500' : 'bg-cyan-300'}`} />
        <div className={`absolute top-[70%] left-[40%] w-1.5 h-1.5 rounded-full ${isLight ? 'bg-slate-400' : 'bg-purple-400'}`} />
        <div className={`absolute top-[55%] right-[15%] w-1.5 h-1.5 rounded-full ${isLight ? 'bg-stone-500' : 'bg-amber-300'}`} />
        <div className={`absolute top-[85%] left-[10%] w-1.5 h-1.5 rounded-full ${isLight ? 'bg-slate-400' : 'bg-teal-300'}`} />
      </div>

      {/* 5. Subtle Luxury Vignette */}
      {!isLight && <div className="absolute inset-0 bg-radial-vignette opacity-50" />}
    </div>
  );
}
