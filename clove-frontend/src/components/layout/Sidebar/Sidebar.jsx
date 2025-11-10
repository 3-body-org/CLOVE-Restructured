import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faChartBar,
  faLayerGroup,
  faSignOutAlt,
  faBars,
  faUser,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import styles from "components/layout/Sidebar/Sidebar.module.scss";
import CloveLogo from "assets/icons/common/icon-common-clove-logo.png";
import { useAuth } from "contexts/AuthContext";
import { useJoyrideSafe } from "contexts/JoyrideContext";

const navItems = [
  { to: "/dashboard", icon: faHome, label: "Dashboard" },
  { to: "/progress", icon: faChartBar, label: "Progress" },
  { to: "/my-deck", icon: faLayerGroup, label: "My Deck" },
];

export default function Sidebar({ expanded = true, onToggle }) {
  const location = useLocation();
  const { logout } = useAuth();
  const [isMobileView, setIsMobileView] = useState(false);
  
  // Get joyride context safely (returns null if not available)
  const joyrideContext = useJoyrideSafe();
  const resetTour = joyrideContext?.resetTour || (() => {});

  // Detect if we're on mobile/tablet view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    checkMobileView();
    window.addEventListener('resize', checkMobileView);

    return () => window.removeEventListener('resize', checkMobileView);
  }, []);


  const handleLogout = () => {
    // Close sidebar on mobile/tablet before logout
    if (isMobileView && expanded && onToggle) {
      onToggle(false);
    }
    logout();
  };

  const handleToggle = () => {
    if (onToggle) {
      onToggle(!expanded);
    }
  };

  // Close sidebar when nav item is clicked on mobile/tablet
  const handleNavClick = () => {
    if (isMobileView && expanded && onToggle) {
      onToggle(false);
    }
  };

  return (
    <div className={`${styles.sidebar} ${expanded ? styles.expanded : ""}`}>
      {/* Logo Section */}

      <div className={styles.logoSection}>
        <div className={styles.logoContainer}>
          {expanded && <h1 className={styles.logo}>CLOVE</h1>}
          <img src={CloveLogo} alt="Clover Logo" className={styles.logoImg} />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className={styles.navContainer} data-joyride="sidebar-nav">
        {navItems.map(({ to, icon, label }) => (
          <Link
            to={to}
            key={to}
            className={`${styles.navItem} ${
              location.pathname === to ? styles.active : ""
            }`}
            onClick={handleNavClick}
            data-joyride={
              to === "/my-deck" ? "my-deck-nav-link" : 
              to === "/progress" ? "progress-nav-link" : 
              undefined
            }
          >
            <FontAwesomeIcon icon={icon} className={styles.navIcon} />
            {expanded && <span className={styles.navLabel}>{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className={styles.bottomSection}>
        {/* Restart Tour Button */}
        <button
          onClick={resetTour}
          className={styles.navItem}
          style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
          title="Restart tutorial"
        >
          <FontAwesomeIcon icon={faQuestionCircle} className={styles.navIcon} />
          {expanded && <span className={styles.navLabel}>Tutorial</span>}
        </button>
        
        <button
          onClick={handleLogout}
          className={`${styles.navItem} ${styles.logout}`}
          style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
        >
          <FontAwesomeIcon icon={faSignOutAlt} className={styles.navIcon} />
          {expanded && <span className={styles.navLabel}>Log out</span>}
        </button>

        {/* Sidebar Toggle */}
        <div
          className={styles.toggleIcon}
          onClick={handleToggle}
        >
          <FontAwesomeIcon icon={faBars} />
        </div>
      </div>
    </div>
  );
}
