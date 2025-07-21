export const INSTRUCTION_MAP = {
  CodeCompletion: {
    title: "🧩 CODE COMPLETION",
    description: "Fill in the missing code blocks to complete the program logic as described in the scenario.",
  },
  CodeFixer: {
    title: "🛠️ CODE FIXER",
    description: "Identify and fix all errors in the code to restore correct functionality.",
  },
  OutputTracing: {
    title: "🔍 OUTPUT TRACING",
    description: "Analyze the code and predict the output that will be produced when it runs.",
  },
};

export const CODE_TEMPLATE = `public class SpacecraftNavigation {
  private double fuelEfficiency = 0.85;

  public double calculateSpeed(double fuel) {
    // Calculate speed using fuel and efficiency
    double speed = FIX_1;
    return speed;
  }

  public boolean checkFuel(double fuel) {
    // Check fuel level safety
    if (FIX_2) {
      System.out.println("WARNING: Low fuel!");
      return false;
    }
    return true;
  }

  public void adjustCourse(FIX_3 angle) {
    // Validate course adjustment
    if (angle > 30 || angle < -30) {
      throw new IllegalArgumentException("Adjustment too extreme");
    }
    this.courseAngle += angle;
  }
}`;

export const CHOICE_OPTIONS = {
  calculationChoices: [
    { value: "fuel * fuelEfficiency", fix: "FIX_1" },
    { value: "fuel / fuelEfficiency", fix: "FIX_1" },
    { value: "Math.sqrt(fuel)", fix: "FIX_1" },
    { value: "fuel + 10", fix: "FIX_1" },
    { value: "fuelEfficiency * 2", fix: "FIX_1" },
    { value: "0", fix: "FIX_1" },
    { value: "fuel - 1", fix: "FIX_1" }
  ],
  conditionChoices: [
    { value: "fuel < 15.0", fix: "FIX_2" },
    { value: "fuel > 100.0", fix: "FIX_2" },
    { value: "fuel == 0", fix: "FIX_2" },
    { value: "fuel != 10", fix: "FIX_2" },
    { value: "fuel <= 0", fix: "FIX_2" },
    { value: "fuel >= 100", fix: "FIX_2" },
    { value: "fuel === 15.0", fix: "FIX_2" }
  ],
  typeChoices: [
    { value: "double", fix: "FIX_3" },
    { value: "int", fix: "FIX_3" },
    { value: "float", fix: "FIX_3" },
    { value: "String", fix: "FIX_3" },
    { value: "boolean", fix: "FIX_3" },
    { value: "char", fix: "FIX_3" },
    { value: "Object", fix: "FIX_3" }
  ]
};

export const CORRECT_ANSWERS = {
  missing1: "fuel * fuelEfficiency",
  missing2: "fuel < 15.0",
  missing3: "double",
};

export const HINTS = [
  "Check the calculation logic",
  "Review the condition for low fuel", 
  "Ensure the correct data type for angle"
]; 