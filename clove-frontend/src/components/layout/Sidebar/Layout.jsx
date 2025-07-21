//react bootstrap
import { Container, Row, Col } from "react-bootstrap";
import React, { useState, useEffect, createContext, useContext } from "react";
//component
import Sidebar from "components/layout/Sidebar/Sidebar";
//scss
import styles from "components/layout/Sidebar/Layout.module.scss";

// Sidebar context for controlling sidebar state from any child
export const SidebarContext = createContext({ expanded: true, setExpanded: () => {} });

export function useSidebar() {
  return useContext(SidebarContext);
}

export default function Layout({ children }) {
  // Persist sidebar state in localStorage
  const getInitialSidebarState = () => {
    const stored = localStorage.getItem("sidebar_expanded");
    return stored === null ? true : stored === "true";
  };
  const [expanded, setExpanded] = useState(getInitialSidebarState);

  useEffect(() => {
    localStorage.setItem("sidebar_expanded", expanded);
  }, [expanded]);

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded }}>
      <div className={styles.layoutContainer}>
        {/* Sidebar */}
        <div className={styles.sidebarContainer}>
          <Sidebar expanded={expanded} setExpanded={setExpanded} />
        </div>
        {/* Main Content */}
        <div className={styles.mainContent}>{children}</div>
      </div>
    </SidebarContext.Provider>
  );
}
