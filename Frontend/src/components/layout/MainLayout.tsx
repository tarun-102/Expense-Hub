import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const location = useLocation();

  // close on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // close on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setMobileOpen((prev) => !prev);
    } else {
      setDesktopCollapsed((prev) => !prev);
    }
  };

  const handleCloseSidebar = () => {
    setMobileOpen(false);
  };

  return (
    <div
      className={`app-layout ${desktopCollapsed ? "sidebar-collapsed" : ""} ${
        mobileOpen ? "mobile-sidebar-open" : ""
      }`}
    >
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={handleCloseSidebar}
          aria-hidden="true"
        />
      )}

      <Sidebar
        isOpen={mobileOpen}
        onClose={handleCloseSidebar}
        onToggle={handleToggleSidebar}
      />

      <div className="app-content">
        <Topbar onToggleSidebar={handleToggleSidebar} />

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
