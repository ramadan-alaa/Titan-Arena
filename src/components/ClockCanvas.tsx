import { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  alpha: number;
  decay: number;
  size: number;
  hue: number;
}

export default function ClockCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let mx = 0;
    let my = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      canvas!.style.width = W + 'px';
      canvas!.style.height = H + 'px';
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      mx = W / 2;
      my = H / 2;
    }

    window.addEventListener('resize', resize);
    resize();

    function createParticle(tipX: number, tipY: number, hue: number) {
      particlesRef.current.push({
        x: tipX,
        y: tipY,
        alpha: 1.0,
        decay: 0.01 + Math.random() * 0.02,
        size: 1 + Math.random() * 3,
        hue,
      });
    }

    function updateAndDrawParticles() {
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }
        ctx!.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.alpha})`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function drawHand(
      value: number,
      max: number,
      radius: number,
      baseHue: number,
      width: number,
      particleHue: number
    ) {
      const angle = (value / max) * Math.PI * 2 - Math.PI / 2;

      const gradient = ctx!.createLinearGradient(
        mx,
        my,
        mx + Math.cos(angle) * radius,
        my + Math.sin(angle) * radius
      );
      gradient.addColorStop(0, `hsla(${baseHue}, 100%, 50%, 0)`);
      gradient.addColorStop(0.3, `hsla(${baseHue}, 100%, 60%, 0.3)`);
      gradient.addColorStop(1, `hsla(${baseHue}, 100%, 70%, 0.8)`);

      ctx!.beginPath();
      ctx!.arc(mx, my, radius, -Math.PI / 2, angle, false);
      ctx!.strokeStyle = gradient;
      ctx!.lineWidth = width;
      ctx!.lineCap = 'round';
      ctx!.stroke();

      const tipX = mx + Math.cos(angle) * radius;
      const tipY = my + Math.sin(angle) * radius;

      ctx!.shadowBlur = 15;
      ctx!.shadowColor = `hsla(${baseHue}, 100%, 60%, 0.8)`;
      ctx!.fillStyle = `hsla(${baseHue}, 100%, 80%, 1)`;
      ctx!.beginPath();
      ctx!.arc(tipX, tipY, width * 0.8, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.shadowBlur = 0;

      createParticle(tipX, tipY, particleHue);
    }

    function animate() {
      ctx!.fillStyle = 'rgba(5, 6, 8, 0.2)';
      ctx!.fillRect(0, 0, W, H);

      const now = new Date();
      const ms = now.getMilliseconds();
      const s = now.getSeconds();
      const m = now.getMinutes();
      const h = now.getHours() % 12;

      const smoothS = s + ms / 1000;
      const smoothM = m + smoothS / 60;
      const smoothH = h + smoothM / 60;

      updateAndDrawParticles();

      drawHand(smoothH, 12, Math.min(W, H) * 0.12, 45, 6, 50);
      drawHand(smoothM, 60, Math.min(W, H) * 0.18, 50, 4, 55);
      drawHand(smoothS, 60, Math.min(W, H) * 0.24, 170, 2, 175);

      ctx!.fillStyle = 'hsla(45, 100%, 80%, 0.9)';
      ctx!.beginPath();
      ctx!.arc(mx, my, 6, 0, Math.PI * 2);
      ctx!.fill();

      rafRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      role="presentation"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0,
        width: '100%',
        height: '100%',
        opacity: 0.18,
        pointerEvents: 'none',
      }}
    />
  );
}
