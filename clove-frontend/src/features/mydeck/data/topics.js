// Topics data for MyDeck feature
export const topicsData = [
  {
    id: 1,
    slug: 'data-types-and-variables',
    title: 'Data Types and Variables',
    theme: 'wizard', // Topic 1: wizard theme
    description: "Understanding variables and different data types",
    icon: "code",
    subtopics: [
      {
        id: 1,
        title: "Variables and Data Types",
        description: "Understanding variables and different data types",
        completed: false
      },
      {
        id: 2,
        title: "Control Structures",
        description: "Learn about loops and conditionals",
        completed: false
      }
    ]
  },
  {
    id: 2,
    slug: 'operators',
    title: 'Operators',
    theme: 'detective', // Topic 2: detective/noir theme
    description: "Learn about loops and conditionals",
    icon: "globe",
    subtopics: [
      {
        id: 3,
        title: "HTML Basics",
        description: "Structure your web content",
        completed: false
      },
      {
        id: 4,
        title: "CSS Styling",
        description: "Make your websites beautiful",
        completed: false
      }
    ]
  },
  {
    id: 3,
    slug: 'control-flow',
    title: 'Control Flow',
    theme: 'space', // Topic 3: space theme
    description: "Develop your analytical thinking",
    icon: "puzzle-piece",
    subtopics: [
      {
        id: 5,
        title: "Algorithm Design",
        description: "Learn to design efficient algorithms",
        completed: false
      },
      {
        id: 6,
        title: "Data Structures",
        description: "Understand how to organize data",
        completed: false
      }
    ]
  }
];

export default topicsData;
