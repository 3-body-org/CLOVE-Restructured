export const challenges = {
  "Conditional Statements and Loops": {
    "If/Else Statements": {
      easy: [
        {
          id: 1,
          type: "CodeCompletion",
          question:
            "Fill in the missing condition to check if a number is greater than 100.",
          code: "if (number ____ 100) { console.log('Greater than 100'); }",
          answer: ">",
        },
        // {
        //   id: 2,
        //   type: "CodeTracing",
        //   question: "What will the output be when the following code is executed?",
        //   code: `
        //     int number = 50;
        //     if (number == 50) {
        //         console.log('Number is 50');
        //     } else {
        //         console.log('Number is not 50');
        //     }
        //   `,
        //   answer: "Number is 50"
        // },
        // {
        //   id: 3,
        //   type: "CodeFixer",
        //   question: "Fix the code to check if the number is exactly divisible by 4.",
        //   code: `
        //     int number = 16;
        //     if (number % 2 == 0) {
        //         console.log('Divisible by 4');
        //     }
        //   `,
        //   answer: "Change the condition to 'number % 4 == 0'."
        // }
      ],
      medium: [
        {
          id: 4,
          type: "CodeCompletion",
          question:
            "Complete the code to check if a number is negative, positive, or zero.",
          code: `
              int number = -7;
              if (number ____ 0) {
                  console.log('Positive');
              } else if (number ____ 0) {
                  console.log('Negative');
              } else {
                  console.log('Zero');
              }
            `,
          answer: ">, <",
        },
        // {
        //   id: 5,
        //   type: "CodeTracing",
        //   question: "What will the output be when the following code is executed?",
        //   code: `
        //     int number = 10;
        //     if (number > 5) {
        //         if (number < 15) {
        //             console.log('Between 5 and 15');
        //         } else {
        //             console.log('Greater than or equal to 15');
        //         }
        //     }
        //   `,
        //   answer: "Between 5 and 15"
        // },
        // {
        //   id: 6,
        //   type: "CodeFixer",
        //   question: "Fix the code to check if the number is divisible by both 3 and 5.",
        //   code: `
        //     int num = 15;
        //     if (num % 3 == 0) {
        //         if (num % 5 == 0) {
        //             console.log('Divisible by 3 and 5');
        //         } else {
        //             console.log('Divisible by 3 only');
        //         }
        //     }
        //   `,
        //   answer: "Add an 'else' clause to handle the case for divisibility by both 3 and 5."
        // }
      ],
      hard: [
        {
          id: 7,
          type: "CodeCompletion",
          question:
            "Complete the code to check if a given year is a leap year.",
          code: `
              int year = 2024;
              if ((year % 4 == 0) && (year % 100 != 0 || year % 400 == 0)) {
                  console.log('Leap Year');
              } else {
                  console.log('Not a Leap Year');
              }
            `,
          answer: "complete with correct leap year logic.",
        },
        // {
        //   id: 8,
        //   type: "CodeTracing",
        //   question: "What will the output be when the following code is executed?",
        //   code: `
        //     int number = 18;
        //     if (number % 2 == 0) {
        //         if (number % 3 == 0) {
        //             console.log('Divisible by 2 and 3');
        //         } else {
        //             console.log('Divisible by 2 but not 3');
        //         }
        //     } else {
        //         console.log('Not divisible by 2');
        //     }
        //   `,
        //   answer: "Divisible by 2 and 3"
        // },
        // {
        //   id: 9,
        //   type: "CodeFixer",
        //   question: "Fix the code to check if a number is divisible by 2, 3, and 5.",
        //   code: `
        //     int num = 30;
        //     if (num % 2 == 0) {
        //         if (num % 5 == 0) {
        //             console.log('Divisible by 2 and 5');
        //         }
        //     }
        //   `,
        //   answer: "Add an additional check for divisibility by 3: 'if (num % 3 == 0)'."
        // }
      ],
    },
    "For Loops": {
      easy: [
        {
          id: 10,
          type: "CodeCompletion",
          question:
            "Complete the code to print numbers from 1 to 5 using a 'for' loop.",
          code: "for (int i = 1; i ____ 5; i++) { console.log(i); }",
          answer: "<=",
        },
        {
          id: 11,
          type: "CodeTracing",
          question:
            "What will the output be when the following code is executed?",
          code: `
              int sum = 0;
              for (int i = 1; i <= 3; i++) {
                  sum += i;
              }
              console.log(sum);
            `,
          answer: "6",
        },
        {
          id: 12,
          type: "CodeFixer",
          question: "Fix the code to print all even numbers between 1 and 10.",
          code: `
              for (int i = 1; i < 10; i++) {
                  if (i % 2 != 0) {
                      console.log(i);
                  }
              }
            `,
          answer: "Change the condition to 'i % 2 == 0'.",
        },
      ],
      medium: [
        {
          id: 13,
          type: "CodeCompletion",
          question:
            "Complete the code to calculate the factorial of a number using a 'for' loop.",
          code: `
              int num = 5;
              int result = 1;
              for (int i = 1; i ____ num; i++) {
                  result *= i;
              }
              console.log(result);
            `,
          answer: "<=",
        },
        {
          id: 14,
          type: "CodeTracing",
          question:
            "What will the output be when the following code is executed?",
          code: `
              int product = 1;
              for (int i = 1; i <= 3; i++) {
                  product *= i;
              }
              console.log(product);
            `,
          answer: "6",
        },
        {
          id: 15,
          type: "CodeFixer",
          question:
            "Fix the code to print the sum of all odd numbers between 1 and 20.",
          code: `
              int sum = 0;
              for (int i = 1; i <= 20; i++) {
                  if (i % 2 == 0) {
                      sum += i;
                  }
              }
              console.log(sum);
            `,
          answer: "Change the condition to 'i % 2 != 0'.",
        },
      ],
      hard: [
        {
          id: 16,
          type: "CodeCompletion",
          question:
            "Complete the code to print the first 10 terms of the Fibonacci sequence using a 'for' loop.",
          code: `
              int n = 10;
              int a = 0, b = 1;
              for (int i = 0; i < n; i++) {
                  console.log(a + ' ');
                  a = b;
                  b = a + b;
              }
            `,
          answer: "Complete Fibonacci logic.",
        },
        {
          id: 17,
          type: "CodeTracing",
          question:
            "What will the output be when the following code is executed?",
          code: `
              int num = 1;
              for (int i = 0; i < 5; i++) {
                  num *= 2;
                  console.log(num);
              }
            `,
          answer: "2, 4, 8, 16, 32",
        },
        {
          id: 18,
          type: "CodeFixer",
          question:
            "Fix the code to print the multiplication table of 5 (from 5x1 to 5x10).",
          code: `
              for (int i = 1; i <= 10; i++) {
                  console.log(5 * i);
              }
            `,
          answer: "This code is already correct.",
        },
      ],
    },
    "While Loops": {
      easy: [
        {
          id: 19,
          type: "CodeCompletion",
          question:
            "Complete the code to print numbers from 1 to 3 using a 'while' loop.",
          code: "int i = 1; while (i ____ 3) { console.log(i); i++; }",
          answer: "<=",
        },
        {
          id: 20,
          type: "CodeTracing",
          question:
            "What will the output be when the following code is executed?",
          code: `
              int i = 1;
              while (i < 4) {
                  console.log(i);
                  i++;
              }
            `,
          answer: "1, 2, 3",
        },
        {
          id: 21,
          type: "CodeFixer",
          question: "Fix the code to print all odd numbers between 1 and 10.",
          code: `
              int i = 1;
              while (i < 10) {
                  if (i % 2 == 0) {
                      console.log(i);
                  }
                  i++;
              }
            `,
          answer: "Change the condition to 'i % 2 != 0'.",
        },
      ],
      medium: [
        {
          id: 22,
          type: "CodeCompletion",
          question:
            "Complete the code to calculate the sum of all even numbers between 1 and 20 using a 'while' loop.",
          code: `
              int i = 1;
              int sum = 0;
              while (i ____ 20) {
                  if (i % 2 == 0) {
                      sum += i;
                  }
                  i++;
              }
              console.log(sum);
            `,
          answer: "<=",
        },
        // {
        //   id: 23,
        //   type: "CodeTracing",
        //   question:
        //     "What will the output be when the following code is executed?",
        //   code: `
        //       int sum = 0;
        //       int i = 1;
        //       while (i <= 5) {
        //           sum += i;
        //           i++;
        //       }
        //       console.log(sum);
        //     `,
        //   answer: "15",
        // },
        // {
        //   id: 24,
        //   type: "CodeFixer",
        //   question:
        //     "Fix the code to print the sum of numbers divisible by 3 between 1 and 30.",
        //   code: `
        //       int sum = 0;
        //       int i = 1;
        //       while (i <= 30) {
        //           if (i % 3 == 0) {
        //               sum += i;
        //           }
        //           i++;
        //       }
        //       console.log(sum);
        //     `,
        //   answer: "This code is already correct.",
        // },
      ],
      hard: [
        {
          id: 25,
          type: "CodeCompletion",
          question:
            "Complete the code to print the first 10 terms of the Fibonacci sequence using a 'while' loop.",
          code: `
              int n = 10;
              int a = 0, b = 1;
              int count = 0;
              while (count < n) {
                  console.log(a + ' ');
                  a = b;
                  b = a + b;
                  count++;
              }
            `,
          answer: "Complete Fibonacci logic.",
        },
        // {
        //   id: 26,
        //   type: "CodeTracing",
        //   question:
        //     "What will the output be when the following code is executed?",
        //   code: `
        //       int i = 1;
        //       int product = 1;
        //       while (i <= 4) {
        //           product *= i;
        //           i++;
        //       }
        //       console.log(product);
        //     `,
        //   answer: "24",
        // },
        // {
        //   id: 27,
        //   type: "CodeFixer",
        //   question: "Fix the code to calculate the sum of digits of a number.",
        //   code: `
        //       int num = 1234;
        //       int sum = 0;
        //       while (num > 0) {
        //           sum += num % 10;
        //           num /= 10;
        //       }
        //       console.log(sum);
        //     `,
        //   answer: "This code is correct.",
        // },
      ],
    },
  },
};
