import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, ReactNode } from "react";
import { Heart, MessageCircle, Repeat2, Eye } from "lucide-react";

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  showQuickStats?: boolean;
  likes?: number;
  replies?: number;
  recasts?: number;
  views?: number;
}

export function InteractiveCard({ 
  children, 
  className = "", 
  showQuickStats = false,
  likes = 0,
  replies = 0,
  recasts = 0,
  views = 0
}: InteractiveCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 20, stiffness: 300 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), springConfig);
  const scale = useSpring(1, springConfig);
  const glowOpacity = useSpring(0, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    scale.set(1.02);
    glowOpacity.set(0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    scale.set(1);
    glowOpacity.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
      className="relative"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: "preserve-3d",
        }}
        className={`relative ${className}`}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 blur-lg pointer-events-none"
          style={{ opacity: glowOpacity }}
        />
        
        {/* Main content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Quick stats overlay on hover */}
        {showQuickStats && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/95 via-background/80 to-transparent rounded-b-xl pointer-events-none"
          >
            <div className="flex items-center justify-around text-xs">
              <motion.div 
                className="flex items-center gap-1 text-muted-foreground"
                whileHover={{ scale: 1.1, color: "hsl(var(--destructive))" }}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>{likes.toLocaleString()}</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-1 text-muted-foreground"
                whileHover={{ scale: 1.1, color: "hsl(var(--primary))" }}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{replies.toLocaleString()}</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-1 text-muted-foreground"
                whileHover={{ scale: 1.1, color: "hsl(var(--accent))" }}
              >
                <Repeat2 className="w-3.5 h-3.5" />
                <span>{recasts.toLocaleString()}</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-1 text-muted-foreground"
                whileHover={{ scale: 1.1 }}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{views.toLocaleString()}</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Micro-interaction animations for likes, follows, etc.
export function LikeAnimation({ isLiked, onClick }: { isLiked: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.8 }}
      className="relative"
    >
      <motion.div
        animate={isLiked ? { 
          scale: [1, 1.3, 1],
        } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Heart 
          className={`w-5 h-5 transition-colors ${isLiked ? 'text-destructive fill-destructive' : 'text-muted-foreground'}`} 
        />
      </motion.div>
      {isLiked && (
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Heart className="w-5 h-5 text-destructive" />
        </motion.div>
      )}
    </motion.button>
  );
}

export function FollowAnimation({ isFollowing, onClick }: { isFollowing: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
        isFollowing 
          ? 'bg-muted text-foreground border border-border' 
          : 'bg-primary text-primary-foreground'
      }`}
    >
      <motion.span
        key={isFollowing ? 'following' : 'follow'}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </motion.span>
    </motion.button>
  );
}
