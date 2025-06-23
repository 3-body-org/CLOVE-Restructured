//react bootstrap
import { Container, Row, Col } from "react-bootstrap";
//component
import Sidebar from "../sidebar/Sidebar";
//scss
import styles from "../../scss modules/components/sidebar/Layout.module.scss";

export default function Layout({ children }) {
  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar */}
      <div className={styles.sidebarContainer}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>{children}</div>
    </div>
  );
}
