import React from "react";
import PropTypes from "prop-types";
import { Image } from "react-bootstrap";
import styles from "../styles/SubtopicPage.module.scss";

const SubtopicPath = React.memo(function SubtopicPath({ pathImage, className = "" }) {
  if (!pathImage) return null;
  return (
    <Image
      fluid
      src={pathImage}
      className={`${styles.pathImage} ${className}`}
    />
  );
});

SubtopicPath.propTypes = {
  pathImage: PropTypes.string,
  className: PropTypes.string
};

export default SubtopicPath; 