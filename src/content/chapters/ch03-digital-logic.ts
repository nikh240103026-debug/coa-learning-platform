import type { Chapter } from "@/lib/types";

const chapter: Chapter = {
  slug: "digital-logic",
  number: 3,
  title: "Digital Logic Basics for COA",
  summary:
    "The building blocks of a processor: logic gates, adders, multiplexers and decoders, flip-flops, registers and counters.",
  estMinutes: 45,
  videoUrl: "",
  learningObjectives: [
    "Use the basic and universal gates and simplify simple Boolean expressions",
    "Distinguish combinational from sequential circuits",
    "Design half adders, full adders and ripple carry adders",
    "Explain multiplexers, decoders and encoders",
    "Describe SR, D, JK and T flip-flops, registers and counters",
  ],
  sections: [
    {
      id: "logic-gates",
      title: "Logic Gates & Boolean Algebra",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "A logic gate produces a binary output from one or more binary inputs. Gates are the smallest building blocks of every circuit in a CPU.",
        },
        {
          type: "table",
          headers: ["A", "B", "AND", "OR", "XOR", "NAND", "NOR"],
          rows: [
            ["0", "0", "0", "0", "0", "1", "1"],
            ["0", "1", "0", "1", "1", "1", "0"],
            ["1", "0", "0", "1", "1", "1", "0"],
            ["1", "1", "1", "1", "0", "0", "0"],
          ],
        },
        {
          type: "points",
          items: [
            "**NOT** inverts its single input.",
            "**NAND and NOR are universal gates:** any Boolean function can be built using only one of them.",
            "**XOR** outputs 1 when its inputs differ, which makes it useful for adders and parity.",
          ],
        },
        {
          type: "callout",
          variant: "formula",
          text: "De Morgan's laws: (A·B)' = A' + B' and (A + B)' = A'·B'",
        },
        {
          type: "callout",
          variant: "remember",
          text: "Useful identities: A + A' = 1, A·A' = 0, A + AB = A, and A + A'B = A + B.",
        },
      ],
    },
    {
      id: "combinational-sequential",
      title: "Combinational vs Sequential Circuits",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "A **combinational** circuit's output depends only on its current inputs. A **sequential** circuit's output also depends on stored state, so it has memory and usually a clock.",
        },
        {
          type: "table",
          headers: ["Feature", "Combinational", "Sequential"],
          rows: [
            ["Output depends on", "Current inputs only", "Current inputs and stored state"],
            ["Memory", "None", "Flip-flops or latches"],
            ["Clock", "Not needed", "Usually needed"],
            ["Feedback path", "None", "Present"],
            ["Examples", "Adder, MUX, decoder", "Register, counter, control FSM"],
          ],
        },
        {
          type: "diagram",
          title: "General structure of a sequential circuit",
          caption: "Combinational logic computes the next state and outputs. Flip-flops hold the state between clock edges.",
          kind: "block",
          mermaid: `flowchart LR
  IN["Inputs"] --> CL["Combinational Logic"]
  CL --> OUT["Outputs"]
  CL -->|"Next state"| FF["Flip-Flops"]
  FF -->|"Current state"| CL
  CLK["Clock"] --> FF`,
        },
      ],
    },
    {
      id: "adders",
      title: "Adders",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "A **half adder** adds two bits. A **full adder** adds two bits and a carry-in, so it can be chained to add longer numbers.",
        },
        {
          type: "callout",
          variant: "formula",
          text: "Half adder: Sum = A ⊕ B, Carry = A·B",
        },
        {
          type: "callout",
          variant: "formula",
          text: "Full adder: Sum = A ⊕ B ⊕ Cin, Cout = A·B + Cin·(A ⊕ B)",
        },
        {
          type: "table",
          headers: ["A", "B", "Cin", "Sum", "Cout"],
          rows: [
            ["0", "0", "0", "0", "0"],
            ["0", "0", "1", "1", "0"],
            ["0", "1", "0", "1", "0"],
            ["0", "1", "1", "0", "1"],
            ["1", "0", "0", "1", "0"],
            ["1", "0", "1", "0", "1"],
            ["1", "1", "0", "0", "1"],
            ["1", "1", "1", "1", "1"],
          ],
        },
        {
          type: "diagram",
          title: "Full adder from two half adders",
          caption: "Two half adders produce the sum. An OR gate combines their carries.",
          kind: "block",
          mermaid: `flowchart LR
  A1["A"] --> HA1["Half Adder 1"]
  B1["B"] --> HA1
  HA1 -->|"Sum"| HA2["Half Adder 2"]
  CIN["Cin"] --> HA2
  HA2 -->|"Sum"| SUMOUT["Sum"]
  HA1 -->|"Carry"| ORG["OR Gate"]
  HA2 -->|"Carry"| ORG
  ORG --> COUT["Cout"]`,
        },
        {
          type: "paragraph",
          text: "A **ripple carry adder** chains n full adders. It is simple, but each carry has to pass through all earlier stages, so delay grows with n. A **carry lookahead adder** computes carries in parallel to reduce this delay.",
        },
        {
          type: "diagram",
          title: "4-bit ripple carry adder",
          caption: "Each stage waits for the carry from the previous stage. The worst case is a carry rippling through every stage.",
          kind: "working-diagram",
          mermaid: `flowchart RL
  C0["C0"] --> FA0["FA bit 0"]
  FA0 -->|"C1"| FA1["FA bit 1"]
  FA1 -->|"C2"| FA2["FA bit 2"]
  FA2 -->|"C3"| FA3["FA bit 3"]
  FA3 --> C4["C4"]`,
        },
        {
          type: "callout",
          variant: "formula",
          text: "Ripple adder worst-case delay = (n − 1) × carry delay + sum delay",
        },
        {
          type: "callout",
          variant: "formula",
          text: "Carry lookahead: Generate Gᵢ = Aᵢ·Bᵢ, Propagate Pᵢ = Aᵢ ⊕ Bᵢ, and Cᵢ₊₁ = Gᵢ + Pᵢ·Cᵢ",
        },
        {
          type: "example",
          title: "Delay of a ripple carry adder",
          steps: [
            "Given: 4-bit ripple adder, carry delay 2 ns per stage, sum delay 3 ns.",
            "Worst-case delay = (4 − 1) × 2 + 3 = 9 ns.",
            "The maximum operating frequency is therefore 1 / 9 ns, which is about 111 MHz.",
          ],
        },
      ],
    },
    {
      id: "mux-decoder",
      title: "Multiplexers, Decoders & Encoders",
      videoUrl: "",
      blocks: [
        {
          type: "points",
          items: [
            "**Multiplexer (MUX):** selects one of 2ⁿ inputs using n select lines and sends it to one output.",
            "**Demultiplexer:** sends one input to one of 2ⁿ outputs.",
            "**Decoder:** converts n input bits to one active line out of 2ⁿ. It is used for memory chip selection and instruction decoding.",
            "**Encoder:** the reverse of a decoder, turning one active line of 2ⁿ into n bits.",
            "**Priority encoder:** gives the code of the highest-priority active input. It is used in interrupt controllers.",
          ],
        },
        {
          type: "diagram",
          title: "4-to-1 multiplexer operation",
          caption: "The two select lines choose which input reaches the output.",
          kind: "working-flowchart",
          mermaid: `flowchart TD
  SEL{"Select lines S1 S0"}
  SEL -->|"0 0"| I0["Output = I0"]
  SEL -->|"0 1"| I1["Output = I1"]
  SEL -->|"1 0"| I2["Output = I2"]
  SEL -->|"1 1"| I3["Output = I3"]`,
        },
        {
          type: "callout",
          variant: "exam-tip",
          text: "A 2ⁿ-to-1 MUX can implement any Boolean function of n variables by placing the truth table outputs on its inputs. An 8-to-1 MUX can implement any 3-variable function.",
        },
        {
          type: "callout",
          variant: "remember",
          text: "A MUX tree counts as follows: a 16-to-1 MUX built from 4-to-1 MUXes needs 4 + 1 = 5 units.",
        },
      ],
    },
    {
      id: "flip-flops",
      title: "Latches & Flip-Flops",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "A flip-flop stores one bit. A **latch** is level-triggered and can change while its enable is active. A **flip-flop** is edge-triggered and changes only at a clock edge, which makes timing predictable.",
        },
        {
          type: "table",
          headers: ["Type", "Next state equation", "Notes"],
          rows: [
            ["SR", "Q+ = S + R'Q", "S = R = 1 is not allowed"],
            ["D", "Q+ = D", "Stores the input, and is the basis of registers"],
            ["JK", "Q+ = JQ' + K'Q", "J = K = 1 toggles, removing the invalid SR state"],
            ["T", "Q+ = T ⊕ Q", "T = 1 toggles, and is used in counters"],
          ],
        },
        {
          type: "diagram",
          title: "JK flip-flop state transitions",
          caption: "From each state, the inputs J and K decide whether the stored bit is kept, set, reset or toggled.",
          kind: "working-diagram",
          mermaid: `stateDiagram-v2
  [*] --> Q0
  Q0 --> Q0: J is 0
  Q0 --> Q1: J is 1
  Q1 --> Q1: K is 0
  Q1 --> Q0: K is 1`,
        },
        {
          type: "callout",
          variant: "remember",
          text: "Race-around: in a level-triggered JK with J = K = 1, the output toggles repeatedly while the clock is high. Master-slave or edge-triggered designs prevent this.",
        },
        {
          type: "callout",
          variant: "formula",
          text: "Minimum clock period ≥ flip-flop propagation delay + combinational delay + setup time",
        },
      ],
    },
    {
      id: "registers-counters",
      title: "Registers & Counters",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "A **register** is a group of D flip-flops sharing a clock, storing one word. A **shift register** moves its bits left or right on each clock. A **counter** steps through a fixed sequence of states.",
        },
        {
          type: "points",
          items: [
            "**SISO, SIPO, PISO, PIPO** describe how data enters and leaves a shift register, serial or parallel.",
            "**Ripple (asynchronous) counter:** each flip-flop is clocked by the previous one. It is simple, but delays add up.",
            "**Synchronous counter:** all flip-flops share one clock, so it is faster.",
            "**Ring counter:** an n-bit ring has n states.",
            "**Johnson counter:** an n-bit Johnson counter has 2n states.",
          ],
        },
        {
          type: "diagram",
          title: "2-bit up counter",
          caption: "On each clock edge the counter moves to the next state, returning to 00 after 11.",
          kind: "working-diagram",
          mermaid: `stateDiagram-v2
  [*] --> S00
  S00 --> S01: Clock
  S01 --> S10: Clock
  S10 --> S11: Clock
  S11 --> S00: Clock`,
        },
        {
          type: "callout",
          variant: "formula",
          text: "Flip-flops needed for a MOD-N counter = ⌈log₂ N⌉. An n-bit ripple counter has a maximum frequency of 1 / (n × tpd)",
        },
        {
          type: "example",
          title: "Ripple counter maximum frequency",
          steps: [
            "Given: 4-bit ripple counter, flip-flop propagation delay tpd = 10 ns.",
            "Total ripple delay = 4 × 10 ns = 40 ns.",
            "Maximum frequency = 1 / 40 ns = 25 MHz.",
          ],
        },
        {
          type: "callout",
          variant: "exam-tip",
          text: "A MOD-10 counter needs ⌈log₂ 10⌉ = 4 flip-flops. Do not answer 3, because 3 flip-flops give only 8 states.",
        },
      ],
    },
  ],
  flashcards: [
    { front: "Universal gates", back: "NAND and NOR. Any Boolean function can be built from just one of them." },
    { front: "De Morgan's laws", back: "(A·B)' = A' + B' and (A + B)' = A'·B'." },
    { front: "Combinational circuit", back: "Output depends only on the current inputs, with no memory." },
    { front: "Sequential circuit", back: "Output depends on the inputs and stored state, using flip-flops and usually a clock." },
    { front: "Half adder equations", back: "Sum = A ⊕ B and Carry = A·B." },
    { front: "Full adder equations", back: "Sum = A ⊕ B ⊕ Cin and Cout = AB + Cin(A ⊕ B)." },
    { front: "Carry lookahead adder", back: "Computes carries in parallel from generate and propagate signals, reducing delay compared to ripple carry." },
    { front: "Multiplexer", back: "Selects one of 2ⁿ inputs using n select lines." },
    { front: "Decoder", back: "Converts n input bits into one active output of 2ⁿ. Used for chip selection." },
    { front: "D flip-flop", back: "Q+ = D. The next state equals the input at the clock edge." },
    { front: "JK flip-flop", back: "Q+ = JQ' + K'Q. J = K = 1 toggles the output." },
    { front: "Race-around condition", back: "Repeated toggling of a level-triggered JK while the clock is high when J = K = 1." },
    { front: "Ring vs Johnson counter", back: "An n-bit ring counter has n states. An n-bit Johnson counter has 2n states." },
  ],
  quiz: [
    { id: "ch03-q01", question: "Which gates are called universal gates?", options: ["AND and OR", "NAND and NOR", "XOR and XNOR", "NOT and OR"], answerIndex: 1, explanation: "Any Boolean function can be built using only NAND gates or only NOR gates.", difficulty: "easy", topic: "Logic Gates" },
    { id: "ch03-q02", question: "By De Morgan's law, (A + B)' equals:", options: ["A' + B'", "A'·B'", "A·B", "A + B"], answerIndex: 1, explanation: "The complement of a sum is the product of the complements.", difficulty: "easy", topic: "Boolean Algebra" },
    { id: "ch03-q03", question: "Which of these is a sequential circuit?", options: ["Full adder", "Multiplexer", "Decoder", "Counter"], answerIndex: 3, explanation: "A counter stores state in flip-flops. The others are combinational.", difficulty: "easy", topic: "Combinational vs Sequential" },
    { id: "ch03-q04", question: "How many half adders and additional gates form a full adder?", options: ["1 half adder and 1 AND", "2 half adders and 1 OR", "2 half adders and 1 AND", "3 half adders"], answerIndex: 1, explanation: "Two half adders produce the sum, and an OR gate combines the two carries.", difficulty: "easy", topic: "Adders" },
    { id: "ch03-q05", question: "For a full adder with A = 1, B = 1, Cin = 1, the outputs (Sum, Cout) are:", options: ["(0, 1)", "(1, 0)", "(1, 1)", "(0, 0)"], answerIndex: 2, explanation: "1 + 1 + 1 = 3, which is 11 in binary, so Sum = 1 and Cout = 1.", difficulty: "easy", topic: "Adders" },
    { id: "ch03-q06", question: "An 8-bit ripple adder has a carry delay of 3 ns and a sum delay of 4 ns per stage. What is its worst-case delay?", options: ["24 ns", "25 ns", "28 ns", "32 ns"], answerIndex: 1, explanation: "Delay = (8 − 1) × 3 + 4 = 25 ns.", difficulty: "medium", topic: "Adders" },
    { id: "ch03-q07", question: "How many select lines does a 16-to-1 multiplexer need?", options: ["2", "3", "4", "16"], answerIndex: 2, explanation: "16 = 2⁴, so 4 select lines are needed.", difficulty: "easy", topic: "Multiplexers" },
    { id: "ch03-q08", question: "How many 2-to-1 multiplexers are needed to build an 8-to-1 multiplexer?", options: ["3", "4", "7", "8"], answerIndex: 2, explanation: "A tree uses 4 + 2 + 1 = 7 units.", difficulty: "medium", topic: "Multiplexers" },
    { id: "ch03-q09", question: "A decoder with 5 input lines has how many output lines?", options: ["5", "10", "25", "32"], answerIndex: 3, explanation: "An n-to-2ⁿ decoder gives 2⁵ = 32 outputs.", difficulty: "easy", topic: "Decoders" },
    { id: "ch03-q10", question: "What does a JK flip-flop do when J = K = 1 at a clock edge?", options: ["Holds", "Sets", "Resets", "Toggles"], answerIndex: 3, explanation: "J = K = 1 complements the stored bit.", difficulty: "easy", topic: "Flip-Flops" },
    { id: "ch03-q11", question: "Which flip-flop has the next-state equation Q+ = T ⊕ Q?", options: ["D", "SR", "T", "JK"], answerIndex: 2, explanation: "T = 1 toggles and T = 0 holds, which is T ⊕ Q.", difficulty: "easy", topic: "Flip-Flops" },
    { id: "ch03-q12", question: "How many flip-flops does a MOD-25 counter need?", options: ["4", "5", "6", "25"], answerIndex: 1, explanation: "⌈log₂ 25⌉ = 5, because 2⁵ = 32 is at least 25.", difficulty: "medium", topic: "Counters" },
    { id: "ch03-q13", question: "A 5-bit ripple counter uses flip-flops with a 20 ns delay. What is its maximum clock frequency?", options: ["5 MHz", "10 MHz", "20 MHz", "50 MHz"], answerIndex: 1, explanation: "Total delay = 5 × 20 ns = 100 ns, so f = 10 MHz.", difficulty: "medium", topic: "Counters" },
    { id: "ch03-q14", question: "How many states does a 4-bit Johnson counter have?", options: ["4", "8", "15", "16"], answerIndex: 1, explanation: "An n-bit Johnson counter has 2n states, so 8.", difficulty: "medium", topic: "Counters" },
    { id: "ch03-q15", question: "Combinational delay is 8 ns, flip-flop propagation delay is 2 ns and setup time is 1 ns. What is the minimum clock period?", options: ["8 ns", "9 ns", "10 ns", "11 ns"], answerIndex: 3, explanation: "Tmin = 2 + 8 + 1 = 11 ns.", difficulty: "hard", topic: "Timing" },
  ],
  importantQuestions: [
    { q: "Design a full adder using two half adders. Give the truth table and equations.", marks: 7, modelAnswer: "Equations: Sum = A ⊕ B ⊕ Cin and Cout = AB + Cin(A ⊕ B).\nThe first half adder adds A and B. The second adds that sum to Cin. An OR gate combines the two carries.\nInclude the 8-row truth table and the block diagram." },
    { q: "Differentiate between combinational and sequential circuits with examples.", marks: 4, modelAnswer: "Combinational: output depends only on the current inputs, with no memory, no feedback and no clock. Examples: adder, MUX, decoder.\nSequential: output depends on inputs and stored state, using flip-flops and feedback, usually with a clock. Examples: registers, counters." },
    { q: "Explain the JK flip-flop and the race-around condition. How is it removed?", marks: 7, modelAnswer: "Characteristic equation: Q+ = JQ' + K'Q.\nJ = 0, K = 0 holds. J = 0, K = 1 resets. J = 1, K = 0 sets. J = 1, K = 1 toggles.\nRace-around: with a level-triggered clock and J = K = 1, the output toggles repeatedly during the high phase, so the final state is unpredictable.\nIt is removed by a master-slave arrangement, by edge triggering, or by keeping the clock pulse shorter than the propagation delay." },
    { q: "Explain the ripple carry adder and why carry lookahead is faster.", marks: 6, modelAnswer: "A ripple adder chains n full adders, and each carry waits for the previous stage. Worst-case delay grows linearly with n.\nCarry lookahead computes generate Gᵢ = AᵢBᵢ and propagate Pᵢ = Aᵢ ⊕ Bᵢ, then expands Cᵢ₊₁ = Gᵢ + PᵢCᵢ so all carries are found in parallel from C0, using more gates but a nearly constant delay." },
    { q: "Compare ripple and synchronous counters.", marks: 4, modelAnswer: "Ripple: each flip-flop is clocked by the previous output, delays accumulate, the design is simple, and it is slower with possible glitches.\nSynchronous: all flip-flops share the clock, with extra logic for toggling conditions. It is faster, and its speed does not fall with more bits in the same way." },
    { q: "Implement F(A, B, C) = Σm(1, 2, 6, 7) using an 8-to-1 multiplexer.", marks: 5, modelAnswer: "Connect A, B and C to the three select lines.\nTie inputs I1, I2, I6 and I7 to logic 1.\nTie inputs I0, I3, I4 and I5 to logic 0.\nThe output equals F, because the selected input matches the truth table row." },
  ],
  keyTerms: ["NAND gate", "De Morgan's laws", "Half adder", "Full adder", "Ripple carry adder", "Carry lookahead adder", "Multiplexer", "Decoder", "Flip-flop", "JK flip-flop", "Race-around condition", "Shift register", "Counter"],
};

export default chapter;
