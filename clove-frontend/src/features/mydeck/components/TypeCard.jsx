/**
 * @file TypeCard.jsx
 * @description Renders a type/info card with icon, title, description, code, and badges. Theme-aware.
 */

import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "features/mydeck/styles/TypeCard.module.scss";

/**
 * TypeCard
 * Renders a type/info card with icon, title, description, code, and badges. Theme-aware.
 * @param {Object} props
 * @param {Object} props.icon - FontAwesome icon object.
 * @param {string} props.title - Card title.
 * @param {string} props.description - Card description.
 * @param {Array} [props.badges] - Optional array of badge strings.
 * @param {Array} [props.codeLines] - Optional array of code lines.
 * @param {Object} [props.themeStyles] - Optional theme style classes.
 */
const TypeCard = ({
  icon,
  title,
  description,
  badges = [],
  codeLines = [],
  themeStyles = {},
}) => (
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
      <pre className={styles.codeVisual}>
        {codeLines.map((line, i) => (
          <code key={i} className={styles.codeLine}>{line}</code>
        ))}
      </pre>
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

TypeCard.propTypes = {
  icon: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  badges: PropTypes.arrayOf(PropTypes.string),
  codeLines: PropTypes.arrayOf(PropTypes.string),
  themeStyles: PropTypes.object,
};

export default TypeCard;
