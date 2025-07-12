import iconAssessment from 'assets/icons/loops/icon-subtopic-assessment.svg';
import icon1 from 'assets/icons/loops/icon-subtopic-1.svg';
import icon2 from 'assets/icons/loops/icon-subtopic-2.svg';
import icon3 from 'assets/icons/loops/icon-subtopic-3.svg';
import pathRight from 'assets/icons/loops/icon-subtopic-right-path.svg';
import pathMiddle from 'assets/icons/loops/icon-subtopic-middle-path.svg';
import pathLeft from 'assets/icons/loops/icon-subtopic-left-path.svg';

export const subtopicContent = {
  wizard: {
    story: {
      title: "The Arcane Academy",
      description: "Welcome to the prestigious Arcane Academy, where the most promising young wizards come to master the mystical arts of Java. As a first-year apprentice, you'll begin your journey by learning to harness the fundamental forces of magic through variables and data types.",
    },
    subtopics: {
      "pre-assessment": {
        id: "preassessment",
        title: "Magical Aptitude Test",
        description: "Test your magical potential before beginning your training.",
        time: "5 min",
        image: iconAssessment,
        path: pathRight,
        requires: null,
        position: "center",
      },
      "declaring-variables": {
        id: "declaringvariables",
        title: "Casting Spells",
        description: "Learn to declare your magical intentions with precise incantations.",
        time: "10 min",
        image: icon1,
        path: pathMiddle,
        requires: "pre-assessment",
        position: "left",
      },
      "primitive-data-types": {
        id: "primitivedatatypes",
        title: "Elemental Essences",
        description: "Harness the basic building blocks of magic - numbers, strings, booleans.",
        time: "8 min",
        image: icon2,
        path: pathLeft,
        requires: "declaring-variables",
        position: "right",
      },
      "non-primitive-data-types": {
        id: "nonprimitivedatatypes",
        title: "Ancient Artifacts",
        description: "Utilize powerful objects with complex properties - arrays, objects, functions.",
        time: "12 min",
        image: icon3,
        path: pathRight,
        requires: "primitive-data-types",
        position: "center",
      },
      "post-assessment": {
        id: "postassessment",
        title: "Final Magical Test",
        description: "Test your knowledge after completing your magical training.",
        time: "5 min",
        image: iconAssessment,
        path: null,
        requires: null,
        position: "center",
      },
    },
    styling: {
      background: "stars",
      colors: {
        primary: "#6c5ce7",
        secondary: "#a29bfe",
      }
    }
  },
  detective: {
    story: {
      title: "The Case of the Missing Data",
      description: "The city streets are dark and full of bugs. You're a hard-boiled detective in a world where data is the most valuable currency. When a high-profile client reports missing variables and corrupted data types, it's up to you to crack the case.",
    },
    subtopics: {
      "pre-assessment": {
        id: "preassessment",
        title: "Evidence Collection",
        description: "Gather initial evidence about the case.",
        time: "5 min",
        image: iconAssessment,
        path: pathRight,
        requires: null,
        position: "center",
      },
      "declaring-variables": {
        id: "declaringvariables",
        title: "Gathering Clues",
        description: "Collect evidence by declaring key variables.",
        time: "10 min",
        image: icon1,
        path: pathMiddle,
        requires: "pre-assessment",
        position: "left",
      },
      "primitive-data-types": {
        id: "primitivedatatypes",
        title: "Basic Evidence",
        description: "Analyze the fundamental pieces of the puzzle.",
        time: "8 min",
        image: icon2,
        path: pathLeft,
        requires: "declaring-variables",
        position: "right",
      },
      "non-primitive-data-types": {
        id: "nonprimitivedatatypes",
        title: "Case Files",
        description: "Organize complex information with structured types.",
        time: "12 min",
        image: icon3,
        path: pathRight,
        requires: "primitive-data-types",
        position: "center",
      },
      "post-assessment": {
        id: "postassessment",
        title: "Final Report",
        description: "Submit your final case report.",
        time: "5 min",
        image: iconAssessment,
        path: null,
        requires: null,
        position: "center",
      },
    },
    styling: {
      background: "fog",
      colors: {
        primary: "#2d3436",
        secondary: "#636e72",
      }
    }
  },
  space: {
    story: {
      title: "Mission Briefing",
      description: "Stardate 2347.05: You've just been appointed Chief Systems Engineer aboard the SS JVM Horizon, a starship heading into the vast unknown of the Andromeda Sector. Everything seemed calm until your first shift—then the alarms went off.",
    },
    subtopics: {
      "pre-assessment": {
        id: "preassessment",
        title: "Systems Check",
        description: "Run initial diagnostics on ship systems.",
        time: "5 min",
        image: iconAssessment,
        path: pathRight,
        requires: null,
        position: "center",
      },
      "declaring-variables": {
        id: "declaringvariables",
        title: "Declaring Variables",
        description: "Initialize core parameters with proper Java syntax.",
        time: "10 min",
        image: icon1,
        path: pathMiddle,
        requires: "pre-assessment",
        position: "left",
      },
      "primitive-data-types": {
        id: "primitivedatatypes",
        title: "Primitive Types",
        description: "Used to monitor and control essential ship metrics.",
        time: "8 min",
        image: icon2,
        path: pathLeft,
        requires: "declaring-variables",
        position: "right",
      },
      "non-primitive-data-types": {
        id: "nonprimitivedatatypes",
        title: "Non-Primitive Types",
        description: "Used for handling complex systems and input logs.",
        time: "12 min",
        image: icon3,
        path: pathRight,
        requires: "primitive-data-types",
        position: "center",
      },
      "post-assessment": {
        id: "postassessment",
        title: "Mission Complete",
        description: "Final systems verification and mission debrief.",
        time: "5 min",
        image: iconAssessment,
        path: null,
        requires: null,
        position: "center",
      },
    },
    styling: {
      background: "stars",
      colors: {
        primary: "#0984e3",
        secondary: "#74b9ff",
      }
    }
  },
  default: {
    story: {
      title: "Learning Journey",
      description: "Welcome to your learning journey. Master the fundamentals step by step.",
    },
    subtopics: {
      "pre-assessment": {
        id: "preassessment",
        title: "Pre-Assessment Test",
        description: "Test your knowledge before starting the course.",
        time: "5 min",
        image: iconAssessment,
        path: pathRight,
        requires: null,
        position: "center",
      },
      "declaring-variables": {
        id: "declaringvariables",
        title: "Declaring Variables",
        description: "Declaring Variables: assigning values to variables.",
        time: "10 min",
        image: icon1,
        path: pathMiddle,
        requires: "pre-assessment",
        position: "left",
      },
      "primitive-data-types": {
        id: "primitivedatatypes",
        title: "Primitive Data Types",
        description: "Primitive Data Types: numbers, strings, booleans.",
        time: "8 min",
        image: icon2,
        path: pathLeft,
        requires: "declaring-variables",
        position: "right",
      },
      "non-primitive-data-types": {
        id: "nonprimitivedatatypes",
        title: "Non-Primitive Data Types",
        description: "Non-Primitive Data Types: arrays, objects, functions.",
        time: "12 min",
        image: icon3,
        path: pathRight,
        requires: "primitive-data-types",
        position: "center",
      },
      "post-assessment": {
        id: "postassessment",
        title: "Post-Assessment Test",
        description: "Test your knowledge after completing the course.",
        time: "5 min",
        image: iconAssessment,
        path: null,
        requires: null,
        position: "center",
      },
    },
    styling: {
      background: "stars",
      colors: {
        primary: "#6c5ce7",
        secondary: "#a29bfe",
      }
    }
  }
};

export const getSubtopicContent = (theme = "default") => subtopicContent[theme] || subtopicContent.default;
export const getAvailableThemes = () => Object.keys(subtopicContent); 