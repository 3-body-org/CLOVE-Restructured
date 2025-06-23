import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "features/mydeck/styles/TypeCard.module.scss";

const TypeCard = ({
  icon,
  title,
  description,
  badges = [],
  codeLines = [],
  themeStyles = {}
}) => {
  return (
    <div className={`${styles.typeCard} ${themeStyles.card || ''}`}>
      <div className={`${styles.iconContainer} ${themeStyles.iconContainer || ''}`}>
        <div className={styles.iconWrapper}>
          <FontAwesomeIcon icon={icon} className={styles.icon} />
          <div className={styles.particleEffect}></div>
        </div>
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>

      {codeLines.length > 0 && (
        <div className={styles.codeVisual}>
          <pre>
            {codeLines.map((line, i) => (
              <div key={i} className={styles.codeLine}>
                {line}
              </div>
            ))}
          </pre>
        </div>
      )}

      {badges.length > 0 && (
        <div className={styles.badges}>
          {badges.map((badge, i) => (
            <span key={i} className={styles.badge}>
              {badge}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

TypeCard.propTypes = {
  icon: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  badges: PropTypes.arrayOf(PropTypes.string),
  codeLines: PropTypes.arrayOf(PropTypes.string),
  themeStyles: PropTypes.object,
};

TypeCard.defaultProps = {
  badges: [],
  codeLines: [],
  themeStyles: {},
};

export default TypeCard;
