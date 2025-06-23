import { Row, Col } from "react-bootstrap";
import { Image } from "react-bootstrap";
import styles from "components/layout/Navbar/TitleAndProfile.module.scss";

// import profile from "../assets/images/DashboardPage/profile.svg";

export default function TitleAndProfile({ nonColored, colored, description }) {
  return (
    <header>
      <div className={styles.headerLeft}>
        <h2>
          {nonColored} <span className={styles.username}>{colored}</span>
        </h2>
        <p>{description}</p>
      </div>
      <img
        className={styles.profile}
        src="https://i.pravatar.cc/48?img=12"
        alt="User avatar"
      />
    </header>
  );
}
