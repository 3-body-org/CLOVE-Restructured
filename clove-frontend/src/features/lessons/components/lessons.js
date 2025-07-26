export const lessons = {
  topic1: {
    declaringvariables: {
      title: "Declaring Variables",
      intro:
        "Captain's log: Variables are like containers in your spaceship's cargo hold. They store critical data for your mission...",
      objectives: [
        "Understand Java variable declaration",
        "Master primitive vs. reference types",
        "Apply variables in type-safe Java code",
      ],
      sections: [
        {
          heading: "Variable Basics",
          thematicIntro:
            "Just as you label cargo containers for efficient storage...",
          subheading: "Declaration Syntax",
          icon: "📦",
          content: "Java variables require explicit type declaration:",
          code: `int fuelLevel = 100;          // Primitive type\nfinal String SHIP_NAME = "Nebula Runner"; // Final (immutable)\nObject legacySystem = null;      // Reference type`,
        },
        {
          heading: "Scope Rules",
          thematicIntro:
            "Like different security clearance levels on your spaceship...",
          subheading: "Block vs. Class Scope",
          icon: "🔒",
          content: "Java variables are block-scoped:",
          code: `if (missionActive) {\n  int secretCode = 42; // Only exists here\n  System.out.println(secretCode);\n}\n// System.out.println(secretCode); // ERROR! Out of scope`,
        },
      ],
    },

    // Subtopic 2: Primitive Data Types
    primitivedatatypes: {
      title: "Primitive Data Types",
      intro:
        "Captain's log: These are the fundamental elements of your ship's computer core. Simple but essential...",
      objectives: [
        "Identify all 8 primitive types",
        "Understand fixed memory allocation",
        "Avoid type conversion errors",
      ],
      sections: [
        {
          heading: "Core Primitives",
          thematicIntro:
            "Like the elemental particles that make up your fuel mixture...",
          subheading: "Type Overview",
          icon: "⚛️",
          content: "Java has 8 primitive types:",
          code: `int warpSpeed = 9;          // 32-bit integer\ndouble shieldPower = 99.9;    // 64-bit floating-point\nchar shipClass = 'A';        // 16-bit Unicode\nboolean shieldsUp = true;    // true/false\nbyte alertStatus = 127;      // 8-bit integer\nshort crewCount = 150;       // 16-bit integer\nlong starCoordinates = 999999999L; // 64-bit integer\nfloat temperature = -273.15f; // 32-bit floating-point`,
        },
        {
          heading: "Type Safety",
          thematicIntro:
            "Like ensuring your fuel and oxygen lines don't get crossed...",
          subheading: "Strong Typing",
          icon: "⚠️",
          content: "Java is strictly typed:",
          code: `int cargo = 42;\n// cargo = "Dilithium Crystals"; // COMPILER ERROR!`,
        },
      ],
    },

    // Subtopic 3: Reference Data Types
    nonprimitivedatatypes: {
      title: "Reference Data Types",
      intro:
        "Captain's log: Objects are like your ship's navigation matrix - powerful but requiring careful handling...",
      objectives: [
        "Master object instantiation",
        "Understand heap memory allocation",
        "Manipulate complex data structures",
      ],
      sections: [
        {
          heading: "Objects",
          thematicIntro:
            "Like your ship's main computer database with keyed records...",
          subheading: "Class Instances",
          icon: "🗃️",
          content: "Objects are instances of classes:",
          code: `class CrewMember {\n  String name;\n  String rank;\n}\n\nCrewMember captain = new CrewMember();\ncaptain.name = "Picard";\ncaptain.rank = "Captain";`,
        },
        {
          heading: "Arrays",
          thematicIntro:
            "Like the ordered cargo bays in your ship's storage deck...",
          subheading: "Array Declaration",
          icon: "📊",
          content: "Fixed-size, type-safe collections:",
          code: `String[] cargoBay = {"Photon Torpedoes", "Medical Supplies"};\nint[] shieldFrequencies = new int[3]; // [0, 0, 0]`,
        },
        {
          heading: "Reference Behavior",
          thematicIntro:
            "Like creating duplicates of your ship's navigation charts...",
          subheading: "Object References",
          icon: "🧪",
          content: "Objects are accessed by reference:",
          code: `CrewMember firstOfficer = new CrewMember();\nCrewMember secondOfficer = firstOfficer; // Same object!\nsecondOfficer.rank = "Commander"; // Affects both references`,
        },
      ],
    },
  },
};
