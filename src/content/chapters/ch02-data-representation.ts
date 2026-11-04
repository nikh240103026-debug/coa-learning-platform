import type { Chapter } from "@/lib/types";

const chapter: Chapter = {
  slug: "data-representation",
  number: 2,
  title: "Data Representation & Computer Arithmetic",
  summary:
    "How computers store numbers: number systems, complements, IEEE 754 floating point, Booth's multiplication, and restoring and non-restoring division.",
  estMinutes: 55,
  videoUrl: "",
  learningObjectives: [
    "Convert between binary, octal, decimal and hexadecimal",
    "Represent signed integers using 2's complement and detect overflow",
    "Encode and decode IEEE 754 single precision numbers",
    "Multiply signed numbers using Booth's algorithm",
    "Divide using the restoring and non-restoring algorithms",
  ],
  sections: [
    {
      id: "number-systems",
      title: "Number Systems",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "Computers store everything in binary. Octal and hexadecimal are shorthand: one octal digit equals 3 bits and one hex digit equals 4 bits.",
        },
        {
          type: "points",
          items: [
            "**Decimal to binary (integer part):** divide by 2 repeatedly and read the remainders from bottom to top.",
            "**Decimal to binary (fraction part):** multiply by 2 repeatedly and read the integer parts from top to bottom.",
            "**Binary to decimal:** add each bit multiplied by its place value.",
            "**Binary to hex:** group bits in fours from the binary point.",
          ],
        },
        {
          type: "example",
          title: "Convert 13.625 to binary and hex",
          steps: [
            "Integer part: 13 = 8 + 4 + 1 = `1101`.",
            "Fraction part: 0.625×2 = 1.25 (take 1), 0.25×2 = 0.5 (take 0), 0.5×2 = 1.0 (take 1), giving `.101`.",
            "Result: 13.625 = `1101.101` in binary.",
            "Hex: group as `1101.1010`, which gives D.A.",
          ],
        },
        {
          type: "callout",
          variant: "remember",
          text: "n bits can represent 2ⁿ distinct values. An unsigned n-bit range is 0 to 2ⁿ − 1.",
        },
      ],
    },
    {
      id: "signed-numbers",
      title: "Signed Numbers & Complements",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "There are three common ways to represent negative integers. 2's complement is used by almost all modern computers because it has one zero and uses the same adder for addition and subtraction.",
        },
        {
          type: "table",
          headers: ["Method", "Negative form of 5 (4 bits)", "Range for n bits", "Zeros"],
          rows: [
            ["Sign-magnitude", "`1101`", "−(2ⁿ⁻¹ − 1) to +(2ⁿ⁻¹ − 1)", "Two"],
            ["1's complement", "`1010`", "−(2ⁿ⁻¹ − 1) to +(2ⁿ⁻¹ − 1)", "Two"],
            ["2's complement", "`1011`", "−2ⁿ⁻¹ to +(2ⁿ⁻¹ − 1)", "One"],
          ],
        },
        {
          type: "callout",
          variant: "formula",
          text: "2's complement of X = invert all bits of X, then add 1. Subtraction: A − B = A + (2's complement of B)",
        },
        {
          type: "example",
          title: "Represent −13 in 8-bit 2's complement",
          steps: [
            "Write +13: `00001101`.",
            "Invert all bits: `11110010`.",
            "Add 1: `11110011`.",
            "Check: −128 + 64 + 32 + 16 + 2 + 1 = −13.",
          ],
        },
        {
          type: "paragraph",
          text: "**Overflow** occurs when a result does not fit in the available bits. In 2's complement it can only occur when two numbers of the same sign are added.",
        },
        {
          type: "callout",
          variant: "remember",
          text: "Overflow = carry into the sign bit XOR carry out of the sign bit. A carry out alone does not mean signed overflow.",
        },
        {
          type: "diagram",
          title: "Addition and subtraction in 2's complement",
          caption: "One adder handles both operations. Subtraction adds the 2's complement of the second operand.",
          kind: "flowchart",
          mermaid: `flowchart TD
  S1(["Start"]) --> OP{"Operation?"}
  OP -->|"Add"| ADD["Result = A + B"]
  OP -->|"Subtract"| COMP["Find 2's complement of B"]
  COMP --> SUB["Result = A + complement of B"]
  ADD --> OV{"Carry into sign differs from carry out?"}
  SUB --> OV
  OV -->|"Yes"| FLAG["Set overflow flag"]
  OV -->|"No"| OK["Result is valid"]
  FLAG --> DONE(["Stop"])
  OK --> DONE`,
        },
      ],
    },
    {
      id: "ieee-754",
      title: "IEEE 754 Floating Point",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "Floating point stores numbers in a binary form of scientific notation. IEEE 754 defines the layout so that all machines interpret the bits the same way.",
        },
        {
          type: "table",
          headers: ["Format", "Total bits", "Sign", "Exponent", "Fraction", "Bias"],
          rows: [
            ["Single", "32", "1", "8", "23", "127"],
            ["Double", "64", "1", "11", "52", "1023"],
          ],
        },
        {
          type: "callout",
          variant: "formula",
          text: "Value = (−1)^S × 1.F × 2^(E − bias), for normalized numbers",
        },
        {
          type: "diagram",
          title: "Encoding a number in IEEE 754",
          caption: "The leading 1 of a normalized number is implied, so it is not stored. This gains one extra bit of precision.",
          kind: "working-flowchart",
          mermaid: `flowchart TD
  A["Take the sign: S = 0 or 1"] --> B["Convert magnitude to binary"]
  B --> C["Normalize to 1.F times 2 to the power e"]
  C --> D["Biased exponent E = e + 127"]
  D --> E["Write E in 8 bits"]
  E --> F["Write F in 23 bits and pad with zeros"]
  F --> G["Combine S, E and F"]`,
        },
        {
          type: "example",
          title: "Encode −6.75 in single precision",
          steps: [
            "Sign: negative, so S = 1.",
            "Binary magnitude: 6.75 = `110.11`.",
            "Normalize: `1.1011` × 2².",
            "Biased exponent: E = 2 + 127 = 129 = `10000001`.",
            "Fraction: `10110000000000000000000` (23 bits).",
            "Result: `1 10000001 10110000000000000000000`, which is C0D80000 in hex.",
          ],
        },
        {
          type: "table",
          headers: ["Exponent bits", "Fraction bits", "Meaning"],
          rows: [
            ["All 0s", "All 0s", "Zero (positive or negative)"],
            ["All 0s", "Non-zero", "Denormalized number"],
            ["All 1s", "All 0s", "Infinity (positive or negative)"],
            ["All 1s", "Non-zero", "NaN (not a number)"],
            ["Others", "Any", "Normalized number"],
          ],
        },
        {
          type: "callout",
          variant: "exam-tip",
          text: "Students often forget the bias or store the leading 1. Use E = e + 127 for single precision and store only the bits after the binary point.",
        },
      ],
    },
    {
      id: "booth-algorithm",
      title: "Booth's Multiplication Algorithm",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "Booth's algorithm multiplies signed 2's complement numbers directly. It examines the current multiplier bit `Q0` and the previous bit `Q-1`, adding or subtracting only where a run of 1s begins or ends.",
        },
        {
          type: "table",
          headers: ["Q0", "Q-1", "Action"],
          rows: [
            ["0", "0", "No operation, then arithmetic shift right"],
            ["1", "1", "No operation, then arithmetic shift right"],
            ["1", "0", "A = A − M, then arithmetic shift right"],
            ["0", "1", "A = A + M, then arithmetic shift right"],
          ],
        },
        {
          type: "diagram",
          title: "Booth's algorithm",
          caption: "The loop runs once per multiplier bit. The final product is held in A and Q together.",
          kind: "working-flowchart",
          mermaid: `flowchart TD
  S1(["Start"]) --> INIT["A = 0, Q-1 = 0, M = multiplicand, Q = multiplier, Count = n"]
  INIT --> CHK{"Check Q0 and Q-1"}
  CHK -->|"1 0"| SUBM["A = A - M"]
  CHK -->|"0 1"| ADDM["A = A + M"]
  CHK -->|"0 0 or 1 1"| SHIFT["Arithmetic shift right A, Q, Q-1"]
  SUBM --> SHIFT
  ADDM --> SHIFT
  SHIFT --> DEC["Count = Count - 1"]
  DEC --> ZERO{"Count is zero?"}
  ZERO -->|"No"| CHK
  ZERO -->|"Yes"| DONE(["Product is in A and Q"])`,
        },
        {
          type: "example",
          title: "Multiply 5 × (−3) using 4 bits",
          steps: [
            "Setup: M = `0101`, −M = `1011`, Q = `1101`, A = `0000`, Q-1 = 0.",
            "Step 1: Q0 Q-1 = 10, so A = 0000 + 1011 = `1011`. Shift right: A = `1101`, Q = `1110`, Q-1 = 1.",
            "Step 2: Q0 Q-1 = 01, so A = 1101 + 0101 = `0010`. Shift right: A = `0001`, Q = `0111`, Q-1 = 0.",
            "Step 3: Q0 Q-1 = 10, so A = 0001 + 1011 = `1100`. Shift right: A = `1110`, Q = `0011`, Q-1 = 1.",
            "Step 4: Q0 Q-1 = 11, no operation. Shift right: A = `1111`, Q = `0001`, Q-1 = 1.",
            "Result: A Q = `11110001`, which equals −15. This is correct.",
          ],
        },
        {
          type: "callout",
          variant: "remember",
          text: "Arithmetic shift right copies the sign bit of A. The carry out of the addition in A is discarded.",
        },
      ],
    },
    {
      id: "division",
      title: "Restoring & Non-Restoring Division",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "Binary division repeatedly shifts and subtracts. A holds the partial remainder, Q holds the dividend and collects the quotient, and M holds the divisor.",
        },
        {
          type: "diagram",
          title: "Restoring division",
          caption: "If the subtraction makes A negative, the old value of A is restored and the quotient bit is 0.",
          kind: "working-flowchart",
          mermaid: `flowchart TD
  S1(["Start"]) --> INIT["A = 0, M = divisor, Q = dividend, Count = n"]
  INIT --> SHIFT["Shift left A and Q"]
  SHIFT --> SUB["A = A - M"]
  SUB --> NEG{"A is negative?"}
  NEG -->|"Yes"| REST["Q0 = 0 and A = A + M"]
  NEG -->|"No"| SET["Q0 = 1"]
  REST --> DEC["Count = Count - 1"]
  SET --> DEC
  DEC --> ZERO{"Count is zero?"}
  ZERO -->|"No"| SHIFT
  ZERO -->|"Yes"| DONE(["Quotient in Q, remainder in A"])`,
        },
        {
          type: "example",
          title: "Restoring division: 7 ÷ 3",
          steps: [
            "Setup: A = `00000`, Q = `0111`, M = `00011`, −M = `11101`.",
            "Step 1: shift gives A = `00000`, Q = `111_`. A − M = `11101` is negative. Restore A = `00000` and set Q = `1110`.",
            "Step 2: shift gives A = `00001`, Q = `110_`. A − M = `11110` is negative. Restore A = `00001` and set Q = `1100`.",
            "Step 3: shift gives A = `00011`, Q = `100_`. A − M = `00000` is not negative. Set Q = `1001`.",
            "Step 4: shift gives A = `00001`, Q = `001_`. A − M = `11110` is negative. Restore A = `00001` and set Q = `0010`.",
            "Result: quotient Q = `0010` = 2 and remainder A = `00001` = 1.",
          ],
        },
        {
          type: "paragraph",
          text: "**Non-restoring division** skips the restore step. If A is negative, it shifts and adds M in the next step. If A is positive, it shifts and subtracts M. A final correction is needed only if A ends up negative.",
        },
        {
          type: "diagram",
          title: "Non-restoring division",
          caption: "The sign of A decides whether to add or subtract in each step, which avoids extra restore additions.",
          kind: "working-flowchart",
          mermaid: `flowchart TD
  S1(["Start"]) --> INIT["A = 0, M = divisor, Q = dividend, Count = n"]
  INIT --> SIGN{"A is negative?"}
  SIGN -->|"Yes"| SA["Shift left A and Q, then A = A + M"]
  SIGN -->|"No"| SB["Shift left A and Q, then A = A - M"]
  SA --> Q0{"A is negative?"}
  SB --> Q0
  Q0 -->|"Yes"| ZEROBIT["Q0 = 0"]
  Q0 -->|"No"| ONEBIT["Q0 = 1"]
  ZEROBIT --> DEC["Count = Count - 1"]
  ONEBIT --> DEC
  DEC --> ZERO{"Count is zero?"}
  ZERO -->|"No"| SIGN
  ZERO -->|"Yes"| FINAL{"A is negative?"}
  FINAL -->|"Yes"| FIX["A = A + M"]
  FINAL -->|"No"| DONE(["Quotient in Q, remainder in A"])
  FIX --> DONE`,
        },
        {
          type: "example",
          title: "Non-restoring division: 7 ÷ 3",
          steps: [
            "Setup: A = `00000`, Q = `0111`, M = `00011`.",
            "Step 1: A is not negative. Shift gives A = `00000`, then A − M = `11101`. Negative, so Q = `1110`.",
            "Step 2: A is negative. Shift gives A = `11011`, then A + M = `11110`. Negative, so Q = `1100`.",
            "Step 3: A is negative. Shift gives A = `11101`, then A + M = `00000`. Not negative, so Q = `1001`.",
            "Step 4: A is not negative. Shift gives A = `00001`, then A − M = `11110`. Negative, so Q = `0010`.",
            "Correction: A is negative, so A + M = `00001`. Quotient = 2 and remainder = 1.",
          ],
        },
        {
          type: "table",
          headers: ["Feature", "Restoring", "Non-restoring"],
          rows: [
            ["Restore step", "Needed after each negative result", "Not needed in the loop"],
            ["Operations per step", "Subtract, and sometimes add", "One add or one subtract"],
            ["Final correction", "None", "Needed if A is negative"],
            ["Speed", "Slower on average", "Faster on average"],
          ],
        },
      ],
    },
  ],
  flashcards: [
    { front: "2's complement", back: "Invert all bits and add 1. It has one zero and a range of −2ⁿ⁻¹ to 2ⁿ⁻¹ − 1." },
    { front: "1's complement", back: "Invert all bits. It has two representations of zero." },
    { front: "Sign-magnitude", back: "The MSB is the sign and the remaining bits are the magnitude. It has two zeros." },
    { front: "Signed overflow", back: "Occurs when carry into the sign bit differs from carry out of it. Only possible when adding numbers of the same sign." },
    { front: "IEEE 754 single format", back: "1 sign bit, 8 exponent bits and 23 fraction bits, with a bias of 127." },
    { front: "IEEE 754 double format", back: "1 sign bit, 11 exponent bits and 52 fraction bits, with a bias of 1023." },
    { front: "Implied leading 1", back: "Normalized mantissas always begin with 1, so it is not stored. This gains one bit of precision." },
    { front: "NaN encoding", back: "Exponent all 1s with a non-zero fraction." },
    { front: "Infinity encoding", back: "Exponent all 1s with a zero fraction." },
    { front: "Booth: Q0 Q-1 = 10", back: "A = A − M, then arithmetic shift right." },
    { front: "Booth: Q0 Q-1 = 01", back: "A = A + M, then arithmetic shift right." },
    { front: "Restoring division", back: "Subtract M from A. If A is negative, add M back and set Q0 = 0. Otherwise set Q0 = 1." },
    { front: "Non-restoring division", back: "Add or subtract M based on the sign of A, with no restore in the loop and a final correction if A is negative." },
  ],
  quiz: [
    { id: "ch02-q01", question: "What is the 8-bit 2's complement representation of −20?", options: ["11101100", "11101011", "10010100", "00010100"], answerIndex: 0, explanation: "+20 = 00010100. Invert to get 11101011, then add 1 to get 11101100.", difficulty: "easy", topic: "2's Complement" },
    { id: "ch02-q02", question: "What is the range of an 8-bit 2's complement number?", options: ["−127 to +127", "−128 to +127", "−128 to +128", "0 to 255"], answerIndex: 1, explanation: "The range is −2⁷ to 2⁷ − 1, which is −128 to +127.", difficulty: "easy", topic: "2's Complement" },
    { id: "ch02-q03", question: "Which representation has only one value for zero?", options: ["Sign-magnitude", "1's complement", "2's complement", "All of these"], answerIndex: 2, explanation: "Sign-magnitude and 1's complement each have a positive and a negative zero.", difficulty: "easy", topic: "Signed Numbers" },
    { id: "ch02-q04", question: "In 4-bit 2's complement, 0101 + 0110 gives:", options: ["1011 with no overflow", "1011 with overflow", "0011 with overflow", "1011 with a carry out only"], answerIndex: 1, explanation: "5 + 6 = 11, which is outside the range −8 to +7. Two positives gave a negative result, so overflow occurred.", difficulty: "medium", topic: "Overflow" },
    { id: "ch02-q05", question: "What is the bias of the IEEE 754 single precision exponent?", options: ["128", "127", "1023", "255"], answerIndex: 1, explanation: "Single precision uses a bias of 127. Double precision uses 1023.", difficulty: "easy", topic: "IEEE 754" },
    { id: "ch02-q06", question: "How is +1.0 stored in IEEE 754 single precision hex?", options: ["3F800000", "40000000", "BF800000", "00000001"], answerIndex: 0, explanation: "S = 0, E = 127 = 01111111 and F = 0, which gives 3F800000.", difficulty: "medium", topic: "IEEE 754" },
    { id: "ch02-q07", question: "The IEEE 754 single precision value C0A00000 equals:", options: ["−5.0", "−2.5", "5.0", "−10.0"], answerIndex: 0, explanation: "S = 1, E = 10000001 = 129 so e = 2, and F = .01. Value = −1.01 × 2² = −101 in binary = −5.", difficulty: "hard", topic: "IEEE 754" },
    { id: "ch02-q08", question: "An exponent of all 1s with a non-zero fraction represents:", options: ["Zero", "Infinity", "NaN", "A denormal"], answerIndex: 2, explanation: "All-1s exponent with a non-zero fraction is NaN. A zero fraction would be infinity.", difficulty: "easy", topic: "IEEE 754" },
    { id: "ch02-q09", question: "In Booth's algorithm, what happens when Q0 Q-1 = 10?", options: ["A = A + M", "A = A − M", "No operation", "Q is complemented"], answerIndex: 1, explanation: "10 marks the start of a run of 1s, so M is subtracted before the shift.", difficulty: "easy", topic: "Booth's Algorithm" },
    { id: "ch02-q10", question: "Which shift does Booth's algorithm use?", options: ["Logical left", "Logical right", "Arithmetic right", "Rotate left"], answerIndex: 2, explanation: "Arithmetic right shift keeps the sign of the partial product in A.", difficulty: "easy", topic: "Booth's Algorithm" },
    { id: "ch02-q11", question: "With the multiplier Q = 0111 and Q-1 = 0, how many add or subtract operations does Booth's algorithm perform?", options: ["1", "2", "3", "4"], answerIndex: 1, explanation: "Reading from the right: 10 at the first bit (subtract), then 11, 11, then 01 at the top bit (add). That is two operations.", difficulty: "hard", topic: "Booth's Algorithm" },
    { id: "ch02-q12", question: "What is the main difference between restoring and non-restoring division?", options: ["Non-restoring cannot handle remainders", "Restoring adds M back after each negative result", "Restoring uses no subtraction", "They give different quotients"], answerIndex: 1, explanation: "Restoring division undoes a negative subtraction immediately. Non-restoring compensates in the next step.", difficulty: "medium", topic: "Division" },
    { id: "ch02-q13", question: "When is the final correction needed in non-restoring division?", options: ["Always", "If A is negative at the end", "If Q is zero", "If M is negative"], answerIndex: 1, explanation: "If the final A is negative, adding M gives the correct remainder.", difficulty: "medium", topic: "Division" },
    { id: "ch02-q14", question: "The hexadecimal value 2F equals which decimal number?", options: ["32", "47", "52", "215"], answerIndex: 1, explanation: "2×16 + 15 = 47.", difficulty: "easy", topic: "Number Systems" },
  ],
  importantQuestions: [
    { q: "Explain Booth's algorithm with a flowchart and multiply (−7) × 3 using 4 bits.", marks: 10, modelAnswer: "Draw the flowchart with registers A, Q, Q-1 and M, and a loop that checks Q0 Q-1.\nSetup: M = 1001, −M = 0111, Q = 0011, A = 0000, Q-1 = 0.\nStep 1: 10, so A = 0111. Shift: A = 0011, Q = 1001, Q-1 = 1.\nStep 2: 11, no operation. Shift: A = 0001, Q = 1100, Q-1 = 1.\nStep 3: 01, so A = 0001 + 1001 = 1010. Shift: A = 1101, Q = 0110, Q-1 = 0.\nStep 4: 00, no operation. Shift: A = 1110, Q = 1011, Q-1 = 0.\nResult: 1110 1011 = −21, which is correct." },
    { q: "Represent −12.375 in IEEE 754 single precision format.", marks: 6, modelAnswer: "S = 1.\n12.375 = 1100.011 in binary.\nNormalize: 1.100011 × 2³.\nE = 3 + 127 = 130 = 10000010.\nF = 10001100000000000000000.\nResult: 1 10000010 10001100000000000000000, which is C1460000 in hex." },
    { q: "Explain the restoring division algorithm with a flowchart and divide 11 by 3 using it.", marks: 10, modelAnswer: "Draw the flowchart: shift A and Q left, A = A − M, and if A is negative set Q0 = 0 and restore, otherwise set Q0 = 1. Repeat n times.\nSetup: A = 00000, Q = 1011, M = 00011, −M = 11101.\nStep 1: shift gives A = 00001, Q = 011_. A − M = 11110 is negative. Restore A = 00001, Q = 0110.\nStep 2: shift gives A = 00010, Q = 110_. A − M = 11111 is negative. Restore A = 00010, Q = 1100.\nStep 3: shift gives A = 00101, Q = 100_. A − M = 00010 is not negative. Keep A = 00010, Q = 1001.\nStep 4: shift gives A = 00101, Q = 001_. A − M = 00010 is not negative. Keep A = 00010, Q = 0011.\nResult: quotient = 0011 = 3 and remainder = 00010 = 2." },
    { q: "Compare sign-magnitude, 1's complement and 2's complement representations.", marks: 5, modelAnswer: "Sign-magnitude: the MSB is the sign, there are two zeros, and addition needs separate sign logic.\n1's complement: negate by inverting bits, there are two zeros, and an end-around carry is needed.\n2's complement: negate by inverting and adding 1, there is one zero, the range is asymmetric and one adder handles both add and subtract. This is why it is used in practice." },
    { q: "What are the special values in IEEE 754? How are they encoded?", marks: 5, modelAnswer: "Zero: exponent 0 and fraction 0.\nDenormal: exponent 0 and fraction non-zero, used for numbers very close to zero.\nInfinity: exponent all 1s and fraction 0.\nNaN: exponent all 1s and fraction non-zero, used for invalid results such as 0/0." },
    { q: "How is overflow detected in 2's complement addition? Give an example.", marks: 4, modelAnswer: "Overflow occurs when the carry into the sign bit differs from the carry out of it. Equivalently, two numbers of the same sign give a result of the opposite sign.\nExample in 4 bits: 0111 + 0001 = 1000, so +7 + 1 gives −8, which is overflow." },
  ],
  keyTerms: ["2's complement", "Sign-magnitude", "Overflow", "IEEE 754", "Biased exponent", "Mantissa", "NaN", "Denormalized number", "Booth's algorithm", "Arithmetic shift right", "Restoring division", "Non-restoring division"],
};

export default chapter;
