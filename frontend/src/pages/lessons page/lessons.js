export const lessons = {
  // Topic 1: Conditional Statements and Loops
  // "Conditional Statements and ": {
  topic1: {
    // Subtopic: Intro (if/else)
    intro: {
      title: "If/Else Statements",
      intro:
        "Captain's log: Conditional statements are like the navigation system of your spaceship...",
      objectives: [
        "Understand basic conditional logic",
        "Master if/else syntax",
        "Apply conditions to control program flow",
      ],
      sections: [
        {
          heading: "Basic Conditionals",
          thematicIntro:
            "Just as your spaceship makes decisions based on sensor readings...",
          subheading: "If Statement Syntax",
          icon: "🛰️",
          content:
            "The basic if statement evaluates a condition and executes code if true:",
          code: `if (fuelLevel < 20) {\n  alert("Warning: Low fuel!");\n}`,
        },
        {
          heading: "Advanced Conditions",
          thematicIntro: "Space navigation requires complex decision trees...",
          subheading: "If-Else Ladders",
          icon: "⚠️",
          content: "Handle multiple conditions with else-if:",
          code: `if (distance > 1000) {\n  setWarpSpeed(9);\n} else if (distance > 500) {\n  setWarpSpeed(6);\n} else {\n  setWarpSpeed(3);\n}`,
        },
      ],
    },
    // Subtopic: For Loops
    forloops: {
      title: "For Loops",
      intro:
        "Captain's log: Automated repetition is essential for deep space operations...",
      objectives: [
        "Understand loop mechanics",
        "Control iterations with precision",
        "Apply loops to process data",
      ],
      sections: [
        {
          heading: "Basic Looping",
          thematicIntro:
            "Like your ship's auto-pilot repeating course corrections...",
          subheading: "For Loop Structure",
          icon: "🔄",
          content: "The standard for loop has three parts:",
          code: `for (let i = 0; i < 5; i++) {\n  console.log("Engage thruster " + i);\n}`,
        },
      ],
    },
    // Add other subtopics...
  },
  // Topic 2: Data Structures
  "Data Structures": {
    // Subtopic definitions...
  },
};
