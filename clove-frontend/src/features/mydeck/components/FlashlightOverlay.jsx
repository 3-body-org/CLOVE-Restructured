import React, { useEffect, useRef, useState } from 'react';

const FLASHLIGHT_RADIUS = 200; // px, increased for smoother edge
const DARKNESS_COLOR = 'rgba(10, 10, 10, 0.92)';

const FlashlightOverlay = () => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Get mouse position relative to the overlay's bounding box
      if (overlayRef.current) {
        const rect = overlayRef.current.getBoundingClientRect();
        setCoords({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Create a radial gradient mask centered at the cursor, with a blurred edge
  const maskStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1000,
    background: `radial-gradient(circle ${FLASHLIGHT_RADIUS}px at ${coords.x}px ${coords.y}px, transparent 0%, transparent 55%, rgba(10,10,10,0.15) 70%, rgba(10,10,10,0.4) 80%, rgba(10,10,10,0.7) 90%, ${DARKNESS_COLOR} 100%)`,
    transition: 'background 0.1s',
    mixBlendMode: 'multiply',
  };

  return <div ref={overlayRef} style={maskStyle} aria-hidden="true" />;
};

export default FlashlightOverlay; 