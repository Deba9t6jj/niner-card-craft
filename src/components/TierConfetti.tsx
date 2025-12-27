import { useEffect, useCallback } from "react";
import confetti from "canvas-confetti";

interface TierConfettiProps {
  tier: string;
  previousTier?: string | null;
  onComplete?: () => void;
}

const tierColors: Record<string, string[]> = {
  bronze: ["#CD7F32", "#8B4513", "#DAA520"],
  silver: ["#C0C0C0", "#A8A8A8", "#D3D3D3"],
  gold: ["#FFD700", "#FFA500", "#FFEC8B"],
  diamond: ["#00BFFF", "#87CEEB", "#E0FFFF", "#9370DB"],
};

const tierOrder = ["bronze", "silver", "gold", "diamond"];

export const useTierConfetti = () => {
  const triggerConfetti = useCallback((tier: string) => {
    const colors = tierColors[tier] || tierColors.bronze;
    
    // First burst - center
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
      startVelocity: 45,
      gravity: 0.8,
      scalar: 1.2,
    });

    // Side bursts
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors,
        startVelocity: 40,
      });
    }, 100);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors,
        startVelocity: 40,
      });
    }, 200);

    // Diamond tier gets extra sparkle
    if (tier === "diamond") {
      setTimeout(() => {
        confetti({
          particleCount: 30,
          spread: 360,
          origin: { x: 0.5, y: 0.5 },
          colors: ["#00BFFF", "#9370DB", "#FFD700"],
          startVelocity: 25,
          gravity: 0.5,
          ticks: 300,
          shapes: ["star"],
          scalar: 1.5,
        });
      }, 400);
    }
  }, []);

  return { triggerConfetti };
};

export const TierUnlockConfetti = ({ tier, previousTier, onComplete }: TierConfettiProps) => {
  const { triggerConfetti } = useTierConfetti();

  useEffect(() => {
    if (!previousTier) return;
    
    const prevIndex = tierOrder.indexOf(previousTier.toLowerCase());
    const currentIndex = tierOrder.indexOf(tier.toLowerCase());
    
    // Only trigger if tier increased
    if (currentIndex > prevIndex) {
      // Small delay for dramatic effect
      const timer = setTimeout(() => {
        triggerConfetti(tier.toLowerCase());
        onComplete?.();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [tier, previousTier, triggerConfetti, onComplete]);

  return null;
};

// Hook to manage tier changes and trigger celebrations
export const useTierCelebration = (currentTier: string) => {
  const { triggerConfetti } = useTierConfetti();
  
  const celebrate = useCallback((newTier: string) => {
    triggerConfetti(newTier.toLowerCase());
  }, [triggerConfetti]);

  return { celebrate, triggerConfetti };
};

export default TierUnlockConfetti;
