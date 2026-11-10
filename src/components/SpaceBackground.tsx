import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  alphaSpeed: number;
  speedY: number;
  speedX: number;
  color: string;
  isBright?: boolean;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export const SpaceBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Color palette for cosmic twinkling stars
    const starColors = [
      'rgba(255, 255, 255,',
      'rgba(0, 229, 255,',
      'rgba(180, 230, 255,',
      'rgba(255, 240, 220,',
      'rgba(200, 180, 255,',
    ];

    // Generate stars with multi-tier hierarchy
    const starCount = Math.floor((width * height) / 4500);
    const stars: Star[] = Array.from({ length: Math.min(starCount, 260) }, (_, i) => {
      const isBright = i % 20 === 0;
      const colorPrefix = starColors[Math.floor(Math.random() * starColors.length)];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: isBright ? Math.random() * 1.5 + 2.0 : Math.random() * 1.4 + 0.4,
        alpha: Math.random() * 0.7 + 0.3,
        alphaSpeed: (Math.random() * 0.012 + 0.004) * (Math.random() > 0.5 ? 1 : -1),
        speedY: (Math.random() * 0.07 + 0.01) * -1,
        speedX: Math.random() * 0.04 - 0.02,
        color: colorPrefix,
        isBright,
      };
    });

    const shootingStars: ShootingStar[] = [];
    let nextShootingStarTime = Date.now() + 3000;

    const spawnShootingStar = () => {
      shootingStars.push({
        x: Math.random() * width * 0.85,
        y: Math.random() * height * 0.35,
        length: Math.random() * 100 + 60,
        speed: Math.random() * 9 + 7,
        angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
        opacity: 1,
        life: 0,
        maxLife: Math.random() * 45 + 30,
      });
      nextShootingStarTime = Date.now() + Math.random() * 6000 + 4000;
    };

    const render = () => {
      // Clear transparently so the high-resolution background image and dark overlay shine through
      ctx.clearRect(0, 0, width, height);

      // Render and animate twinkling stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.alpha += s.alphaSpeed;
        if (s.alpha > 0.95 || s.alpha < 0.2) {
          s.alphaSpeed = -s.alphaSpeed;
        }

        s.y += s.speedY;
        s.x += s.speedX;
        if (s.y < 0) s.y = height;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;

        // Base star dot
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `${s.color} ${s.alpha * 0.85})`;
        ctx.fill();

        // Extra glowing corona and cross flares for bright navigational stars
        if (s.isBright) {
          const starGlow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 4);
          starGlow.addColorStop(0, `rgba(0, 229, 255, ${s.alpha * 0.5})`);
          starGlow.addColorStop(0.5, `rgba(0, 229, 255, ${s.alpha * 0.15})`);
          starGlow.addColorStop(1, 'rgba(0, 229, 255, 0)');
          ctx.fillStyle = starGlow;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 4, 0, Math.PI * 2);
          ctx.fill();

          // Delicate 4-point cross flare
          const flareLen = s.size * 3.2;
          ctx.strokeStyle = `rgba(255, 255, 255, ${s.alpha * 0.35})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(s.x - flareLen, s.y);
          ctx.lineTo(s.x + flareLen, s.y);
          ctx.moveTo(s.x, s.y - flareLen);
          ctx.lineTo(s.x, s.y + flareLen);
          ctx.stroke();
        }
      }

      // Render shooting stars
      if (Date.now() > nextShootingStarTime) {
        spawnShootingStar();
      }

      for (let j = shootingStars.length - 1; j >= 0; j--) {
        const ss = shootingStars[j];
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.life++;
        ss.opacity = 1 - ss.life / ss.maxLife;

        if (ss.life >= ss.maxLife) {
          shootingStars.splice(j, 1);
          continue;
        }

        const tailX = ss.x - Math.cos(ss.angle) * ss.length;
        const tailY = ss.y - Math.sin(ss.angle) * ss.length;

        const starGrad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
        starGrad.addColorStop(0, `rgba(255, 255, 255, ${ss.opacity})`);
        starGrad.addColorStop(0.25, `rgba(0, 229, 255, ${ss.opacity * 0.85})`);
        starGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');

        ctx.strokeStyle = starGrad;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-transparent">
      {/* Dynamic Animated Starfield & Comets Canvas overlaying the fixed Earth/nebula background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
};
