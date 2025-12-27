import { Outlet } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Theme toggle - fixed position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Outlet />
    </div>
  );
};

export default Layout;
