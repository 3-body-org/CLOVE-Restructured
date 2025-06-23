// questions.js
export const questions = [
    {
      code: [
        "public class VariableAnalysis {",
        "    public static void main(String[] args) {",
        "        int a = 5;",
        "        int b = a++;",
        "        int c = ++a;",
        "        System.out.println(\"a: \" + a + \", b: \" + b + \", c: \" + c);",
        "    }",
        "}"
      ],
      question: "What will be the output of this code?",
      options: [
        { text: "a: 5, b: 5, c: 6", correct: false },
        { text: "a: 6, b: 5, c: 5", correct: false },
        { text: "a: 5, b: 6, c: 6", correct: false },
        { text: "a: 7, b: 5, c: 7", correct: true }
      ],
      explanation: "a++ is post-increment (returns 5 then increments), ++a is pre-increment (increments then returns 7)",
      variables: ['a', 'b', 'c']
    },
    {
      code: [
        "public class ReferenceTest {",
        "    public static void main(String[] args) {",
        "        String s1 = \"hello\";",
        "        String s2 = s1;",
        "        s1 = \"world\";",
        "        System.out.println(s2);",
        "    }",
        "}"
      ],
      question: "What will be printed?",
      options: [
        { text: "hello", correct: true },
        { text: "world", correct: false },
        { text: "helloworld", correct: false },
        { text: "null", correct: false }
      ],
      explanation: "Strings are immutable - s2 points to the original \"hello\" string",
      variables: ['s1', 's2']
    },
    {
      code: [
        "public class ArrayTest {",
        "    public static void main(String[] args) {",
        "        int[] arr = new int[3];",
        "        arr[0] = 1;",
        "        arr[1] = arr[0]++;",
        "        arr[2] = ++arr[0];",
        "        System.out.println(Arrays.toString(arr));",
        "    }",
        "}"
      ],
      question: "What will be the array contents?",
      options: [
        { text: "[1, 1, 2]", correct: false },
        { text: "[1, 1, 3]", correct: true },
        { text: "[2, 1, 3]", correct: false },
        { text: "[1, 2, 3]", correct: false }
      ],
      explanation: "arr[0]++ returns 1 then increments to 2, then ++arr[0] increments to 3 and returns 3",
      variables: ['arr[0]', 'arr[1]', 'arr[2]']
    },
    {
      code: [
        "public class ScopeTest {",
        "    static int x = 10;",
        "    public static void main(String[] args) {",
        "        int x = 20;",
        "        System.out.print(x + \" \");",
        "        System.out.print(ScopeTest.x);",
        "    }",
        "}"
      ],
      question: "What will be printed?",
      options: [
        { text: "10 10", correct: false },
        { text: "20 10", correct: true },
        { text: "10 20", correct: false },
        { text: "20 20", correct: false }
      ],
      explanation: "Local variable shadows the class variable - use class name to access static variable",
      variables: ['x', 'ScopeTest.x']
    },
    {
      code: [
        "public class FinalTest {",
        "    public static void main(String[] args) {",
        "        final int y = 5;",
        "        int z = y++;",
        "        System.out.println(z);",
        "    }",
        "}"
      ],
      question: "What will happen when this code runs?",
      options: [
        { text: "Prints 5", correct: false },
        { text: "Prints 6", correct: false },
        { text: "Compilation error", correct: true },
        { text: "Runtime exception", correct: false }
      ],
      explanation: "Cannot increment a final variable - compilation error",
      variables: ['y', 'z']
    }
  ];
  
  export const hints = [
    "Hint 1: Primitive types hold direct values.",
    "Hint 2: Reference types hold memory addresses.",
    "Hint 3: Default values: 0, false, or null.",
  ];