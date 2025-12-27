import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, ReactNode } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltAmount?: number;
  glowColor?: string;
  perspective?: number;
}

export const TiltCard = ({
  children,
  className = "",
  tiltAmount = 15,
  glowColor = "hsl(263 70% 58%)",
  perspective = 1000,
}: TiltCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  // Motion values for mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring config for smooth movement
  const springConfig = { damping: 20, stiffness: 300 };

  // Transform mouse position to rotation
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [tiltAmount, -tiltAmount]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-tiltAmount, tiltAmount]), springConfig);

  // Glow position
  const glowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), springConfig);
  const glowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), springConfig);

  // Scale on hover
  const scale = useMotionValue(1);
  const scaleSpring = useSpring(scale, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate mouse position relative to center (-0.5 to 0.5)
    const x = (e.clientX - centerX) / rect.width;
    const y = (e.clientY - centerY) / rect.height;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    scale.set(1.02);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    scale.set(1);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective,
        transformStyle: "preserve-3d",
      }}
      className={`relative ${className}`}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale: scaleSpring,
          transformStyle: "preserve-3d",
        }}
        className="relative"
      >
        {/* Dynamic glow effect */}
        <motion.div
          className="absolute -inset-4 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-xl"
          style={{
            background: `radial-gradient(circle at ${glowX}% ${glowY}%, ${glowColor}40 0%, transparent 60%)`,
          }}
        />

        {/* Reflection/shine effect */}
        <motion.div
          className="absolute inset-0 rounded-[28px] pointer-events-none z-10 overflow-hidden"
          style={{
            background: useTransform(
              [glowX, glowY],
              ([x, y]) =>
                `linear-gradient(${135 + (x as number) * 0.3}deg, transparent 40%, rgba(255,255,255,0.05) ${45 + (y as number) * 0.1}%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.05) ${55 + (y as number) * 0.1}%, transparent 60%)`
            ),
          }}
        />

        {children}
      </motion.div>
    </motion.div>
  );
};

export default TiltCard;
