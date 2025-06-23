export const AssessmentData = {
  topic: "Data Types and Variables",
  subtopics: [
    {
      title: "Declaring Variables",
      questions: {
        easy: [
          {
            question: "Which keyword is used to declare an integer variable?",
            options: ["int", "num", "number", "integer"],
            answer: "int"
          },
          {
            question: "Which of the following is a valid variable name in Java?",
            options: ["1number", "number_one", "float%", "void"],
            answer: "number_one"
          },
          {
            question: "What character is allowed in a variable name?",
            options: ["@", "#", "_", "!"],
            answer: "_"
          },
          {
            question: "Which of the following is NOT a valid Java variable declaration?",
            options: [
              "int x = 10;",
              "char letter = 'A';",
              "float pi = 3.14;",
              'String 1name = "John";'
            ],
            answer: 'String 1name = "John";'
          },
          {
            question: "How do you declare a constant in Java?",
            options: [
              "const int x = 5;",
              "final int x = 5;",
              "static int x = 5;",
              "permanent int x = 5;"
            ],
            answer: "final int x = 5;"
          }
        ],
        medium: [
          {
            question:
              "What happens when you declare a local variable without initializing it and try to use it?",
            options: [
              "Default value is assigned",
              "Compilation error",
              "Runtime error",
              "Null is assigned"
            ],
            answer: "Compilation error"
          },
          {
            question: "Which of these is true about variable scope?",
            options: [
              "Local variables are accessible anywhere in the class",
              "Instance variables override local variables",
              "A variable declared in a method is accessible only inside that method",
              "All variables are accessible globally"
            ],
            answer: "A variable declared in a method is accessible only inside that method"
          },
          {
            question: "Which declaration is valid for multiple variables in one line?",
            options: [
              "int a = 5, b = 6;",
              "int = a, b;",
              "int a; int = b;",
              "int a b = 5;"
            ],
            answer: "int a = 5, b = 6;"
          },
          {
            question: "What is the default value of an instance variable of type String?",
            options: ['""', "null", '"null"', "Not initialized"],
            answer: "null"
          },
          {
            question: "Which keyword makes a variable shared across all objects of a class?",
            options: ["const", "global", "static", "shared"],
            answer: "static"
          }
        ],
        hard: [
          {
            question: "Which of the following is true about variable shadowing in Java?",
            options: [
              "Local variables override global variables automatically",
              "A local variable can hide an instance variable with the same name",
              "You can declare the same variable name twice in the same method",
              "Shadowing causes runtime errors"
            ],
            answer: "A local variable can hide an instance variable with the same name"
          },
          {
            question: "What is the outcome when you declare two variables with the same name in the same scope?",
            options: [
              "Both are valid",
              "It causes a compilation error",
              "The latest one overrides the previous",
              "Java picks one randomly"
            ],
            answer: "It causes a compilation error"
          },
          {
            question: "Which modifier ensures that a variable's value cannot be changed after initialization?",
            options: ["static", "const", "final", "readonly"],
            answer: "final"
          },
          {
            question: "Which of the following is NOT a valid reason to use a static variable?",
            options: [
              "Memory efficiency",
              "Shared values",
              "Instance-specific logic",
              "Utility constants"
            ],
            answer: "Instance-specific logic"
          },
          {
            question: "When does a variable become eligible for garbage collection?",
            options: [
              "When it is declared",
              "When it is reassigned",
              "When it is no longer referenced",
              "When its value is 0"
            ],
            answer: "When it is no longer referenced"
          }
        ]
      }
    },
    {
      title: "Primitive Data Types",
      questions: {
        easy: [
          {
            question: "Which of these is a primitive data type?",
            options: ["ArrayList", "String", "int", "Scanner"],
            answer: "int"
          },
          {
            question: "Which data type stores true/false values?",
            options: ["char", "boolean", "int", "byte"],
            answer: "boolean"
          },
          {
            question: "Which primitive data type stores characters?",
            options: ["int", "boolean", "char", "String"],
            answer: "char"
          },
          {
            question: "How many bytes does an int occupy in memory?",
            options: ["1", "2", "4", "8"],
            answer: "4"
          },
          {
            question: "What is the default value of an int in a class?",
            options: ["0", "null", "-1", "undefined"],
            answer: "0"
          }
        ],
        medium: [
          {
            question: "Which types automatically convert to int during arithmetic?",
            options: [
              "byte, short, and char",
              "int and long",
              "float and double",
              "boolean and byte"
            ],
            answer: "byte, short, and char"
          },
          {
            question: "Which of the following can hold decimal values?",
            options: ["byte", "int", "float", "char"],
            answer: "float"
          },
          {
            question: "Which of the following has the largest range?",
            options: ["int", "long", "float", "byte"],
            answer: "long"
          },
          {
            question: "What is the default value of a boolean in a class variable?",
            options: ["false", "true", "null", "undefined"],
            answer: "false"
          },
          {
            question: "Which data type is used for single-precision floating-point numbers?",
            options: ["float", "double", "int", "long"],
            answer: "float"
          }
        ],
        hard: [
          {
            question: "Which of the following primitive types is unsigned in Java?",
            options: ["short", "char", "int", "byte"],
            answer: "char"
          },
          {
            question: "Which conversion can cause data loss?",
            options: ["int to long", "float to double", "double to int", "short to int"],
            answer: "double to int"
          },
          {
            question: "What happens when a byte value exceeds its limit (e.g., 127 + 1)?",
            options: ["Sets to 128", "Overflows to -128", "Compiler error", "Resets to zero"],
            answer: "Overflows to -128"
          },
          {
            question: "Which primitive data type offers the highest precision for decimals?",
            options: ["float", "double", "long", "int"],
            answer: "double"
          },
          {
            question: "Which of the following cannot be used in a switch before Java 7?",
            options: ["char", "int", "String", "byte"],
            answer: "String"
          }
        ]
      }
    },
    {
      title: "Non-Primitive Data Types",
      questions: {
        easy: [
          {
            question: "Which of these is a non-primitive data type?",
            options: ["int", "double", "String", "boolean"],
            answer: "String"
          },
          {
            question: "What do non-primitive types store?",
            options: [
              "Direct values",
              "Memory addresses",
              "Multiple values only",
              "Just characters"
            ],
            answer: "Memory addresses"
          },
          {
            question: "Which of these types stores a collection of elements?",
            options: ["List", "int", "boolean", "char"],
            answer: "List"
          },
          {
            question: "What is the default value of an object reference in Java?",
            options: ['""', "null", "0", "false"],
            answer: "null"
          },
          {
            question: "Which type is used for changing string values efficiently?",
            options: ["String", "StringBuilder", "final String", "Character"],
            answer: "StringBuilder"
          }
        ],
        medium: [
          {
            question: "Which method compares string contents?",
            options: ["==", "equals()", "compare()", "compareWith()"],
            answer: "equals()"
          },
          {
            question: "Which class wraps the int primitive type?",
            options: ["Int", "Integer", "Number", "IntWrapper"],
            answer: "Integer"
          },
          {
            question: "What is true about arrays in Java?",
            options: [
              "They grow automatically",
              "They store mixed data types",
              "They are fixed in size",
              "They are primitive"
            ],
            answer: "They are fixed in size"
          },
          {
            question: "Which non-primitive type does not allow duplicate values?",
            options: ["List", "Set", "Map", "Array"],
            answer: "Set"
          },
          {
            question: "Which class is used for key-value pairs?",
            options: ["Set", "List", "Map", "Queue"],
            answer: "Map"
          }
        ],
        hard: [
          {
            question: "What is the behavior of == when comparing two different String objects with the same text?",
            options: [
              "Always returns true",
              "Returns false",
              "Compares content",
              "Throws error"
            ],
            answer: "Returns false"
          },
          {
            question: "Which class is thread-safe but less efficient than StringBuilder?",
            options: ["StringBuffer", "ArrayList", "String", "Character"],
            answer: "StringBuffer"
          },
          {
            question: "Which non-primitive type is immutable?",
            options: ["String", "StringBuilder", "List", "Map"],
            answer: "String"
          },
          {
            question: "Which collection type allows fast key-based lookup?",
            options: ["Set", "List", "Array", "HashMap"],
            answer: "HashMap"
          },
          {
            question: "Which is NOT a characteristic of non-primitive types?",
            options: ["Can be null", "Are objects", "Stored in the stack", "Have methods"],
            answer: "Stored in the stack"
          }
        ]
      }
    }
  ]
};

