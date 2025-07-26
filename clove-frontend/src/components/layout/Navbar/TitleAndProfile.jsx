import { Row, Col } from "react-bootstrap";
import { Image } from "react-bootstrap";
import styles from "components/layout/Navbar/TitleAndProfile.module.scss";
import { useNavigate } from "react-router-dom";
import { useAuth } from "contexts/AuthContext";

// import profile from "../assets/images/DashboardPage/profile.svg";

export default function TitleAndProfile({ nonColored, colored, description, showProfileButton = true }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const profilePhoto = user?.profile_photo_url;

  return (
    <header>
      <div className={styles.headerLeft}>
        <h2>
          {nonColored} <span className={styles.username}>{colored}</span>
        </h2>
        <p>{description}</p>
      </div>
      {showProfileButton && (
        <button
          className={styles.profileButton}
          onClick={() => navigate("/profile")}
          aria-label="Go to profile"
          style={{ background: "none", border: "none", padding: 0, margin: 0, cursor: "pointer" }}
        >
          {profilePhoto ? (
            <img
              className={styles.profile}
              src={profilePhoto}
              alt="User avatar"
            />
          ) : (
            <img
              className={styles.profile}
              src={`https://api.dicebear.com/7.x/rings/svg?seed=${user?.username || 'default'}&color[]=a78bfa&color[]=38bdf8&color[]=06b6d4&color[]=818cf8`}
              alt="Default avatar"
            />
          )}
        </button>
      )}
    </header>
  );
}
