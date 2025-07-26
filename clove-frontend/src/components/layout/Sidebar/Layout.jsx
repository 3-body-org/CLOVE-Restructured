//react bootstrap
import { Container, Row, Col } from "react-bootstrap";
import { useState, createContext, useContext } from "react";
//component
import Sidebar from "components/layout/Sidebar/Sidebar";
//scss
import styles from "components/layout/Sidebar/Layout.module.scss";

// Create context for sidebar state
const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export default function Layout({ children }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const toggleSidebar = (expanded) => {
    setSidebarExpanded(expanded);
  };

  const closeSidebar = () => {
    setSidebarExpanded(false);
  };

  return (
    <SidebarContext.Provider value={{ sidebarExpanded, toggleSidebar, closeSidebar }}>
      <div className={styles.layoutContainer}>
        {/* Sidebar */}
        <div className={styles.sidebarContainer}>
          <Sidebar expanded={sidebarExpanded} onToggle={toggleSidebar} />
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>{children}</div>
      </div>
    </SidebarContext.Provider>
  );
}
