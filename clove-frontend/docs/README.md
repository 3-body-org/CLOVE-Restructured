# Frontend Documentation

## Table of Contents
1. [Project Structure](#project-structure)
2. [Styling System](#styling-system)
3. [Theming Guide](#theming-guide)
4. [Component Documentation](#component-documentation)
5. [State Management](#state-management)
6. [API Integration](#api-integration)

## Project Structure

```
src/
├── assets/               # Static assets (images, icons, fonts)
│   ├── icons/           # SVG icons
│   └── images/          # Image assets
├── components/          # Reusable UI components
│   ├── layout/          # Layout components
│   └── ui/              # Basic UI elements
├── features/            # Feature-based modules
│   ├── auth/            # Authentication
│   ├── mydeck/          # MyDeck feature
│   │   ├── pages/       # Page components
│   │   ├── styles/      # Component styles
│   │   └── themes/      # Theme definitions
│   └── ...
├── contexts/            # React contexts
├── lib/                 # Utility functions
└── App.jsx              # Main application component
```

## Coding Conventions

### Naming Conventions
- **Backend**: `snake_case.py`
- **Frontend**: 
  - `PascalCase.jsx` for components
  - `camelCase.js` for utilities and hooks
- **Tests**: 
  - Frontend: `*.test.jsx`
  - Backend: `test_*.py`

### File Structure Rules
1. **1 component per file**
2. **Maximum 3 nested directories** deep
3. **No files in directory roots** except `__init__.py`
4. **Asset Naming**:
   - Icons: `icon-<name>.svg`
   - Illustrations: `illustration-<name>.svg`
   - Photos: `photo-<name>.jpg`

### Import Structure
- Use **absolute paths** with `@/` alias (e.g., `@/components/Button`)
- Avoid relative paths beyond 1 level (no `../../`)

### Code Organization Principles
1. **Single Responsibility**: Each file/module should have one responsibility
2. **DRY (Don't Repeat Yourself)**: Extract reusable logic into shared utilities
3. **Colocation**: Keep tests and related code together
   - Place test files next to the code they test
   - Co-locate related components, styles, and tests

## Styling System

### Global Styles
- Uses SCSS with CSS Modules for scoped styling
- Global variables defined in `_variables.scss`
- Responsive design with mobile-first approach

### CSS Methodology
- BEM (Block Element Modifier) naming convention
- Component-scoped styles using CSS Modules
- Reusable utility classes for common patterns

## Theming Guide

The application supports a flexible theming system with the following features:

### Theme Structure
- Each theme is defined in its own SCSS module
- Themes are located in `features/[feature]/themes/`
- Theme variables are CSS custom properties
- Theme-specific components and animations are conditionally rendered

### Theme Hooks

#### useTheme Hook
Manages theme state and application.

```jsx
const { 
  currentTheme,      // Currently active theme ('space', 'wizard', 'detective')
  setTheme,          // Function to change the theme
  isSpaceTheme,      // Boolean flag for the space theme
  isWizardTheme,     // Boolean flag for the wizard theme
  isDetectiveTheme   // Boolean flag for the detective theme
} = useTheme(initialTheme);
```

#### useParticles Hook
Manages particle animations (primarily for space theme).

```jsx
const canvasRef = useRef(null);
useParticles(canvasRef, currentTheme);  // Only activates for 'space' theme
```

### Adding a New Theme
1. Create a new file in the appropriate `themes/` directory (e.g., `myTheme.module.scss`)
2. Define CSS variables following the naming convention
3. The theme will be automatically available through the `useTheme` hook

Example theme file (`spaceTheme.module.scss`):
```scss
:global(.theme-space) {
  --primary-color: #4a36d7;
  --secondary-color: #8a7fff;
  --accent-color: #00d4ff;
  --text-primary: #ffffff;
  --text-secondary: #b8c2ff;
  --background-dark: #0a0e23;
  --background-light: #1a1f4f;
  --card-bg: rgba(74, 54, 215, 0.1);
  --card-border: rgba(138, 127, 255, 0.2);
  --glow-color: rgba(0, 212, 255, 0.6);
}
```

### Animated Backgrounds

To create a more immersive user experience, some themes feature full-page animated backgrounds. These are implemented as standalone React components that are conditionally rendered based on the active theme.

**Implementation Strategy:**

1.  **Dedicated Components**: Each animated background has its own component (e.g., `RuneBackground.jsx`, `RainfallBackground.jsx`) and stylesheet.
2.  **Full-Page Coverage**: The animation container uses `position: fixed` and a negative `z-index` to ensure it covers the entire viewport behind the main content.
3.  **Theme-Specific Rendering**: The `useTheme` hook's boolean flags (`isWizardTheme`, `isDetectiveTheme`, etc.) are used to conditionally render the correct background component in `IntroductionPage.jsx`.
4.  **Critical Background Handling**: For the animations to be visible, two CSS rules are essential:
    *   The theme's background color **must** be applied to the `<body>` tag in the theme's main stylesheet (e.g., `wizardTheme.module.scss`).
    *   The main content container (`.container` in `IntroductionPage.module.scss`) **must** have its `background-color` set to `transparent` for that specific theme.

**Available Animations:**

*   **Wizard Theme**: `RuneBackground.jsx` - Creates an effect of magical, glowing runes floating up the screen.
*   **Detective Theme**: `RainfallBackground.jsx` - Simulates a moody, atmospheric rainfall effect.
*   **Space Theme**: `useParticles` hook - Generates a starfield particle animation on an HTML `<canvas>` element.

### Theme-Specific Components
Some components may have theme-specific behaviors. Use the boolean flags from the `useTheme` hook to conditionally render them:

```jsx
{isSpaceTheme && (
  <canvas 
    ref={canvasRef}
    className={styles.particleCanvas}
    aria-hidden="true"
  />
)}
```

## Component Documentation

### Component Structure
Each component should have:
- A dedicated directory
- Main component file (`ComponentName.jsx`)
- Styles (`ComponentName.module.scss`)
- Tests (`ComponentName.test.jsx`)
- Documentation (`README.md`)

### Props Documentation
Use JSDoc for component props documentation:

```jsx
/**
 * Button Component
 * @param {Object} props
 * @param {string} props.variant - Button style variant
 * @param {boolean} props.disabled - Disable state
 * @param {Function} props.onClick - Click handler
 */
const Button = ({ variant, disabled, onClick }) => (
  // ...
);
```

## State Management

### Context API
- Used for global state management
- Each context should be in its own file in `contexts/`
- Follow the Provider/Consumer pattern

### Local State
- Use `useState` for component-level state
- Use `useReducer` for complex state logic

## API Integration

### API Client
- API calls are made through a centralized client
- Error handling and loading states are managed

### Data Fetching
- Use React Query for server state management
- Cache invalidation strategies in place

## Development Guidelines

### Code Style
- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use ESLint and Prettier for code formatting

### Testing
- Write unit tests with Jest and React Testing Library
- Test coverage threshold: 80% minimum

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style updates
- `refactor:` Code changes that neither fix bugs nor add features
- `test:` Adding tests
- `chore:` Changes to build process or auxiliary tools

## Getting Started

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0

### Installation
```bash
npm install
npm run dev
```

### Building for Production
```bash
npm run build
npm run preview
```

## License
[Specify your license here]
