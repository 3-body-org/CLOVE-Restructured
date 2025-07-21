//react bootstrap
import { Container, Row, Col } from "react-bootstrap";
//component
import Sidebar from "components/layout/Sidebar/Sidebar";
//scss
import styles from "components/layout/Sidebar/Layout.module.scss";

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
