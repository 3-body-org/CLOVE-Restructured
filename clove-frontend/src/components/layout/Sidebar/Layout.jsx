//react bootstrap
import { Container, Row, Col } from "react-bootstrap";
import { useState, createContext, useContext } from "react";
//component
import Sidebar from "components/layout/Sidebar/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
//scss
import styles from "components/layout/Sidebar/Layout.module.scss";

// Create context for sidebar state
const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    // Return dummy functions when used outside provider to prevent errors
    if (process.env.NODE_ENV === 'development') {
      console.warn('useSidebar is being used outside of SidebarProvider. Returning fallback values.');
    }
    return {
      sidebarExpanded: false,
      toggleSidebar: () => {},
      closeSidebar: () => {}
    };
  }
  return context;
};

export default function Layout({ children }) {
  // Initialize sidebar state from localStorage, default to true if not set
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebarExpanded');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const toggleSidebar = (expanded) => {
    setSidebarExpanded(expanded);
    // Save to localStorage
    localStorage.setItem('sidebarExpanded', JSON.stringify(expanded));
  };

  const closeSidebar = () => {
    setSidebarExpanded(false);
    // Save to localStorage
    localStorage.setItem('sidebarExpanded', JSON.stringify(false));
  };

  return (
    <SidebarContext.Provider value={{ sidebarExpanded, toggleSidebar, closeSidebar }}>
      <div className={styles.layoutContainer}>
        {/* Mobile Menu Toggle Button */}
        {!sidebarExpanded && (
          <button 
            className={styles.mobileMenuButton}
            onClick={() => toggleSidebar(true)}
            aria-label="Open menu"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        )}

        {/* Sidebar */}
        <div className={styles.sidebarContainer}>
          <Sidebar expanded={sidebarExpanded} onToggle={toggleSidebar} />
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>{children}</div>

        {/* Overlay for mobile when sidebar is expanded */}
        {sidebarExpanded && (
          <div 
            className={styles.mobileOverlay}
            onClick={() => toggleSidebar(false)}
          />
        )}
      </div>
    </SidebarContext.Provider>
  );
}
