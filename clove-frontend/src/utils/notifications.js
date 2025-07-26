import { toast } from "react-toastify";

// Standardized notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Standardized notification messages
export const NOTIFICATION_MESSAGES = {
  LOCKED_SUBTOPIC: "Complete the required items first!",
  LOCKED_ASSESSMENT: "Complete the required items first!",
  PROFILE_UPDATED: "Profile updated successfully!",
  SAVE_SUCCESS: "Changes saved successfully!",
  SAVE_ERROR: "Failed to save changes. Please try again.",
  LOADING_ERROR: "Failed to load data. Please try again.",
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  VALIDATION_ERROR: "Please check your input and try again."
};

// Standardized notification function
export const showNotification = (type, message, options = {}) => {
  const defaultOptions = {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

  const toastOptions = { ...defaultOptions, ...options };

  switch (type) {
    case NOTIFICATION_TYPES.SUCCESS:
      return toast.success(message, toastOptions);
    case NOTIFICATION_TYPES.ERROR:
      return toast.error(message, toastOptions);
    case NOTIFICATION_TYPES.WARNING:
      return toast.warning(message, toastOptions);
    case NOTIFICATION_TYPES.INFO:
      return toast.info(message, toastOptions);
    default:
      return toast(message, toastOptions);
  }
};

// Specific notification functions for common use cases
export const showLockedNotification = (itemType = 'item') => {
  const message = itemType === 'assessment' 
    ? NOTIFICATION_MESSAGES.LOCKED_ASSESSMENT 
    : NOTIFICATION_MESSAGES.LOCKED_SUBTOPIC;
  
  return showNotification(NOTIFICATION_TYPES.WARNING, message, {
    autoClose: 4000,
    icon: "🔒"
  });
};

export const showSuccessNotification = (message = NOTIFICATION_MESSAGES.SAVE_SUCCESS) => {
  return showNotification(NOTIFICATION_TYPES.SUCCESS, message, {
    autoClose: 2500,
    icon: "✅"
  });
};

export const showErrorNotification = (message = NOTIFICATION_MESSAGES.SAVE_ERROR) => {
  return showNotification(NOTIFICATION_TYPES.ERROR, message, {
    autoClose: 5000,
    icon: "❌"
  });
};

export const showInfoNotification = (message) => {
  return showNotification(NOTIFICATION_TYPES.INFO, message, {
    autoClose: 3500,
    icon: "ℹ️"
  });
}; 