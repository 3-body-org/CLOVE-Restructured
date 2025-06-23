import React, { useState } from "react";
import { Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { Image } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faChartBar,
  faLayerGroup,
  faSignOutAlt,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import styles from "components/layout/Sidebar/Sidebar.module.scss";
import CloveLogo from "assets/icons/common/icon-common-clove-logo.png";

const navItems = [
  { to: "/dashboard", icon: faHome, label: "Dashboard" },
  { to: "/progress", icon: faChartBar, label: "Progress" },
  { to: "/my-deck", icon: faLayerGroup, label: "My Deck" },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();

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
      <nav className={styles.navContainer}>
        {navItems.map(({ to, icon, label }) => (
          <Nav.Link
            as={Link}
            to={to}
            key={to}
            className={`${styles.navItem} ${
              location.pathname === to ? styles.active : ""
            }`}
          >
            <FontAwesomeIcon icon={icon} className={styles.navIcon} />
            {expanded && <span className={styles.navLabel}>{label}</span>}
          </Nav.Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className={styles.bottomSection}>
        <Nav.Link
          as={Link}
          to="/logout"
          className={`${styles.navItem} ${styles.logout}`}
        >
          <FontAwesomeIcon icon={faSignOutAlt} className={styles.navIcon} />
          {expanded && <span className={styles.navLabel}>Log out</span>}
        </Nav.Link>

        {/* Sidebar Toggle */}
        <div
          className={styles.toggleIcon}
          onClick={() => setExpanded(!expanded)}
        >
          <FontAwesomeIcon icon={faBars} />
        </div>
      </div>
    </div>
  );
}
