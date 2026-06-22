import React, { useEffect, useRef } from 'react';

interface MatrixRainProps {
  opacity?: number;
}

const MatrixRain: React.FC<MatrixRainProps> = ({ opacity = 0.35 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const characters = '01{}[]<>/\\ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const chars = characters.split('');
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);

    const drops: number[] = Array.from({ length: columns }, () => Math.random() * -100);

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animationFrameId: number;
    let lastDrawTime = 0;
    const fps = mediaQuery.matches ? 10 : 30; // throttle FPS instead of interval
    const interval = 1000 / fps;

    const draw = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(draw);

      if (timestamp - lastDrawTime < interval) return;
      lastDrawTime = timestamp;

      // Clear with slight opacity to create trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        
        // Randomly make the leading character brighter and control overall opacity (0.4 - 0.9)
        if (Math.random() > 0.95) {
          ctx.fillStyle = `rgba(255, 255, 255, 0.9)`;
        } else {
          const charOpacity = Math.random() * 0.5 + 0.4; // 0.4 to 0.9
          ctx.fillStyle = `rgba(0, 255, 136, ${charOpacity})`;
        }

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        opacity: opacity,
        pointerEvents: 'none',
      }}
    />
  );
};

export default MatrixRain;
