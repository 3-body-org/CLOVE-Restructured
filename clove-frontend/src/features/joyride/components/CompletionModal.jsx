import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/CompletionModal.module.scss';

const CompletionModal = ({ onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={styles.modal}
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>

          <div className={styles.content}>
            <motion.div
              className={styles.iconContainer}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <FontAwesomeIcon icon={faCheckCircle} className={styles.icon} />
            </motion.div>

            <h2 className={styles.title}>Tutorial Complete! 🎉</h2>
            
            <p className={styles.message}>
              You've completed the tour! You now know how to navigate through Dashboard, My Deck, and Progress pages.
            </p>

            <p className={styles.hint}>
              You can restart this tutorial anytime by clicking the question mark icon (?) in the sidebar above the logout button.
            </p>

            <motion.button
              className={styles.button}
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Got it!
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CompletionModal;

