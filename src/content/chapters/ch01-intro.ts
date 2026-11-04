import type { Chapter } from "@/lib/types";

const chapter: Chapter = {
  slug: "intro-to-coa",
  number: 1,
  title: "Introduction to Computer Organization & Architecture",
  summary:
    "What a computer is made of, how Von Neumann and Harvard machines differ, and how to measure performance using CPU time, CPI, MIPS and Amdahl's law.",
  estMinutes: 35,
  videoUrl: "",
  learningObjectives: [
    "Distinguish computer architecture from computer organization",
    "Draw and explain the Von Neumann architecture and compare it with Harvard",
    "Describe the five functional units and how they interact",
    "Calculate CPU time, CPI, MIPS and speedup",
    "Apply Amdahl's law and explain its limit",
  ],
  sections: [
    {
      id: "architecture-vs-organization",
      title: "Architecture vs Organization",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "**Computer architecture** is what the programmer can see: the instruction set, data types, addressing modes and registers. **Computer organization** is how those features are built in hardware: control signals, memory technology and interfaces.",
        },
        {
          type: "paragraph",
          text: "Two processors can share one architecture but differ in organization. For example, two x86 chips run the same programs, yet one may have a longer pipeline and a larger cache than the other.",
        },
        {
          type: "table",
          headers: ["Aspect", "Architecture", "Organization"],
          rows: [
            ["Question answered", "What does the machine do?", "How does the machine do it?"],
            ["Visible to programmer", "Yes", "Usually no"],
            ["Examples", "Instruction set, word size, addressing modes", "Pipeline depth, cache size, bus design"],
            ["Multiply instruction", "Whether a multiply instruction exists", "Whether it uses a dedicated multiplier or repeated addition"],
          ],
        },
        {
          type: "callout",
          variant: "exam-tip",
          text: "The multiply example is the classic exam answer: whether the instruction exists is architecture, and how it is implemented is organization.",
        },
      ],
    },
    {
      id: "functional-units",
      title: "Functional Units of a Computer",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "Every general-purpose computer has five functional units. The ALU and control unit together form the CPU.",
        },
        {
          type: "points",
          items: [
            "**Input unit:** accepts data and programs from the outside world, such as a keyboard or sensor.",
            "**Memory unit:** stores instructions and data. It has fast primary memory and larger secondary storage.",
            "**ALU:** performs arithmetic and logic operations on data.",
            "**Control unit:** fetches and decodes instructions and generates the timing and control signals for every other unit.",
            "**Output unit:** sends results to the outside world, such as a display or printer.",
          ],
        },
        {
          type: "diagram",
          title: "Five functional units",
          caption: "Solid arrows carry data and instructions. The control unit sends control signals to all other units.",
          kind: "block",
          mermaid: `flowchart LR
  IN["Input Unit"] --> MEM["Memory Unit"]
  MEM --> OUT["Output Unit"]
  subgraph CPUBOX["CPU"]
    ALU["ALU"]
    CU["Control Unit"]
  end
  MEM <--> ALU
  CU -.-> IN
  CU -.-> MEM
  CU -.-> ALU
  CU -.-> OUT`,
        },
        {
          type: "callout",
          variant: "remember",
          text: "CPU = ALU + Control Unit + Registers. Memory and I/O sit outside the CPU and connect through buses.",
        },
      ],
    },
    {
      id: "von-neumann-harvard",
      title: "Von Neumann vs Harvard Architecture",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "The **stored-program concept** says instructions and data are both kept in memory as binary numbers. To change what the machine does, you load a different program rather than rewiring it.",
        },
        {
          type: "paragraph",
          text: "A **Von Neumann** machine has one memory and one bus shared by instructions and data. A **Harvard** machine has separate memories and buses for each, so it can fetch an instruction and access data in the same cycle.",
        },
        {
          type: "diagram",
          title: "Von Neumann architecture",
          caption: "One memory and one shared path for instructions and data. This shared path is the source of the Von Neumann bottleneck.",
          kind: "block",
          mermaid: `flowchart TB
  subgraph CPUBOX["CPU"]
    CU["Control Unit"]
    ALU["ALU"]
    REG["Registers"]
  end
  BUS["Shared Bus"]
  MEM["Single Memory: Instructions and Data"]
  IO["Input and Output"]
  CPUBOX <--> BUS
  BUS <--> MEM
  BUS <--> IO`,
        },
        {
          type: "diagram",
          title: "Harvard architecture",
          caption: "Separate instruction and data memories, each with its own bus, allow both to be accessed at once.",
          kind: "block",
          mermaid: `flowchart LR
  IMEM["Instruction Memory"] <-->|"Instruction bus"| CPUBOX["CPU"]
  CPUBOX <-->|"Data bus"| DMEM["Data Memory"]
  CPUBOX <--> IO["Input and Output"]`,
        },
        {
          type: "table",
          headers: ["Feature", "Von Neumann", "Harvard"],
          rows: [
            ["Memory", "Single, shared", "Separate instruction and data memory"],
            ["Buses", "One shared bus", "Two independent buses"],
            ["Simultaneous fetch and data access", "No", "Yes"],
            ["Cost and complexity", "Lower", "Higher"],
            ["Typical use", "General-purpose computers", "DSPs and microcontrollers"],
          ],
        },
        {
          type: "paragraph",
          text: "The **Von Neumann bottleneck** is the limit caused by the single path between CPU and memory. The CPU often waits because memory is slower and the bus can carry only one transfer at a time.",
        },
        {
          type: "callout",
          variant: "remember",
          text: "Modern CPUs are a modified Harvard design: separate L1 instruction and data caches, but one unified main memory.",
        },
      ],
    },
    {
      id: "performance-metrics",
      title: "Performance Metrics",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "The most reliable measure of performance is the **execution time** of real programs. Lower time means higher performance. Three factors decide CPU time: how many instructions run, how many cycles each takes, and how long a cycle lasts.",
        },
        {
          type: "callout",
          variant: "formula",
          text: "CPU time = Instruction count × CPI × Clock period = (IC × CPI) / Clock rate",
        },
        {
          type: "callout",
          variant: "formula",
          text: "Average CPI = Σ (CPIᵢ × fractionᵢ), where fractionᵢ is the share of instruction class i",
        },
        {
          type: "callout",
          variant: "formula",
          text: "MIPS = Clock rate in MHz / CPI = IC / (CPU time × 10⁶)",
        },
        {
          type: "callout",
          variant: "formula",
          text: "Performance = 1 / Execution time. Speedup of A over B = Time_B / Time_A",
        },
        {
          type: "points",
          items: [
            "**Instruction count (IC)** depends on the program, compiler and instruction set.",
            "**CPI** depends on the instruction set and the organization.",
            "**Clock period** depends on the organization and the chip technology.",
            "**MIPS can mislead:** a machine with simple instructions may show a high MIPS value and still run a program more slowly.",
          ],
        },
        {
          type: "example",
          title: "Weighted CPI, MIPS and CPU time",
          steps: [
            "Given: a 2 GHz processor runs 10⁹ instructions with this mix: ALU 50% (CPI 1), Load 20% (CPI 2), Store 10% (CPI 2), Branch 20% (CPI 2).",
            "Average CPI = 0.5×1 + 0.2×2 + 0.1×2 + 0.2×2 = 0.5 + 0.4 + 0.2 + 0.4 = 1.5.",
            "CPU time = (10⁹ × 1.5) / (2 × 10⁹) = 0.75 s.",
            "MIPS = 2000 MHz / 1.5 = 1333 MIPS.",
          ],
        },
        {
          type: "diagram",
          title: "What affects CPU time",
          caption: "Each factor of the CPU time equation is controlled by a different level of the system.",
          kind: "flowchart",
          mermaid: `flowchart TD
  T["CPU Time"]
  T --> IC["Instruction Count"]
  T --> CPI["Cycles per Instruction"]
  T --> CP["Clock Period"]
  IC --> P1["Program, Compiler, ISA"]
  CPI --> P2["ISA, Organization"]
  CP --> P3["Organization, Technology"]`,
        },
      ],
    },
    {
      id: "amdahls-law",
      title: "Amdahl's Law",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "Amdahl's law gives the overall speedup when only part of a program can be improved. The part you cannot improve sets a hard limit on the gain.",
        },
        {
          type: "callout",
          variant: "formula",
          text: "Overall speedup S = 1 / ((1 − f) + f / k), where f is the fraction enhanced and k is the speedup of that fraction",
        },
        {
          type: "callout",
          variant: "formula",
          text: "Maximum speedup as k → ∞ is S_max = 1 / (1 − f)",
        },
        {
          type: "example",
          title: "Applying Amdahl's law",
          steps: [
            "Given: 80% of a program can be made 4 times faster, so f = 0.8 and k = 4.",
            "S = 1 / (0.2 + 0.8/4) = 1 / (0.2 + 0.2) = 1 / 0.4 = 2.5.",
            "Even with an infinitely fast enhancement: S_max = 1 / 0.2 = 5.",
            "Conclusion: the 20% that cannot be improved limits speedup to 5, whatever is spent on the rest.",
          ],
        },
        {
          type: "diagram",
          title: "Applying Amdahl's law",
          caption: "A working flow for solving Amdahl's law numericals.",
          kind: "working-flowchart",
          mermaid: `flowchart TD
  A["Identify fraction f that can be enhanced"] --> B["Identify enhancement factor k"]
  B --> C["Unchanged time = 1 - f"]
  C --> D["Enhanced time = f / k"]
  D --> E["New time = unchanged + enhanced"]
  E --> F["Speedup = 1 / new time"]`,
        },
        {
          type: "callout",
          variant: "exam-tip",
          text: "Always check the limit 1 / (1 − f). If your answer is larger than this limit, the working has an error.",
        },
      ],
    },
  ],
  flashcards: [
    { front: "Computer architecture", back: "Attributes visible to the programmer: instruction set, data types, addressing modes and registers." },
    { front: "Computer organization", back: "How architectural features are implemented in hardware: control signals, memory technology and interfaces." },
    { front: "Stored-program concept", back: "Instructions and data are both stored in memory as binary, so a program can be changed by loading new contents." },
    { front: "Von Neumann bottleneck", back: "The performance limit caused by one shared path between CPU and memory for both instructions and data." },
    { front: "Harvard architecture", back: "Separate memories and buses for instructions and data, allowing both to be accessed at once." },
    { front: "CPI", back: "Average number of clock cycles per instruction." },
    { front: "CPU time formula", back: "CPU time = IC × CPI × Clock period, or (IC × CPI) / Clock rate." },
    { front: "MIPS", back: "Million instructions per second, equal to clock rate in MHz divided by CPI." },
    { front: "Amdahl's law", back: "S = 1 / ((1 − f) + f / k). Speedup is limited by the part that cannot be enhanced." },
    { front: "Maximum speedup", back: "S_max = 1 / (1 − f), reached as the enhancement factor approaches infinity." },
    { front: "Control unit", back: "Fetches and decodes instructions and generates timing and control signals for all other units." },
    { front: "Modified Harvard", back: "Separate L1 instruction and data caches with one unified main memory, as used by most modern CPUs." },
  ],
  quiz: [
    { id: "ch01-q01", question: "Which of these is an architectural attribute rather than an organizational one?", options: ["Cache size", "Instruction set", "Memory technology", "Control signal timing"], answerIndex: 1, explanation: "The instruction set is visible to the programmer, so it is architecture. The others are implementation details.", difficulty: "easy", topic: "Architecture vs Organization" },
    { id: "ch01-q02", question: "The key idea of the stored-program concept is that:", options: ["Programs are stored on disk only", "Instructions and data are held in memory in binary form", "Data is stored in registers only", "Programs are wired into the hardware"], answerIndex: 1, explanation: "Both instructions and data sit in memory, so the program can be replaced without changing hardware.", difficulty: "easy", topic: "Von Neumann Architecture" },
    { id: "ch01-q03", question: "The Von Neumann bottleneck is caused by:", options: ["A slow ALU", "Too few registers", "A single path shared by instructions and data", "A small hard disk"], answerIndex: 2, explanation: "Only one transfer can use the shared CPU-memory path at a time, which limits throughput.", difficulty: "easy", topic: "Von Neumann Architecture" },
    { id: "ch01-q04", question: "A main advantage of Harvard architecture is that it:", options: ["Uses less hardware", "Can fetch an instruction and access data at the same time", "Needs no control unit", "Has only one memory"], answerIndex: 1, explanation: "Independent instruction and data paths allow both accesses in the same cycle.", difficulty: "easy", topic: "Harvard Architecture" },
    { id: "ch01-q05", question: "Which pair forms the core of the CPU?", options: ["Memory and I/O", "ALU and control unit", "Input and output units", "Cache and disk"], answerIndex: 1, explanation: "The ALU performs operations and the control unit directs them. With registers they form the CPU.", difficulty: "easy", topic: "Functional Units" },
    { id: "ch01-q06", question: "A program runs 2 × 10⁹ instructions with CPI 2 on a 4 GHz clock. What is the CPU time?", options: ["0.5 s", "1 s", "2 s", "4 s"], answerIndex: 1, explanation: "CPU time = (2×10⁹ × 2) / (4×10⁹) = 1 s.", difficulty: "medium", topic: "CPU Time" },
    { id: "ch01-q07", question: "Instruction mix: 60% with CPI 1 and 40% with CPI 3. What is the average CPI?", options: ["1.4", "1.8", "2.0", "2.4"], answerIndex: 1, explanation: "0.6×1 + 0.4×3 = 0.6 + 1.2 = 1.8.", difficulty: "medium", topic: "CPI" },
    { id: "ch01-q08", question: "A 1 GHz processor has an average CPI of 2.5. What is its MIPS rating?", options: ["250", "400", "2500", "4000"], answerIndex: 1, explanation: "MIPS = 1000 MHz / 2.5 = 400.", difficulty: "medium", topic: "MIPS" },
    { id: "ch01-q09", question: "Why can MIPS be a misleading metric?", options: ["It ignores the clock rate", "It does not account for how much work each instruction does", "It cannot be measured", "It only applies to RISC"], answerIndex: 1, explanation: "A machine with simple instructions may need more of them, so higher MIPS does not guarantee a faster program.", difficulty: "medium", topic: "MIPS" },
    { id: "ch01-q10", question: "50% of a program is sped up 5 times. What is the overall speedup?", options: ["1.25", "1.67", "2.5", "5"], answerIndex: 1, explanation: "S = 1 / (0.5 + 0.5/5) = 1 / 0.6 = 1.67.", difficulty: "medium", topic: "Amdahl's Law" },
    { id: "ch01-q11", question: "If 90% of a program can be enhanced, what is the maximum possible speedup?", options: ["9", "10", "90", "Unlimited"], answerIndex: 1, explanation: "S_max = 1 / (1 − 0.9) = 10.", difficulty: "medium", topic: "Amdahl's Law" },
    { id: "ch01-q12", question: "Machine A takes 10 s and machine B takes 15 s for a program. Which statement is correct?", options: ["B is 1.5 times faster than A", "A is 1.5 times faster than B", "A is 5 times faster than B", "They have equal performance"], answerIndex: 1, explanation: "Speedup of A over B = Time_B / Time_A = 15 / 10 = 1.5.", difficulty: "easy", topic: "Performance" },
    { id: "ch01-q13", question: "A new processor has 20% lower CPI but a 10% slower clock rate. Instruction count is unchanged. What is its speedup?", options: ["0.9", "1.0", "1.125", "1.3"], answerIndex: 2, explanation: "New time ∝ 0.8 / 0.9 = 0.889 of the old time, so speedup = 1 / 0.889 = 1.125.", difficulty: "hard", topic: "CPU Time" },
  ],
  importantQuestions: [
    { q: "Differentiate between computer architecture and computer organization with an example.", marks: 4, modelAnswer: "Architecture covers attributes visible to the programmer, such as the instruction set, addressing modes and data types.\nOrganization covers how those attributes are implemented, such as control signals, memory technology and interfaces.\nExample: whether a multiply instruction exists is architecture. Whether it uses a dedicated multiplier or repeated addition is organization." },
    { q: "Draw and explain the Von Neumann architecture. What is the Von Neumann bottleneck?", marks: 7, modelAnswer: "Draw the CPU (control unit, ALU, registers) connected through one shared bus to a single memory and to I/O.\nInstructions and data are stored together in memory and fetched over the same bus, following the stored-program concept.\nThe control unit fetches each instruction, decodes it and directs the ALU.\nBottleneck: only one transfer can use the shared path at a time, and memory is slower than the CPU, so the CPU waits. Caches and separate L1 instruction and data caches reduce this." },
    { q: "Compare Von Neumann and Harvard architectures.", marks: 5, modelAnswer: "Von Neumann: single memory, one shared bus, no simultaneous instruction and data access, simpler and cheaper, used in general-purpose computers.\nHarvard: separate memories and buses, simultaneous access possible, more complex, used in DSPs and microcontrollers.\nModern CPUs use a modified Harvard design with split L1 caches and one main memory." },
    { q: "State the CPU performance equation and explain which system levels affect each factor.", marks: 5, modelAnswer: "CPU time = IC × CPI × Clock period.\nInstruction count depends on the program, compiler and ISA.\nCPI depends on the ISA and organization.\nClock period depends on organization and technology.\nImproving one factor can worsen another, so all three must be considered together." },
    { q: "State Amdahl's law. A program spends 70% of its time in code that can be sped up 10 times. Find the overall and maximum speedup.", marks: 6, modelAnswer: "Amdahl's law: S = 1 / ((1 − f) + f / k).\nHere f = 0.7 and k = 10.\nS = 1 / (0.3 + 0.07) = 1 / 0.37 = 2.70.\nMaximum speedup = 1 / (1 − 0.7) = 3.33.\nThe 30% that cannot be improved limits the gain." },
    { q: "Explain the five functional units of a computer with a block diagram.", marks: 6, modelAnswer: "Draw input, memory, ALU, control unit and output, with data paths between them and control signals from the control unit to all others.\nInput accepts data and programs. Memory stores them. The ALU computes. The control unit fetches, decodes and sequences operations. Output delivers results." },
  ],
  keyTerms: ["Von Neumann architecture", "Harvard architecture", "Stored-program concept", "Von Neumann bottleneck", "CPI", "MIPS", "CPU time", "Amdahl's law", "Speedup", "Functional units"],
};

export default chapter;
