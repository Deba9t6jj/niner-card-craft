import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Trophy, Compass, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
  // { path: "/explore", label: "Explore", icon: Compass },
  // { path: "/profile", label: "Profile", icon: User },
];

interface StickyNavProps {
  className?: string;
}

export const StickyNav = ({ className }: StickyNavProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <motion.nav
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "bg-card/80 backdrop-blur-xl border border-border/50 rounded-full",
        "px-2 py-2 shadow-xl shadow-background/50",
        className
      )}
    >
      <div className="flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative px-4 py-2.5 rounded-full flex items-center gap-2 transition-all",
                  "text-sm font-medium",
                  isActive 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Active background */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-primary/20 border border-primary/30 rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                
                <item.icon className={cn(
                  "w-4 h-4 relative z-10",
                  isActive && "text-primary"
                )} />
                <span className="relative z-10 hidden sm:inline">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default StickyNav;
