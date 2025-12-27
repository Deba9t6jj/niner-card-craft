import { Outlet, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnimatePresence, motion } from "framer-motion";

const pageVariants = {
  initial: { 
    opacity: 0, 
    y: 20,
    filter: "blur(10px)"
  },
  in: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)"
  },
  out: { 
    opacity: 0, 
    y: -20,
    filter: "blur(10px)"
  }
};

const pageTransition = {
  type: "tween" as const,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  duration: 0.4
};

const Layout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Theme toggle - fixed position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Layout;
