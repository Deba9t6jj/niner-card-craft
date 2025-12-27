import { motion } from "framer-motion";

interface AnimatedBackgroundProps {
  variant?: "hero" | "dashboard" | "subtle";
  className?: string;
}

export const AnimatedBackground = ({ variant = "hero", className = "" }: AnimatedBackgroundProps) => {
  if (variant === "hero") {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        {/* Primary gradient blob */}
        <motion.div
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -30, 50, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-1/4 -left-1/4 w-[60%] h-[60%] rounded-full bg-primary/10 blur-[100px]"
        />
        
        {/* Accent gradient blob */}
        <motion.div
          animate={{
            x: [0, -40, 30, 0],
            y: [0, 40, -20, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -bottom-1/4 -right-1/4 w-[50%] h-[50%] rounded-full bg-accent/10 blur-[100px]"
        />
        
        {/* Center glow */}
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-farcaster/15 blur-[80px]"
        />

        {/* Animated gradient overlay */}
        <motion.div
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 opacity-30"
          style={{
            background: "linear-gradient(45deg, hsl(var(--primary) / 0.1) 0%, transparent 50%, hsl(var(--accent) / 0.1) 100%)",
            backgroundSize: "200% 200%",
          }}
        />
      </div>
    );
  }

  if (variant === "dashboard") {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        {/* Subtle animated orbs */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 right-1/4 w-[300px] h-[300px] rounded-full bg-primary/10 blur-[80px]"
        />
        
        <motion.div
          animate={{
            y: [0, 20, 0],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
          className="absolute bottom-0 left-1/4 w-[250px] h-[250px] rounded-full bg-accent/10 blur-[60px]"
        />
      </div>
    );
  }

  // Subtle variant
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <motion.div
        animate={{
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full"
        style={{
          background: "radial-gradient(circle at center, hsl(var(--primary) / 0.1) 0%, transparent 70%)",
        }}
      />
    </div>
  );
};

// Mesh gradient background
export const MeshGradientBackground = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="40" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
          </filter>
        </defs>
        <g filter="url(#goo)">
          <motion.circle
            animate={{
              cx: ["20%", "30%", "20%"],
              cy: ["20%", "40%", "20%"],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            r="15%"
            fill="hsl(var(--primary) / 0.3)"
          />
          <motion.circle
            animate={{
              cx: ["80%", "70%", "80%"],
              cy: ["30%", "50%", "30%"],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            r="12%"
            fill="hsl(var(--accent) / 0.3)"
          />
          <motion.circle
            animate={{
              cx: ["50%", "40%", "50%"],
              cy: ["80%", "60%", "80%"],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            r="18%"
            fill="hsl(var(--farcaster) / 0.2)"
          />
        </g>
      </svg>
    </div>
  );
};
