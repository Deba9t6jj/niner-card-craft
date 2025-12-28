import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

interface ParticleFieldProps {
  className?: string;
  particleCount?: number;
  colors?: string[];
  mouseInfluence?: number;
  speed?: number;
  connectDistance?: number;
  showConnections?: boolean;
}

export const ParticleField = ({
  className = "",
  particleCount = 50,
  colors = ["#8b5cf6", "#a855f7", "#6366f1", "#3b82f6"],
  mouseInfluence = 100,
  speed = 0.5,
  connectDistance = 120,
  showConnections = true,
}: ParticleFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>();
  const isHoveringRef = useRef(false);

  const createParticle = useCallback((width: number, height: number, atMouse = false): Particle => {
    const x = atMouse ? mouseRef.current.x : Math.random() * width;
    const y = atMouse ? mouseRef.current.y : Math.random() * height;
    
    return {
      x,
      y,
      vx: (Math.random() - 0.5) * speed * 2,
      vy: (Math.random() - 0.5) * speed * 2,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      maxLife: atMouse ? 60 + Math.random() * 60 : Infinity,
    };
  }, [colors, speed]);

  const initParticles = useCallback((width: number, height: number) => {
    particlesRef.current = Array.from({ length: particleCount }, () => 
      createParticle(width, height)
    );
  }, [particleCount, createParticle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      if (particlesRef.current.length === 0) {
        initParticles(rect.width, rect.height);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseEnter = () => {
      isHoveringRef.current = true;
    };

    const handleMouseLeave = () => {
      isHoveringRef.current = false;
      mouseRef.current = { x: -1000, y: -1000 };
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      // Create burst of particles at click location
      for (let i = 0; i < 15; i++) {
        const angle = (Math.PI * 2 * i) / 15;
        const velocity = 2 + Math.random() * 3;
        particlesRef.current.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          size: Math.random() * 4 + 2,
          opacity: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 0,
          maxLife: 40 + Math.random() * 40,
        });
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseenter", handleMouseEnter);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("click", handleClick);

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Spawn particles near mouse while hovering
      if (isHoveringRef.current && Math.random() < 0.3) {
        particlesRef.current.push(createParticle(rect.width, rect.height, true));
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        // Update life
        particle.life++;
        
        // Remove dead particles
        if (particle.maxLife !== Infinity && particle.life >= particle.maxLife) {
          return false;
        }

        // Calculate distance from mouse
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Mouse influence - particles are attracted/repelled
        if (distance < mouseInfluence && distance > 0) {
          const force = (mouseInfluence - distance) / mouseInfluence;
          const angle = Math.atan2(dy, dx);
          
          // Gentle attraction
          particle.vx += Math.cos(angle) * force * 0.02;
          particle.vy += Math.sin(angle) * force * 0.02;
          
          // Increase opacity near mouse
          particle.opacity = Math.min(1, particle.opacity + force * 0.1);
        } else {
          // Fade back to normal
          particle.opacity = Math.max(0.3, particle.opacity - 0.01);
        }

        // Apply velocity with damping
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Add slight random movement
        particle.vx += (Math.random() - 0.5) * 0.1;
        particle.vy += (Math.random() - 0.5) * 0.1;

        // Wrap around edges
        if (particle.x < 0) particle.x = rect.width;
        if (particle.x > rect.width) particle.x = 0;
        if (particle.y < 0) particle.y = rect.height;
        if (particle.y > rect.height) particle.y = 0;

        // Calculate opacity for temporary particles
        let drawOpacity = particle.opacity;
        if (particle.maxLife !== Infinity) {
          const lifeRatio = particle.life / particle.maxLife;
          drawOpacity *= 1 - lifeRatio;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = drawOpacity;
        ctx.fill();

        return true;
      });

      // Draw connections between nearby particles
      if (showConnections) {
        ctx.globalAlpha = 1;
        particlesRef.current.forEach((p1, i) => {
          particlesRef.current.slice(i + 1).forEach((p2) => {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectDistance) {
              const opacity = (1 - distance / connectDistance) * 0.2;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          });
        });
      }

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseenter", handleMouseEnter);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("click", handleClick);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [colors, connectDistance, createParticle, initParticles, mouseInfluence, showConnections]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-auto ${className}`}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

// Lighter version for subtle backgrounds
export const ParticleBackground = ({ className = "" }: { className?: string }) => (
  <ParticleField
    className={className}
    particleCount={30}
    mouseInfluence={150}
    speed={0.3}
    connectDistance={100}
    showConnections={true}
    colors={["#8b5cf680", "#a855f780", "#6366f180"]}
  />
);

export default ParticleField;
