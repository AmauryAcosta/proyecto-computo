import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useIsMobile } from "../../hooks/useMediaQuery";
import { useState, useEffect } from "react";

export default function AppLayout() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);


  useEffect(() => {
    if (!isMobile) setSidebarOpen(false);
  }, [isMobile]);

  return (
    <div style={{ 
      display: "flex", 
      height: "100vh", 
      overflow: "hidden", 
      backgroundColor: "#f9fafb" }}>

      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 40,
          }}
        />
      )}

      <div
        style={{
          position: isMobile ? "fixed" : "relative",
          top: 0, left: 0,
          height: "100%",
          zIndex: isMobile ? 50 : "auto",
          transform: isMobile
            ? sidebarOpen ? "translateX(0)" : "translateX(-100%)"
            : "none",
          transition: "transform 0.25s ease",
          flexShrink: 0,
        }}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
      </div>

      <div style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column", 
        minWidth: 0, height: "100vh", 
        overflow: "hidden" }}>
        <Topbar onMenuClick={() => setSidebarOpen((v) => !v)} isMobile={isMobile} />
        <main style={{ 
          flex: 1, 
          padding: isMobile ? "16px" : "24px", 
          overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}