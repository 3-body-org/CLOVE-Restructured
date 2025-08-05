# Notification System

This directory contains the standardized notification system for the CLOVE application.

## Overview

The notification system uses `react-toastify` to provide consistent, user-friendly notifications across the application. All notifications are positioned at the bottom-right of the screen and follow a consistent design pattern.

## Usage

### Basic Usage

```javascript
import { showNotification, NOTIFICATION_TYPES } from '../utils/notifications';

// Show a success notification
showNotification(NOTIFICATION_TYPES.SUCCESS, "Operation completed successfully!");

// Show an error notification
showNotification(NOTIFICATION_TYPES.ERROR, "Something went wrong!");

// Show a warning notification
showNotification(NOTIFICATION_TYPES.WARNING, "Please complete required items first!");

// Show an info notification
showNotification(NOTIFICATION_TYPES.INFO, "Here's some helpful information!");
```

### Predefined Functions

For common use cases, use the predefined functions:

```javascript
import { 
  showLockedNotification, 
  showSuccessNotification, 
  showErrorNotification, 
  showInfoNotification 
} from '../utils/notifications';

// For locked subtopics/assessments
showLockedNotification('subtopic'); // or 'assessment'

// For successful operations
showSuccessNotification("Profile updated successfully!");

// For errors
showErrorNotification("Failed to save changes. Please try again.");

// For informational messages
showInfoNotification("Your progress has been saved!");
```

## Notification Types

- **SUCCESS**: Green notification with checkmark icon
- **ERROR**: Red notification with X icon  
- **WARNING**: Orange notification with warning icon
- **INFO**: Blue notification with info icon

## Configuration

The ToastContainer is configured in `App.jsx` with the following settings:

- **Position**: Bottom-right
- **Auto Close**: 3000ms (configurable per notification)
- **Progress Bar**: Hidden by default
- **Close on Click**: Enabled
- **Pause on Hover**: Enabled
- **Draggable**: Enabled

## Customization

You can customize individual notifications by passing options:

```javascript
showNotification(NOTIFICATION_TYPES.SUCCESS, "Custom message", {
  autoClose: 5000,
  icon: "🎉",
  position: "top-center"
});
```

## Examples

### SubtopicPage.jsx
```javascript
// Before (using alert)
if (isSubtopicLocked(subtopic)) {
  alert("Complete the required items first!");
  return;
}

// After (using standardized notification)
if (isSubtopicLocked(subtopic)) {
  showLockedNotification('subtopic');
  return;
}
```

### ProfilePage.jsx
```javascript
// Before (using toast directly)
toast.success("Profile updated successfully!");

// After (using standardized notification)
showSuccessNotification("Profile updated successfully!");
```

## Benefits

1. **Consistency**: All notifications follow the same design pattern
2. **Maintainability**: Centralized notification logic
3. **User Experience**: Better visual feedback than browser alerts
4. **Accessibility**: Proper ARIA labels and keyboard navigation
5. **Customization**: Easy to modify appearance and behavior 