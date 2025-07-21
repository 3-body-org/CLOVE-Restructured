import React from 'react';
import styles from '../styles/SubtopicPage.module.scss';

/**
 * ImageThemeBackground
 * Renders a full-page, non-interactive background image for a theme.
 * @param {string} src - The image source
 * @param {string} alt - The alt text for accessibility
 * @param {boolean} blur - Whether to apply a blur filter
 */
const ImageThemeBackground = ({ src, alt, blur = false }) => (
  <img
    src={src}
    alt={alt}
    className={`${styles.backgroundImage} ${blur ? styles.blur : ''}`}
    draggable={false}
  />
);

export default ImageThemeBackground; 