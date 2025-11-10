import { Row, Col } from "react-bootstrap";
import { Image } from "react-bootstrap";
import styles from "components/layout/Navbar/TitleAndProfile.module.scss";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "contexts/AuthContext";

// import profile from "../assets/images/DashboardPage/profile.svg";

export default function TitleAndProfile({ nonColored, colored, description, showProfileButton = true, theme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const profilePhoto = user?.profile_photo_url;
  
  // Check if we're on MyDeck pages to apply theme styling
  // But exclude the main topic selection page (Lesson Cards)
  const isMyDeckPage = location.pathname.includes('/my-deck') && 
                      !location.pathname.match(/^\/my-deck\/?$/);

  return (
    <header>
      <div className={styles.headerLeft}>
        <h2>
          {nonColored} <span 
            className={styles.username} 
            style={isMyDeckPage ? {
              color: theme === 'wizard' ? '#FBBF24' : 
                     theme === 'detective' ? '#d1b773' : 
                     theme === 'space' ? '#a6aafb' : 
                     '#a6aafb', // default
              textShadow: theme === 'wizard' ? '0 0 8px rgba(251, 191, 36, 0.5), 0 0 16px rgba(251, 191, 36, 0.3)' :
                          theme === 'detective' ? '0 0 8px rgba(209, 183, 115, 0.5), 0 0 16px rgba(209, 183, 115, 0.3)' :
                          theme === 'space' ? '0 0 8px rgba(166, 170, 251, 0.5), 0 0 16px rgba(166, 170, 251, 0.3)' :
                          '0 0 8px rgba(166, 170, 251, 0.5), 0 0 16px rgba(166, 170, 251, 0.3)'
            } : {}}
          >
            {colored}
          </span>
        </h2>
        <p>{description}</p>
      </div>
      {showProfileButton && (
        <button
          className={styles.profileButton}
          onClick={() => navigate("/profile")}
          aria-label="Go to profile"
          data-joyride="profile-button"
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
