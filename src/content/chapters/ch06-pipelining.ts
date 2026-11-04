import type { Chapter } from "@/lib/types";

const chapter: Chapter = {
  slug: "pipelining",
  number: 6,
  title: "Pipelining & Parallelism",
  summary:
    "How overlapping instruction stages raises throughput, what hazards stop it, and how forwarding, branch prediction, superscalar execution and Flynn's classification fit together.",
  estMinutes: 55,
  videoUrl: "",
  learningObjectives: [
    "Describe the five stages of a classic pipeline",
    "Calculate pipeline time, speedup, efficiency and throughput",
    "Identify structural, data and control hazards",
    "Apply forwarding and stalls, and count stall cycles",
    "Explain branch prediction, superscalar execution and Flynn's classification",
  ],
  sections: [
    {
      id: "pipeline-basics",
      title: "Pipeline Basics",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "Pipelining splits instruction execution into stages and overlaps them, like an assembly line. It does not make a single instruction faster. It raises **throughput**, the number of instructions finished per unit time.",
        },
        {
          type: "diagram",
          title: "Classic 5-stage pipeline",
          caption: "Latches between stages hold each instruction's intermediate results for the next clock cycle.",
          kind: "block",
          mermaid: `flowchart LR
  IF["IF: Instruction Fetch"] --> L1["Latch"]
  L1 --> ID["ID: Decode and Register Read"]
  ID --> L2["Latch"]
  L2 --> EX["EX: Execute or Address"]
  EX --> L3["Latch"]
  L3 --> MEM["MEM: Memory Access"]
  MEM --> L4["Latch"]
  L4 --> WB["WB: Write Back"]`,
        },
        {
          type: "table",
          headers: ["Instruction", "C1", "C2", "C3", "C4", "C5", "C6", "C7"],
          rows: [
            ["I1", "IF", "ID", "EX", "MEM", "WB", "", ""],
            ["I2", "", "IF", "ID", "EX", "MEM", "WB", ""],
            ["I3", "", "", "IF", "ID", "EX", "MEM", "WB"],
          ],
        },
        {
          type: "diagram",
          title: "Pipeline timing of three instructions",
          caption: "After the first instruction finishes in cycle 5, one instruction completes every cycle.",
          kind: "working-diagram",
          mermaid: `flowchart TB
  subgraph I1["I1"]
    direction LR
    A1["C1 IF"] --> A2["C2 ID"] --> A3["C3 EX"] --> A4["C4 MEM"] --> A5["C5 WB"]
  end
  subgraph I2["I2"]
    direction LR
    B2["C2 IF"] --> B3["C3 ID"] --> B4["C4 EX"] --> B5["C5 MEM"] --> B6["C6 WB"]
  end
  subgraph I3["I3"]
    direction LR
    D3["C3 IF"] --> D4["C4 ID"] --> D5["C5 EX"] --> D6["C6 MEM"] --> D7["C7 WB"]
  end
  I1 ~~~ I2
  I2 ~~~ I3`,
        },
        {
          type: "callout",
          variant: "formula",
          text: "Pipeline clock τ = max(stage delay) + latch delay",
        },
        {
          type: "callout",
          variant: "formula",
          text: "Time for n instructions on k stages: T = (k + n − 1) × τ",
        },
        {
          type: "callout",
          variant: "formula",
          text: "Speedup S = (n × t_non-pipelined) / ((k + n − 1) × τ). For equal stages and large n, S → k",
        },
        {
          type: "callout",
          variant: "formula",
          text: "Efficiency = S / k. Throughput = n / T",
        },
        {
          type: "example",
          title: "Equal stage pipeline",
          steps: [
            "Given: k = 5, τ = 10 ns, n = 100, and a non-pipelined time of 50 ns per instruction.",
            "Pipelined time = (5 + 100 − 1) × 10 = 1040 ns.",
            "Non-pipelined time = 100 × 50 = 5000 ns.",
            "Speedup = 5000 / 1040 = 4.81.",
            "Efficiency = 4.81 / 5 = 0.96.",
            "Throughput = 100 / 1040 ns = 96.15 MIPS.",
          ],
        },
        {
          type: "example",
          title: "Unequal stage pipeline",
          steps: [
            "Given: stage delays of 150, 120, 160 and 140 ns, with a latch delay of 10 ns and 1000 instructions.",
            "τ = 160 + 10 = 170 ns.",
            "Pipelined time = (4 + 1000 − 1) × 170 = 170,510 ns.",
            "Non-pipelined time = 1000 × (150 + 120 + 160 + 140) = 570,000 ns.",
            "Speedup = 570,000 / 170,510 = 3.34.",
          ],
        },
        {
          type: "callout",
          variant: "exam-tip",
          text: "The slowest stage sets the clock. Non-pipelined time is the sum of stage delays without latch delay, unless the question says otherwise.",
        },
      ],
    },
    {
      id: "hazards",
      title: "Pipeline Hazards",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "A **hazard** is a situation that prevents the next instruction from running in its intended cycle. Hazards cause **stalls**, which raise the CPI above 1.",
        },
        {
          type: "diagram",
          title: "Hazard types and fixes",
          caption: "Each hazard type has its own remedies.",
          kind: "flowchart",
          mermaid: `flowchart TD
  H["Pipeline Hazards"]
  H --> S["Structural: hardware conflict"]
  H --> D["Data: operand not ready"]
  H --> C["Control: next PC not known"]
  S --> S1["Duplicate hardware or stall"]
  D --> D1["Forwarding, stalls, instruction scheduling"]
  C --> C1["Branch prediction, delayed branch, stall"]`,
        },
        {
          type: "table",
          headers: ["Data hazard", "Meaning", "Example", "Dependency"],
          rows: [
            ["RAW", "Read after write", "`ADD R1,R2,R3` then `SUB R4,R1,R5`", "True"],
            ["WAR", "Write after read", "`SUB R4,R1,R5` then `ADD R1,R2,R3`", "Anti"],
            ["WAW", "Write after write", "`ADD R1,R2,R3` then `SUB R1,R4,R5`", "Output"],
          ],
        },
        {
          type: "callout",
          variant: "remember",
          text: "In a simple in-order 5-stage pipeline, only RAW causes problems. WAR and WAW appear with out-of-order execution and are removed by register renaming.",
        },
        {
          type: "callout",
          variant: "formula",
          text: "CPI with stalls = 1 + stall cycles per instruction. Speedup = k / (1 + stalls per instruction), for equal stages",
        },
      ],
    },
    {
      id: "forwarding",
      title: "Forwarding & Stalls",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "**Forwarding** (bypassing) sends a result directly from a later pipeline latch to the ALU input, without waiting for write back. This removes most RAW stalls.",
        },
        {
          type: "diagram",
          title: "Forwarding paths",
          caption: "Results in the EX/MEM and MEM/WB latches are routed back to the ALU inputs through multiplexers.",
          kind: "working-diagram",
          mermaid: `flowchart LR
  ID["ID/EX Latch"] --> MUX["Forwarding MUX"]
  MUX --> ALU["ALU"]
  ALU --> EXM["EX/MEM Latch"]
  EXM --> MW["MEM/WB Latch"]
  EXM -->|"Forward"| MUX
  MW -->|"Forward"| MUX
  FU["Forwarding Unit"] -.-> MUX`,
        },
        {
          type: "paragraph",
          text: "Forwarding cannot fix every case. A **load-use hazard** still needs one stall, because loaded data is available only after MEM, while the next instruction needs it at the start of EX.",
        },
        {
          type: "table",
          headers: ["Instruction", "C1", "C2", "C3", "C4", "C5", "C6", "C7"],
          rows: [
            ["`LW R1, 0(R2)`", "IF", "ID", "EX", "MEM", "WB", "", ""],
            ["`ADD R3, R1, R4`", "", "IF", "ID", "Stall", "EX", "MEM", "WB"],
          ],
        },
        {
          type: "diagram",
          title: "Handling a data dependency",
          caption: "A decision flow used by the hazard detection unit.",
          kind: "working-flowchart",
          mermaid: `flowchart TD
  A["Decode next instruction"] --> B{"Source register written by an earlier instruction still in the pipeline?"}
  B -->|"No"| GO["Proceed normally"]
  B -->|"Yes"| C{"Is the earlier instruction a load right before this one?"}
  C -->|"Yes"| ST["Stall one cycle, then forward from MEM/WB"]
  C -->|"No"| FW["Forward result to ALU input"]
  ST --> GO
  FW --> GO`,
        },
        {
          type: "example",
          title: "CPI with load-use stalls",
          steps: [
            "Given: 25% of instructions are loads and 40% of those are followed immediately by a dependent instruction. Each case costs 1 stall.",
            "Stalls per instruction = 0.25 × 0.40 × 1 = 0.1.",
            "CPI = 1 + 0.1 = 1.1.",
          ],
        },
        {
          type: "callout",
          variant: "exam-tip",
          text: "Without forwarding, a RAW dependency between adjacent instructions costs 2 stalls if the register file writes in the first half of the cycle and reads in the second half. Otherwise it costs 3. State your assumption.",
        },
      ],
    },
    {
      id: "branch-prediction",
      title: "Control Hazards & Branch Prediction",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "A branch does not reveal its target and outcome until a later stage. Instructions fetched in the meantime may have to be flushed. The number of lost cycles is the **branch penalty**.",
        },
        {
          type: "points",
          items: [
            "**Stall:** simply wait for the branch to resolve. This is simple but slow.",
            "**Static prediction:** always predict not taken, or predict backward branches as taken since they are often loops.",
            "**Delayed branch:** the compiler fills the slot after the branch with a useful instruction that always runs.",
            "**Dynamic prediction:** use history stored in hardware, such as a branch history table and a branch target buffer.",
          ],
        },
        {
          type: "diagram",
          title: "2-bit branch predictor",
          caption: "Two wrong predictions in a row are needed to change the prediction, so a loop exit does not disturb the next run of the loop.",
          kind: "working-diagram",
          mermaid: `stateDiagram-v2
  [*] --> StrongNotTaken
  StrongNotTaken --> WeakNotTaken: Taken
  WeakNotTaken --> StrongNotTaken: Not taken
  WeakNotTaken --> WeakTaken: Taken
  WeakTaken --> WeakNotTaken: Not taken
  WeakTaken --> StrongTaken: Taken
  StrongTaken --> WeakTaken: Not taken
  StrongTaken --> StrongTaken: Taken
  StrongNotTaken --> StrongNotTaken: Not taken`,
        },
        {
          type: "callout",
          variant: "formula",
          text: "CPI = 1 + branch frequency × misprediction rate × branch penalty",
        },
        {
          type: "example",
          title: "Effect of branch prediction",
          steps: [
            "Given: 20% of instructions are branches and the penalty is 3 cycles.",
            "Without prediction, every branch stalls: CPI = 1 + 0.2 × 3 = 1.6.",
            "With a 90% accurate predictor: CPI = 1 + 0.2 × 0.1 × 3 = 1.06.",
            "Improvement = 1.6 / 1.06 = 1.51 times faster.",
          ],
        },
      ],
    },
    {
      id: "superscalar-flynn",
      title: "Superscalar & Flynn's Classification",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "A **superscalar** processor issues more than one instruction per cycle using multiple execution units. Hardware finds independent instructions at run time. **VLIW** leaves that decision to the compiler, which packs operations into one long instruction.",
        },
        {
          type: "points",
          items: [
            "**Ideal CPI** of an m-issue machine is 1/m. For example, a 4-issue machine has an ideal CPI of 0.25.",
            "**Out-of-order execution** runs instructions as soon as their operands are ready.",
            "**Register renaming** removes false dependencies (WAR and WAW).",
            "**Speculation** executes past predicted branches and discards the work if the prediction was wrong.",
            "**Superpipelining** uses more, shorter stages to raise the clock rate.",
          ],
        },
        {
          type: "paragraph",
          text: "**Flynn's classification** groups computers by the number of concurrent instruction and data streams.",
        },
        {
          type: "table",
          headers: ["Class", "Instruction streams", "Data streams", "Example"],
          rows: [
            ["SISD", "Single", "Single", "Classic uniprocessor"],
            ["SIMD", "Single", "Multiple", "Vector units, GPUs, SSE and AVX"],
            ["MISD", "Multiple", "Single", "Rare, used in some fault-tolerant systems"],
            ["MIMD", "Multiple", "Multiple", "Multicore processors, clusters"],
          ],
        },
        {
          type: "diagram",
          title: "Flynn's classification",
          caption: "Two questions, one about instruction streams and one about data streams, decide the class.",
          kind: "flowchart",
          mermaid: `flowchart TD
  Q1{"Multiple instruction streams?"}
  Q1 -->|"No"| Q2{"Multiple data streams?"}
  Q1 -->|"Yes"| Q3{"Multiple data streams?"}
  Q2 -->|"No"| SISD["SISD"]
  Q2 -->|"Yes"| SIMD["SIMD"]
  Q3 -->|"No"| MISD["MISD"]
  Q3 -->|"Yes"| MIMD["MIMD"]`,
        },
      ],
    },
  ],
  flashcards: [
    { front: "Pipeline time formula", back: "T = (k + n − 1) × τ for n instructions on k stages." },
    { front: "Pipeline clock", back: "τ = slowest stage delay + latch delay." },
    { front: "Ideal speedup", back: "Approaches k, the number of stages, for large n and equal stages." },
    { front: "Structural hazard", back: "Two instructions need the same hardware resource in one cycle." },
    { front: "Data hazard", back: "An instruction depends on a result that is not yet available." },
    { front: "Control hazard", back: "The next PC is unknown because a branch has not been resolved." },
    { front: "RAW, WAR, WAW", back: "RAW is true dependency. WAR is anti-dependency. WAW is output dependency." },
    { front: "Forwarding", back: "Routing a result from a pipeline latch directly to the ALU without waiting for write back." },
    { front: "Load-use hazard", back: "A dependent instruction right after a load needs one stall even with forwarding." },
    { front: "Delayed branch", back: "The instruction after the branch always executes, and the compiler places a useful one there." },
    { front: "2-bit predictor", back: "A saturating counter that changes its prediction only after two consecutive mispredictions." },
    { front: "Superscalar", back: "Issues several instructions per cycle using multiple execution units, chosen by hardware at run time." },
    { front: "Register renaming", back: "Maps architectural registers to physical ones, removing WAR and WAW hazards." },
    { front: "Flynn's classes", back: "SISD, SIMD, MISD and MIMD, based on the number of instruction and data streams." },
  ],
  quiz: [
    { id: "ch06-q01", question: "Pipelining primarily improves:", options: ["Latency of each instruction", "Throughput", "Memory size", "Instruction length"], answerIndex: 1, explanation: "Each instruction takes about the same time or longer, but more instructions finish per unit time.", difficulty: "easy", topic: "Pipeline Basics" },
    { id: "ch06-q02", question: "How many cycles do 100 instructions take on a 4-stage ideal pipeline?", options: ["100", "103", "104", "400"], answerIndex: 1, explanation: "Cycles = k + n − 1 = 4 + 100 − 1 = 103.", difficulty: "easy", topic: "Pipeline Performance" },
    { id: "ch06-q03", question: "Stage delays are 200, 150, 250 and 100 ns, with a 10 ns latch delay. What is the clock period?", options: ["250 ns", "260 ns", "700 ns", "710 ns"], answerIndex: 1, explanation: "τ = 250 + 10 = 260 ns.", difficulty: "medium", topic: "Pipeline Performance" },
    { id: "ch06-q04", question: "What is the maximum ideal speedup of a 6-stage pipeline?", options: ["3", "5", "6", "7"], answerIndex: 2, explanation: "With equal stages and large n, speedup approaches k = 6.", difficulty: "easy", topic: "Pipeline Performance" },
    { id: "ch06-q05", question: "ADD R1,R2,R3 is followed by SUB R4,R1,R5. What kind of hazard is this?", options: ["WAR", "WAW", "RAW", "Structural"], answerIndex: 2, explanation: "SUB reads R1 after ADD writes it, which is read after write.", difficulty: "easy", topic: "Data Hazards" },
    { id: "ch06-q06", question: "Which technique eliminates most RAW stalls?", options: ["Flushing", "Forwarding", "Delayed branch", "Virtual memory"], answerIndex: 1, explanation: "Forwarding sends the result to the ALU before write back.", difficulty: "easy", topic: "Forwarding" },
    { id: "ch06-q07", question: "With full forwarding, how many stalls does a load followed by a dependent ALU instruction need?", options: ["0", "1", "2", "3"], answerIndex: 1, explanation: "Load data is ready only after MEM, so one stall is required before EX of the next instruction.", difficulty: "medium", topic: "Forwarding" },
    { id: "ch06-q08", question: "A single-port memory shared for instructions and data can cause which hazard?", options: ["Data", "Control", "Structural", "None"], answerIndex: 2, explanation: "IF and MEM may need memory in the same cycle, a resource conflict. Split caches avoid it.", difficulty: "medium", topic: "Structural Hazards" },
    { id: "ch06-q09", question: "20% of instructions are branches, the penalty is 2 cycles and 60% of branches are taken. Using predict-not-taken, what is the CPI?", options: ["1.12", "1.24", "1.40", "1.60"], answerIndex: 1, explanation: "Only taken branches pay: CPI = 1 + 0.2 × 0.6 × 2 = 1.24.", difficulty: "medium", topic: "Branch Prediction" },
    { id: "ch06-q10", question: "Why is a 2-bit predictor better than a 1-bit predictor for loops?", options: ["It uses less hardware", "It mispredicts once per loop run instead of twice", "It never mispredicts", "It removes the branch"], answerIndex: 1, explanation: "A 1-bit predictor mispredicts at exit and again at re-entry. The 2-bit predictor stays on taken after one loop exit.", difficulty: "hard", topic: "Branch Prediction" },
    { id: "ch06-q11", question: "A superscalar processor differs from a basic pipeline because it:", options: ["Has no stages", "Issues multiple instructions per cycle", "Needs no branch handling", "Uses a slower clock always"], answerIndex: 1, explanation: "It has several execution units and can achieve a CPI below 1.", difficulty: "easy", topic: "Superscalar" },
    { id: "ch06-q12", question: "Which hazards does register renaming remove?", options: ["RAW only", "WAR and WAW", "Control", "Structural"], answerIndex: 1, explanation: "WAR and WAW are name dependencies, not true data flow, so renaming removes them.", difficulty: "medium", topic: "Superscalar" },
    { id: "ch06-q13", question: "A GPU applying one operation to many pixels at once is an example of:", options: ["SISD", "SIMD", "MISD", "Von Neumann bottleneck"], answerIndex: 1, explanation: "One instruction operates on multiple data items.", difficulty: "easy", topic: "Flynn's Classification" },
    { id: "ch06-q14", question: "A multicore processor running separate threads belongs to which class?", options: ["SISD", "SIMD", "MISD", "MIMD"], answerIndex: 3, explanation: "Each core runs its own instruction stream on its own data.", difficulty: "easy", topic: "Flynn's Classification" },
    { id: "ch06-q15", question: "A 5-stage pipeline has an average of 0.5 stalls per instruction, and stages are equal. What is the speedup compared with non-pipelined execution?", options: ["2.5", "3.33", "4.5", "5"], answerIndex: 1, explanation: "Speedup = 5 / (1 + 0.5) = 3.33.", difficulty: "medium", topic: "Pipeline Performance" },
  ],
  importantQuestions: [
    { q: "What is pipelining? Derive the expression for speedup of a k-stage pipeline.", marks: 7, modelAnswer: "Pipelining overlaps instruction stages to raise throughput.\nNon-pipelined time for n instructions = n × k × τ.\nPipelined time = (k + n − 1) × τ, because the first instruction takes k cycles and each later one adds one cycle.\nS = nk / (k + n − 1).\nAs n → ∞, S → k. Hazards and unequal stages reduce this in practice." },
    { q: "Explain the types of pipeline hazards with examples and how each is handled.", marks: 10, modelAnswer: "Structural: two instructions need one resource, such as a single memory port. Fix: duplicate hardware, split caches or stall.\nData: RAW (true), WAR (anti), WAW (output). Example: ADD R1,R2,R3 then SUB R4,R1,R5. Fix: forwarding, stalls, instruction scheduling, register renaming.\nControl: the next PC is unknown after a branch. Fix: stall, prediction, delayed branch, branch target buffer." },
    { q: "A 4-stage pipeline has stage delays of 60, 50, 90 and 80 ns and a latch delay of 10 ns. Find the clock period, the time for 1000 instructions, and the speedup.", marks: 6, modelAnswer: "τ = 90 + 10 = 100 ns.\nPipelined time = (4 + 1000 − 1) × 100 = 100,300 ns.\nNon-pipelined time = 1000 × (60 + 50 + 90 + 80) = 280,000 ns.\nSpeedup = 280,000 / 100,300 = 2.79." },
    { q: "Explain forwarding with a diagram. When does forwarding fail to prevent a stall?", marks: 6, modelAnswer: "Forwarding routes results from the EX/MEM and MEM/WB latches back to the ALU inputs through multiplexers controlled by a forwarding unit.\nExample: ADD R1,R2,R3 then SUB R4,R1,R5 runs without a stall.\nIt fails for load-use: LW R1,0(R2) followed by ADD R3,R1,R4. Data is available after MEM, so one stall is required." },
    { q: "Explain dynamic branch prediction using a 2-bit predictor with a state diagram.", marks: 6, modelAnswer: "Draw four states: strong and weak not taken, weak and strong taken.\nA taken branch moves one state toward strong taken, and a not-taken branch moves one state toward strong not taken.\nThe prediction changes only after two consecutive mispredictions, so a loop exit causes one misprediction rather than two." },
    { q: "Describe Flynn's classification with examples.", marks: 5, modelAnswer: "SISD: one instruction stream and one data stream, as in a uniprocessor.\nSIMD: one instruction on many data items, as in vector processors and GPUs.\nMISD: many instructions on one data stream, which is rare.\nMIMD: many instruction and data streams, as in multicore systems and clusters." },
    { q: "Differentiate between superscalar and VLIW architectures.", marks: 4, modelAnswer: "Superscalar: hardware finds independent instructions at run time, with complex hardware and binary compatibility.\nVLIW: the compiler packs parallel operations into one long instruction, with simpler hardware but dependence on the compiler and weaker binary compatibility." },
  ],
  keyTerms: ["Pipeline", "Throughput", "Speedup", "Structural hazard", "Data hazard", "Control hazard", "Forwarding", "Load-use hazard", "Branch prediction", "Superscalar", "VLIW", "Register renaming", "Flynn's classification"],
};

export default chapter;
