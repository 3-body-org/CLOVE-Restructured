# Theme System Documentation

## 1. Introduction

This document provides a comprehensive overview of the theme system used in this application. The system is designed to be modular, scalable, and easy to maintain, following best practices in software engineering. It allows for the creation of new themes and the modification of existing ones with minimal effort.

## 2. Folder Structure

The `themes` folder contains all the files related to the theme system. Here is a breakdown of the folder structure:

```
/src/styles/themes
|-- detective-theme.scss
|-- index.scss
|-- space-theme.scss
|-- theme-mixins.scss
`-- wizard-theme.scss
```

- **`index.scss`**: This is the main file of the theme system. It imports all the other theme files and exports them to the rest of the application. It also contains the theme switcher logic and the global theme styles.
- **`theme-mixins.scss`**: This file contains all the mixins used in the theme system. Mixins are reusable pieces of code that can be included in other SCSS files. This helps to keep the code DRY (Don't Repeat Yourself) and easy to maintain.
- **`detective-theme.scss`**, **`space-theme.scss`**, **`wizard-theme.scss`**: These files contain the specific styles for each theme. Each file defines a set of variables that are used to style the application.

## 3. How it Works

The theme system is based on a set of SCSS variables that are defined in each theme file. These variables are then used to style the application. The `index.scss` file contains a theme switcher that allows the user to switch between themes. When the user selects a theme, the corresponding class is added to the `body` element of the application. This class is then used to apply the specific styles for that theme.

### 3.1. Theming Principles

The theme system is based on the following principles:

- **Centralized Theme Management**: All theme-related files are located in the `themes` folder. This makes it easy to find and modify theme-related code.
- **Modularity**: Each theme is defined in its own file. This makes it easy to add new themes or modify existing ones without affecting the rest of the application.
- **Scalability**: The theme system is designed to be scalable. It can handle a large number of themes without affecting the performance of the application.
- **Maintainability**: The theme system is easy to maintain. The code is well-organized and easy to understand.

### 3.2. Connection to Other Components

The theme system is connected to the rest of the application through the `index.scss` file. This file is imported into the main `App.scss` file, which is then imported into the main `index.js` file. This makes the theme system available to the entire application.

The theme system is also connected to the components through the `theme-mixins.scss` file. This file contains a set of mixins that can be used to style the components. These mixins are imported into the component-specific SCSS files.

## 4. How to Use

To use the theme system, you need to import the `index.scss` file into your main `App.scss` file. Then, you can use the theme variables to style your components.

### 4.1. Using Theme Variables

To use a theme variable, you need to use the `var()` function. For example, to use the `primary-color` variable, you would write the following code:

```scss
.my-component {
  color: var(--primary-color);
}
```

### 4.2. Using Theme Mixins

To use a theme mixin, you need to import the `theme-mixins.scss` file into your component-specific SCSS file. Then, you can use the `@include` directive to include the mixin. For example, to use the `theme-button` mixin, you would write the following code:

```scss
@import "styles/themes/theme-mixins.scss";

.my-button {
  @include theme-button;
}
```

## 5. How to Create a New Theme

To create a new theme, you need to create a new SCSS file in the `themes` folder. This file should contain a set of variables that define the styles for the new theme. Then, you need to import the new theme file into the `index.scss` file and add it to the `$themes` map.

### 5.1. Step-by-Step Guide

1.  Create a new SCSS file in the `themes` folder. For example, `my-theme.scss`.
2.  In the new file, define a set of variables for the new theme. For example:

```scss
$my-theme: (
  "primary-color": #ff0000,
  "secondary-color": #00ff00,
  "text-color": #0000ff,
);
```

3.  In the `index.scss` file, import the new theme file:

```scss
@use "./my-theme.scss" as my-theme;
```

4.  In the `index.scss` file, add the new theme to the `$themes` map:

```scss
$themes: (
  "wizard": wizard.$wizard-theme,
  "detective": detective.$detective-theme,
  "space": space.$space-theme,
  "my-theme": my-theme.$my-theme,
);
```

5.  Add a new class for the new theme in the `index.scss` file:

```scss
.theme-my-theme {
  @extend .theme-base;
  @include mixins.apply-theme-variables(my-theme.$my-theme);
}
```

