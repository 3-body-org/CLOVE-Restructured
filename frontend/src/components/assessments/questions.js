// questions.js
export const questions = {
  // Basic Loops
  "basicLoops": [
    {
      "id": 1,
      "question": "How many times will the following loop run?\n\nfor (int i = 0; i < 5; i++) {\n    System.out.println(i);\n}",
      "options": ["4", "5", "6", "0"],
      "answer": "5"
    },
    {
      "id": 2,
      "question": "What is the output?\n\nint i = 0;\nwhile (i < 3) {\n    System.out.print(i);\n    i++;\n}",
      "options": ["123", "012", "0123", "01"],
      "answer": "012"
    },
    {
      "id": 4,
      "question": "What is the output?\n\nfor (int i = 10; i >= 8; i--) {\n    System.out.print(i);\n}",
      "options": ["1098", "10 9 8", "8 9 10", "None"],
      "answer": "1098"
    },
    {
      "id": 6,
      "question": "What is the output?\n\nint i = 1;\ndo {\n    System.out.print(i);\n    i++;\n} while (i < 4);",
      "options": ["123", "0123", "234", "None"],
      "answer": "123"
    },
    {
      "id": 7,
      "question": "Which loop is best when the number of iterations is known?",
      "options": ["while", "for", "do-while", "None"],
      "answer": "for"
    }
  ],
  // Conditional Statements
  "conditionalStatements": [
    {
      "id": 3,
      "question": "Which loop is guaranteed to execute at least once?",
      "options": ["for", "while", "do-while", "None"],
      "answer": "do-while"
    },
    {
      "id": 5,
      "question": "Which keyword is used to exit a loop immediately?",
      "options": ["continue", "return", "break", "exit"],
      "answer": "break"
    },
    {
      "id": 9,
      "question": "What is the output?\n\nfor (int i = 1; i <= 3; i++) {\n    if (i == 2) break;\n    System.out.print(i);\n}",
      "options": ["123", "1", "12", "Error"],
      "answer": "1"
    },
    {
      "id": 10,
      "question": "What is the output?\n\nfor (int i = 0; i < 3; i++) {\n    continue;\n    System.out.print(i);\n}",
      "options": ["012", "Nothing", "Error", "123"],
      "answer": "Nothing"
    },
    {
      "id": 11,
      "question": "Which loop is most suitable when the condition must be checked before execution?",
      "options": ["do-while", "for", "while", "goto"],
      "answer": "while"
    }
  ],
  // Advanced Loops
  "advancedLoops": [
    {
      "id": 8,
      "question": "What is the output?\n\nint i = 5;\nwhile (i < 5) {\n    System.out.print(i);\n    i++;\n}",
      "options": ["5", "Nothing", "Error", "Infinite loop"],
      "answer": "Nothing"
    },
    {
      "id": 12,
      "question": "What is the output?\n\nfor (int i = 0; i <= 5; i += 2) {\n    System.out.print(i);\n}",
      "options": ["024", "01234", "135", "02"],
      "answer": "024"
    },
    {
      "id": 13,
      "question": "Which of the following results in an infinite loop?",
      "options": [
        "for(int i=0;i<5;i++)",
        "while(true)",
        "do { i++; } while(i<3);",
        "for(int i=1;i<3;i++)"
      ],
      "answer": "while(true)"
    },
    {
      "id": 14,
      "question": "What is the value of i after the loop?\n\nint i = 0;\ndo {\n    i++;\n} while (i < 3);",
      "options": ["2", "3", "1", "0"],
      "answer": "3"
    },
    {
      "id": 15,
      "question": "What is the output?\n\nfor (int i = 1; i <= 4; i++) {\n    System.out.print(i + \" \");\n}",
      "options": ["1 2 3 4", "1234", "1 2 3", "Error"],
      "answer": "1 2 3 4"
    }
  ]
};
