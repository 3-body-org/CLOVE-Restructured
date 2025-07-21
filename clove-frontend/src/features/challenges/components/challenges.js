export const challenges = {
  CodeFixer: {
    easy: [
      {
        id: 1,
        type: "CodeFixer",
        scenarioTitle: "🛠️ System Malfunction:",
        scenarioDescription: "The ThrusterController is malfunctioning. Restore the system by fixing all code errors so the spacecraft can safely maneuver.",
        question: "Fix the five errors in the ThrusterController class.",
        code: `public class ThrusterController {\n  private int[] thrusterPower = {0, 0, 0, 0};\n  public void setPower(int thruster, /*__INPUT_1__*/ power) {\n    if (thruster >= 0 /*__INPUT_2__*/ thruster < thrusterPower.length) {\n      thrusterPower[thruster] = /*__INPUT_3__*/;\n    }\n  }\n\n  public void fireThrusters(/*__INPUT_4__*/ duration) {\n    for (int i = 0; i < thrusterPower.length; i++) {\n      System.out.println("Thruster " + i + " firing at " + /*__INPUT_5__*/ + "% power");\n    }\n  }\n}`,
        answers: {
          fix1: "int",
          fix2: "&&",
          fix3: "power",
          fix4: "int",
          fix5: "thrusterPower[i]",
        },
        hints: [
          "Hint 1: Check the data types used for variables and method parameters. Are they consistent with their usage?",
          "Hint 2: Examine the logical operator in the `if` condition. Does it enforce both conditions correctly?",
          "Hint 3: A method is being called on a primitive data type as if it were an object. Identify where this occurs.",
        ],
      },
    ],
    medium: [],
    hard: [],
  },
  OutputTracing: {
    easy: [
      {
        id: 101,
        type: "OutputTracing",
        scenarioTitle: "🔍 Output Analysis:",
        scenarioDescription: "The navigation computer is producing unexpected outputs. Analyze the code and predict what will be printed to help the crew understand the system's behavior.",
        question: "What will be the output of this code?",
        code: `public class VariableAnalysis {\n    public static void main(String[] args) {\n        int a = 5;\n        int b = a++;\n        int c = ++a;\n        System.out.println("a: " + a + ", b: " + b + ", c: " + c);\n    }\n}`,
        answer: "a: 7, b: 5, c: 7",
      },
      {
        id: 102,
        type: "OutputTracing",
        scenarioTitle: "🔍 Output Analysis:",
        scenarioDescription: "The navigation computer is producing unexpected outputs. Analyze the code and predict what will be printed to help the crew understand the system's behavior.",
        question: "What will be printed?",
        code: `public class ReferenceTest {\n    public static void main(String[] args) {\n        String s1 = "hello";\n        String s2 = s1;\n        s1 = "world";\n        System.out.println(s2);\n    }\n}`,
        answer: "hello",
      },
    ],
    medium: [
      {
        id: 103,
        type: "OutputTracing",
        scenarioTitle: "🔍 Output Analysis:",
        scenarioDescription: "The navigation computer is producing unexpected outputs. Analyze the code and predict what will be printed to help the crew understand the system's behavior.",
        question: "What will be the array contents?",
        code: `public class ArrayTest {\n    public static void main(String[] args) {\n        int[] arr = new int[3];\n        arr[0] = 1;\n        arr[1] = arr[0]++;\n        arr[2] = ++arr[0];\n        System.out.println(java.util.Arrays.toString(arr));\n    }\n}`,
        answer: "[1, 1, 3]",
      },
    ],
    hard: [
      {
        id: 104,
        type: "OutputTracing",
        scenarioTitle: "🔍 Output Analysis:",
        scenarioDescription: "The navigation computer is producing unexpected outputs. Analyze the code and predict what will be printed to help the crew understand the system's behavior.",
        question: "What will be printed?",
        code: `public class ScopeTest {\n    static int x = 10;\n    public static void main(String[] args) {\n        int x = 20;\n        System.out.print(x + " ");\n        System.out.print(ScopeTest.x);\n    }\n}`,
        answer: "20 10",
      },
    ],
  },
  CodeCompletion: {
    easy: [
      {
        id: 201,
        type: "CodeCompletion",
        scenarioTitle: "🧪 Scenario:",
        scenarioDescription: "The Pathfinder’s Decision Core is confused. It needs to decide whether to activate shields based on the current threat level. However, part of its decision logic is missing. You must complete the core's code so it can react logically.",
        question:
          "Fill in the missing condition to check if a number is greater than 100.",
        code: "if (number ____ 100) { console.log('Greater than 100'); }",
        answer: ">",
      },
    ],
    medium: [
      {
        id: 202,
        type: "CodeCompletion",
        scenarioTitle: "🧪 Scenario:",
        scenarioDescription: "The Pathfinder’s Decision Core is confused. It needs to decide whether to activate shields based on the current threat level. However, part of its decision logic is missing. You must complete the core's code so it can react logically.",
        question:
          "Complete the code to check if a number is negative, positive, or zero.",
        code: `int number = -7;\nif (number ____ 0) {\n    console.log('Positive');\n} else if (number ____ 0) {\n    console.log('Negative');\n} else {\n    console.log('Zero');\n}`,
        answer: ">, <",
      },
    ],
    hard: [
      {
        id: 203,
        type: "CodeCompletion",
        scenarioTitle: "🧪 Scenario:",
        scenarioDescription: "The Pathfinder’s Decision Core is confused. It needs to decide whether to activate shields based on the current threat level. However, part of its decision logic is missing. You must complete the core's code so it can react logically.",
        question: "Complete the code to check if a given year is a leap year.",
        code: `int year = 2024;\nif ((year % 4 == 0) && (year % 100 != 0 || year % 400 == 0)) {\n    console.log('Leap Year');\n}`,
        answer: "",
      },
    ],
  },
};
