# My Deck Feature: Theme System Documentation

This document provides a comprehensive guide to the dynamic theme system used in the "My Deck" feature. It covers the architecture, file structure, and step-by-step instructions for adding and modifying themes.

## 1. System Architecture

The theme system is designed to be modular, dynamic, and easy to maintain. It is built on three core concepts:

1.  **CSS Variables for Styling**: Each theme defines its look and feel through a set of CSS variables in its own `.module.scss` file. These variables control colors, fonts, and other style properties.
2.  **JavaScript for Content**: All text, icons, and narrative content are managed in a central JavaScript file (`themeContent.js`). This separates the application's data from its presentation.
3.  **React Context for State Management**: The `ThemeProvider` uses React Context to manage the currently active theme, apply the correct styles to the application, and persist the user's choice in `localStorage`.

## 2. File Structure

All theme-related files are located within `src/features/mydeck/`.

- `./content/themeContent.js`

  - **Purpose**: The single source of truth for all theme-related content.
  - **Contains**: The `themeContent` object with nested objects for each theme (e.g., `wizard`, `detective`). It also contains the `iconMap` for translating abstract icon names to FontAwesome class names.

- `./themes/`

  - **Purpose**: Contains the stylesheet for each individual theme.
  - **Example**: `wizardTheme.module.scss`, `detectiveTheme.module.scss`.
  - **Function**: Each file defines CSS variables scoped to a theme-specific body class (e.g., `body.theme-wizard`).

- `./providers/ThemeProvider.jsx`

  - **Purpose**: The React component that manages the global theme state.
  - **Function**: It applies the correct theme class to the `<body>` tag and provides the `setTheme` function to the rest of the application via context.

- `./styles/index.js`

  - **Purpose**: The central registration point for all themes.
  - **Function**: It imports all theme stylesheets and exports the `THEMES` object, which contains the official list of all valid theme names.

- `./pages/IntroductionPage.jsx`
  - **Purpose**: The main component that consumes and displays the theme content and styles.

## 3. How to Add a New Theme

Follow these steps to add a new theme (e.g., a "robot" theme).

1.  **Create the Stylesheet**:

    - Create a new file: `themes/robotTheme.module.scss`.
    - Define the CSS variables for your new theme inside a scoped block:
      ```scss
      :global(body.theme-robot) {
        --primary-color: #a4a4a4;
        --text-color: #e0e0e0;
        /* ... all other variables ... */
      }
      ```

2.  **Add the Content**:

    - Open `content/themeContent.js`.
    - Add a new entry for `robot` inside the `themeContent` object, following the existing structure (include `heading`, `subtitle`, `mainIcon`, `storyIcon`, `story`, `cta`, and `cards`).

3.  **Add Icons**:

    - If your new theme uses new icons, add them to the `iconMap` in `content/themeContent.js`.
      ```javascript
      "robot-arm": "faRobotArm",
      ```

4.  **Register the Theme**:
    - Open `styles/index.js`.
    - Import your new stylesheet: `import "../themes/robotTheme.module.scss";`
    - Add your new theme to the `THEMES` object: `ROBOT: "robot",`

## 4. How to Modify an Existing Theme

### Changing Styles (Colors, Fonts, etc.)

- To change the visual appearance of a theme, edit its corresponding file in the `/themes` directory.
- **Example**: To change the wizard theme's primary color, edit `--primary-color` in `themes/wizardTheme.module.scss`.

### Changing Text

- To change any text (headings, story paragraphs, card descriptions), edit the relevant properties within that theme's object in `content/themeContent.js`.

### Changing an Icon

This process allows you to change any icon on the `IntroductionPage` (main header, story section, CTA button, or cards).

1.  **Open the Content File**: All changes happen in `content/themeContent.js`.

2.  **(Optional) Add a New Icon to the Map**: If the icon you want to use is not already in the `iconMap`, find its name on the FontAwesome website and add it to the map.

    ```javascript
    // In the iconMap object
    "new-icon-name": "faNewIconName",
    ```

3.  **Update the Theme's Icon Property**: Find the theme you want to modify. Locate the specific icon property you want to change and update its value to the key from the `iconMap`.

    - **To change the main header icon**: Modify the `mainIcon` property.
    - **To change the story section icon**: Modify the `storyIcon` property.
    - **To change the CTA button icon**: Modify the `icon` property inside the `cta` object.
    - **To change a card's icon**: Modify the `icon` property inside the specific card's object.

    **Example**: Changing the detective's main icon to a `"user-secret"` icon.

    ```javascript
    // 1. Add to iconMap
    "user-secret": "faUserSecret",

    // 2. Update in the detective theme object
    detective: {
      // ...
      mainIcon: "user-secret", // Changed from "magnifying-glass"
      // ...
    },
    ```
