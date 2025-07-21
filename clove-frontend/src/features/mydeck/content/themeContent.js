/**
 * @file themeContent.js
 * @description Theme-specific content configurations for the MyDeck feature.
 */

/**
 * @typedef {Object} ThemeCard
 * @property {string} icon
 * @property {string} title
 * @property {string} description
 * @property {string[]} [badges]
 * @property {string[]} [codeLines]
 */

/**
 * @typedef {Object} ThemeContent
 * @property {string} heading
 * @property {string} subtitle
 * @property {string} mainIcon
 * @property {string} storyIcon
 * @property {Object} story
 * @property {Object} cta
 * @property {ThemeCard[]} cards
 * @property {string} [theme]
 */

// Icon mapping for FontAwesome
export const iconMap = {
  // Wizard Theme Icons
  'hat-wizard': 'faHatWizard',
  scroll: 'faScroll',
  'circle-nodes': 'faCircleNodes',
  'wand-sparkles': 'faWandSparkles',
  gem: 'faGem',
  'book-tanakh': 'faBookTanakh',

  // Detective Theme Icons
  fingerprint: 'faFingerprint',
  'magnifying-glass': 'faMagnifyingGlass',
  'folder-open': 'faFolderOpen',

  // Space Theme Icons
  rocket: 'faRocket',
  code: 'faCode',
  database: 'faDatabase',
  dna: 'faDna',
  satellite: 'faSatellite',

  // General Icons
  play: 'faPlay',
};

/**
 * Get content for a specific theme.
 * @param {string} [theme="default"]
 * @returns {ThemeContent}
 */
export const getThemeContent = (theme = 'default') => {
  const content = themeContent[theme] || themeContent.default;
  return {
    ...content,
    cards: content.cards || [],
  };
};

// --- Theme Content ---
export const themeContent = {
  wizard: {
    heading: 'Wizard Academy',
    subtitle: 'Mastering Magical Data Types',
    mainIcon: 'hat-wizard',
    storyIcon: 'scroll',
    story: {
      title: 'The Arcane Academy',
      paragraphs: [
        'Welcome to the prestigious Arcane Academy, where the most promising young wizards come to master the mystical arts of Java. As a first-year apprentice, you\'ll begin your journey by learning to harness the fundamental forces of magic through variables and data types.',
        'In this enchanted realm, variables are your magical conduits, and data types are the elemental essences you\'ll learn to control. Your instructors, the Archmages of the Order of the JVM, will guide you through the ancient incantations and rituals needed to manipulate these powerful forces.',
      ],
    },
    cta: {
      label: 'Begin Your Training',
      ariaLabel: 'Begin your magical training',
      icon: 'book-tanakh',
    },
    cards: [
      {
        icon: 'circle-nodes',
        title: 'Casting Spells',
        description: 'Declare your magical intentions with precise incantations.',
        codeLines: ['int manaPool = 100;', 'String spellName = "Fireball";'],
      },
      {
        icon: 'wand-sparkles',
        title: 'Elemental Essences',
        description: 'Harness the basic building blocks of magic.',
        badges: ['char', 'float', 'long'],
      },
      {
        icon: 'gem',
        title: 'Ancient Artifacts',
        description: 'Utilize powerful objects with complex properties.',
        badges: ['Scroll', 'Grimoire', 'Potion'],
      },
    ],
  },
  detective: {
    heading: 'Noir Detective Agency',
    subtitle: 'Case Files: The Missing Data',
    mainIcon: 'magnifying-glass',
    storyIcon: 'folder-open',
    story: {
      title: 'The Case of the Vanishing Variables',
      paragraphs: [
        'The city streets are dark and full of bugs. You\'re a hard-boiled detective in a world where data is the most valuable currency. When a high-profile client reports missing variables and corrupted data types, it\'s up to you to crack the case.',
        'In this gritty underworld of ones and zeros, you\'ll need to use your sharp mind and keen eye for detail to track down the culprits. The trail leads through back-alley algorithms and shadowy data structures, but you\'re determined to get to the bottom of this mystery.',
      ],
    },
    cta: {
      label: 'Take the Case',
      ariaLabel: 'Take on the detective case',
      icon: 'fingerprint',
    },
    cards: [
      {
        icon: 'fingerprint',
        title: 'Gathering Clues',
        description: 'Collect evidence by declaring key variables.',
        codeLines: ['boolean hasAlibi = false;', 'String suspect = "Compiler";'],
      },
      {
        icon: 'magnifying-glass',
        title: 'Basic Evidence',
        description: 'Analyze the fundamental pieces of the puzzle.',
        badges: ['byte', 'short', 'char'],
      },
      {
        icon: 'folder-open',
        title: 'Case Files',
        description: 'Organize complex information with structured types.',
        badges: ['CaseFile', 'EvidenceLocker', 'Report'],
      },
    ],
  },
  space: {
    heading: 'Cosmic Variables Initiative',
    subtitle: 'Introductory System Briefing',
    mainIcon: 'rocket',
    storyIcon: 'satellite',
    story: {
      title: 'Mission Briefing',
      paragraphs: [
        'Stardate 2347.05: You\'ve just been appointed <em>Chief Systems Engineer</em> aboard the <em>SS JVM Horizon</em>, a starship heading into the vast unknown of the <em>Andromeda Sector</em>. Everything seemed calm until your first shift—then the alarms went off. The ship\'s systems, once in perfect harmony, are now malfunctioning. Readings are erratic, protocols are failing, and the AI can barely keep up.',
        "It's up to you to master Java's fundamental data types and bring the ship back online. By properly declaring and managing variables, you'll stabilize the core systems and get the crew back on course. The success of this mission—and the future of the Horizon—depends on you.",
      ],
    },
    cta: {
      label: 'Initialize Training Protocol',
      ariaLabel: 'Start the training protocol',
      icon: 'play',
    },
    cards: [
      {
        icon: 'code',
        title: 'Declaring Variables',
        description: 'Initialize core parameters with proper Java syntax',
        codeLines: ['double warpFactor = 9.9;', 'String destination = "Andromeda";'],
      },
      {
        icon: 'dna',
        title: 'Primitive Types',
        description: 'Used to monitor and control essential ship metrics',
        badges: ['int', 'double', 'boolean'],
      },
      {
        icon: 'database',
        title: 'Non-Primitive Types',
        description: 'Used for handling complex systems and input logs',
        badges: ['String', 'Array', 'Object'],
      },
    ],
  },
  default: {
    heading: '!! WARNING: THEME LOAD FAILURE !!',
    subtitle: 'Invalid or Missing Theme Detected',
    story: {
      title: 'Debug Alert: Fallback Theme Active',
      paragraphs: [
        'The application attempted to load a theme that is either not defined or has failed to load correctly. The system has reverted to this default debug theme.',
        'Check the theme name being passed to the `setTheme` function and ensure it is registered in `src/features/mydeck/styles/index.js`.',
      ],
    },
    cta: {
      label: 'Review Theme Configuration',
      ariaLabel: 'Review theme configuration files',
    },
    cards: [],
  },
};
