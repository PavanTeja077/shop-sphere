// frontend/src/hooks/useMotionSensors.js
import { useState, useEffect, useRef } from 'react';

/**
 * useMotionSensors
 * Captures real-time device gyroscope/accelerometer orientation on mobile devices
 * with seamless high-precision pointer physics interpolation on desktop.
 */
export function useMotionSensors() {
  const [sensors, setSensors] = useState({
    tiltX: 0,         // Normalized horizontal tilt [-1, 1]
    tiltY: 0,         // Normalized vertical tilt [-1, 1]
    rawRoll: 0,       // Gamma (degrees: left/right tilt)
    rawPitch: 0,      // Beta (degrees: front/back tilt)
    isGyroscope: false, // True if physical hardware gyro is active
    sensorActive: true,
    permissionState: 'unknown'
  });

  const targetRef = useRef({ x: 0, y: 0, roll: 0, pitch: 0 });
  const currentRef = useRef({ x: 0, y: 0, roll: 0, pitch: 0 });
  const isGyroDetectedRef = useRef(false);
  const animFrameIdRef = useRef(null);

  useEffect(() => {
    // 1. Device Orientation Listener (Mobile / Gyroscope)
    const handleDeviceOrientation = (event) => {
      const { gamma, beta } = event; // gamma: -90 to 90, beta: -180 to 180
      if (gamma !== null && beta !== null) {
        isGyroDetectedRef.current = true;

        // Clamp & normalize
        // Center gamma around 0 (-30 to +30 deg is standard comfortable wrist tilt)
        const normX = Math.max(-1, Math.min(1, gamma / 30));
        // Center beta around 45deg (typical viewing angle when holding phone)
        const adjustedBeta = beta - 45;
        const normY = Math.max(-1, Math.min(1, adjustedBeta / 30));

        targetRef.current = {
          x: normX,
          y: normY,
          roll: Math.round(gamma),
          pitch: Math.round(beta)
        };
      }
    };

    // 2. Mouse / Pointer Listener (Desktop Fallback / Supplement)
    const handleMouseMove = (event) => {
      // If hardware gyroscope is actively driving orientation, ignore mouse on mobile
      if (isGyroDetectedRef.current) return;

      const { innerWidth, innerHeight } = window;
      const centerX = innerWidth / 2;
      const centerY = innerHeight / 2;

      // Calculate normalized offset from center [-1, 1]
      const normX = Math.max(-1, Math.min(1, (event.clientX - centerX) / (innerWidth * 0.45)));
      const normY = Math.max(-1, Math.min(1, (event.clientY - centerY) / (innerHeight * 0.45)));

      targetRef.current = {
        x: normX,
        y: normY,
        roll: Math.round(normX * 25),
        pitch: Math.round(normY * 25)
      };
    };

    // 3. Smooth Physical Inertia Loop (Lerp / Spring dampening)
    const lerp = (start, end, factor) => start + (end - start) * factor;

    const updateMotion = () => {
      const lerpFactor = 0.08; // High-end buttery smooth dampening
      currentRef.current.x = lerp(currentRef.current.x, targetRef.current.x, lerpFactor);
      currentRef.current.y = lerp(currentRef.current.y, targetRef.current.y, lerpFactor);
      currentRef.current.roll = lerp(currentRef.current.roll, targetRef.current.roll, lerpFactor);
      currentRef.current.pitch = lerp(currentRef.current.pitch, targetRef.current.pitch, lerpFactor);

      setSensors({
        tiltX: parseFloat(currentRef.current.x.toFixed(4)),
        tiltY: parseFloat(currentRef.current.y.toFixed(4)),
        rawRoll: Math.round(currentRef.current.roll),
        rawPitch: Math.round(currentRef.current.pitch),
        isGyroscope: isGyroDetectedRef.current,
        sensorActive: true,
        permissionState: isGyroDetectedRef.current ? 'granted' : 'desktop-emulated'
      });

      animFrameIdRef.current = requestAnimationFrame(updateMotion);
    };

    // Attach listeners
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true });
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animFrameIdRef.current = requestAnimationFrame(updateMotion);

    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, []);

  const requestPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      try {
        const response = await DeviceOrientationEvent.requestPermission();
        setSensors((prev) => ({ ...prev, permissionState: response }));
        return response === 'granted';
      } catch (err) {
        console.warn('Device orientation permission failed:', err);
        return false;
      }
    }
    return true;
  };

  return { ...sensors, requestPermission };
}
