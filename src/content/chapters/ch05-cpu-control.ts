import type { Chapter } from "@/lib/types";

const chapter: Chapter = {
  slug: "cpu-control",
  number: 5,
  title: "CPU Organization & Control Unit",
  summary:
    "Inside the processor: registers, the instruction cycle, micro-operations, and how hardwired and microprogrammed control units generate control signals.",
  estMinutes: 50,
  videoUrl: "",
  learningObjectives: [
    "Identify CPU registers and their roles",
    "Trace the fetch, decode, execute cycle using micro-operations",
    "Explain how a single-bus datapath moves data",
    "Compare hardwired and microprogrammed control",
    "Calculate control memory size and microinstruction width",
  ],
  sections: [
    {
      id: "cpu-registers",
      title: "CPU Registers & Organization",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "A CPU consists of a datapath (registers, ALU and internal buses) and a control unit. Registers are small and very fast storage locations inside the CPU.",
        },
        {
          type: "table",
          headers: ["Register", "Full name", "Role"],
          rows: [
            ["PC", "Program Counter", "Holds the address of the next instruction"],
            ["IR", "Instruction Register", "Holds the instruction being executed"],
            ["MAR", "Memory Address Register", "Holds the address sent to memory"],
            ["MDR", "Memory Data Register", "Holds data read from or written to memory"],
            ["AC", "Accumulator", "Holds an ALU operand or result"],
            ["SP", "Stack Pointer", "Holds the address of the top of the stack"],
            ["PSW", "Program Status Word", "Holds flags such as Zero, Carry, Sign and Overflow"],
          ],
        },
        {
          type: "diagram",
          title: "Basic CPU organization",
          caption: "The control unit decodes the IR and directs the datapath. MAR and MDR are the CPU's interface to memory.",
          kind: "block",
          mermaid: `flowchart LR
  subgraph CPUBOX["CPU"]
    PC["PC"]
    IR["IR"]
    REGS["General Registers"]
    ALU["ALU"]
    FLAGS["Status Flags"]
    CU["Control Unit"]
    MAR["MAR"]
    MDR["MDR"]
  end
  MEM["Main Memory"]
  PC --> MAR
  MAR -->|"Address"| MEM
  MEM <-->|"Data"| MDR
  MDR --> IR
  IR --> CU
  MDR <--> REGS
  REGS <--> ALU
  ALU --> FLAGS
  FLAGS --> CU`,
        },
        {
          type: "callout",
          variant: "remember",
          text: "MAR sets where to access and MDR holds what is transferred. All memory traffic goes through this pair.",
        },
      ],
    },
    {
      id: "instruction-cycle",
      title: "Instruction Cycle",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "The CPU repeats the instruction cycle for as long as it runs. Each cycle fetches an instruction, decodes it, gets any operands, executes it and then checks for interrupts.",
        },
        {
          type: "diagram",
          title: "Instruction cycle",
          caption: "The interrupt check at the end of each instruction lets the CPU respond between instructions.",
          kind: "flowchart",
          mermaid: `flowchart TD
  F["Fetch instruction using PC"] --> INC["Increment PC"]
  INC --> D["Decode instruction in IR"]
  D --> IND{"Indirect operand?"}
  IND -->|"Yes"| OPF["Fetch effective address from memory"]
  IND -->|"No"| EX["Execute operation"]
  OPF --> EX
  EX --> INT{"Interrupt pending?"}
  INT -->|"Yes"| ISR["Save state and run interrupt routine"]
  INT -->|"No"| F
  ISR --> F`,
        },
        {
          type: "points",
          items: [
            "**Fetch:** read the instruction at the address in PC into IR, then advance PC.",
            "**Decode:** the control unit identifies the operation and addressing mode.",
            "**Operand fetch:** find the effective address and read any memory operands.",
            "**Execute:** perform the operation and store the result.",
            "**Interrupt check:** handle any pending interrupt before the next instruction.",
          ],
        },
        {
          type: "callout",
          variant: "exam-tip",
          text: "Questions asking when PC is incremented expect this answer: during the fetch phase, before execution. That is why PC-relative offsets start from the next instruction.",
        },
      ],
    },
    {
      id: "micro-operations",
      title: "Micro-operations & Register Transfer",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "A **micro-operation** is the smallest step of an instruction, usually a transfer between registers or a simple ALU action, done in one clock cycle. Register Transfer Language (RTL) writes these as `R1 ← R2`.",
        },
        {
          type: "table",
          headers: ["Time step", "Fetch micro-operations", "What happens"],
          rows: [
            ["T0", "`MAR ← PC`", "The address of the instruction goes to MAR"],
            ["T1", "`MDR ← M[MAR]`, `PC ← PC + 1`", "Memory is read and PC advances"],
            ["T2", "`IR ← MDR`", "The instruction reaches IR"],
          ],
        },
        {
          type: "example",
          title: "Micro-operations for ADD R1, X (direct mode)",
          steps: [
            "T0 to T2: the fetch sequence shown above.",
            "T3: `MAR ← IR(address)` sends the operand address to memory.",
            "T4: `MDR ← M[MAR]` reads the operand.",
            "T5: `R1 ← R1 + MDR` performs the addition.",
            "Total: 6 clock cycles, if each step takes one cycle.",
          ],
        },
        {
          type: "points",
          items: [
            "**Register transfer:** `R1 ← R2`",
            "**Arithmetic:** `R1 ← R2 + R3`",
            "**Logic:** `R1 ← R2 AND R3`",
            "**Shift:** `R1 ← shl R2`",
            "**Memory:** `MDR ← M[MAR]`, which needs the memory to respond",
          ],
        },
        {
          type: "diagram",
          title: "Single-bus datapath: moving R1 to R2",
          caption: "Only one register can drive the bus at a time. The source enables its output and the destination enables its input in the same clock cycle.",
          kind: "working-diagram",
          mermaid: `sequenceDiagram
  participant CU as Control Unit
  participant R1 as Register R1
  participant BUS as Internal Bus
  participant R2 as Register R2
  CU->>R1: Assert R1out
  CU->>R2: Assert R2in
  R1->>BUS: Place value on bus
  BUS->>R2: Latch value at clock edge`,
        },
        {
          type: "callout",
          variant: "remember",
          text: "A single-bus ALU needs a temporary register Y for one operand and Z for the result, because the bus can carry only one value at a time. More buses mean fewer cycles per instruction.",
        },
      ],
    },
    {
      id: "hardwired-control",
      title: "Hardwired Control Unit",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "A **hardwired** control unit generates control signals using combinational logic. Its inputs are the opcode, the time step and the status flags. It is fast, but any change requires redesigning the circuit.",
        },
        {
          type: "diagram",
          title: "Hardwired control unit",
          caption: "A step counter and the decoded opcode feed the encoder, which produces every control signal.",
          kind: "block",
          mermaid: `flowchart LR
  CLK["Clock"] --> SC["Step Counter"]
  SC --> STD["Step Decoder: T0 to Tn"]
  IR["Instruction Register"] --> ID["Instruction Decoder"]
  STD --> ENC["Control Signal Encoder Logic"]
  ID --> ENC
  FL["Status Flags"] --> ENC
  ENC --> CS["Control Signals"]`,
        },
        {
          type: "paragraph",
          text: "Each signal is a Boolean function of these inputs. For example, `PCout = T0 + T3·BRANCH`, meaning PC drives the bus in step T0 of every instruction and in step T3 of a branch.",
        },
      ],
    },
    {
      id: "microprogrammed-control",
      title: "Microprogrammed Control Unit",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "A **microprogrammed** control unit stores control signals as words in a **control memory**. Each word is a **microinstruction**, and the sequence for one machine instruction is a **microprogram**.",
        },
        {
          type: "diagram",
          title: "Microprogrammed control unit",
          caption: "The sequencer picks the next microinstruction address using the opcode, flags and the current microinstruction.",
          kind: "block",
          mermaid: `flowchart LR
  IR["Instruction Register"] --> MAP["Mapping Logic"]
  MAP --> SEQ["Microprogram Sequencer"]
  FL["Status Flags"] --> SEQ
  SEQ --> CAR["Control Address Register"]
  CAR --> CM["Control Memory"]
  CM --> CDR["Control Data Register"]
  CDR --> CS["Control Signals"]
  CDR -->|"Next address"| SEQ`,
        },
        {
          type: "diagram",
          title: "Microprogram execution",
          caption: "Each machine instruction is carried out by a short routine of microinstructions.",
          kind: "working-flowchart",
          mermaid: `flowchart TD
  A["Load CAR with fetch routine address"] --> B["Read microinstruction into CDR"]
  B --> C["Issue control signals"]
  C --> D{"Fetch routine finished?"}
  D -->|"No"| E["CAR = next address"]
  E --> B
  D -->|"Yes"| F["Map opcode to routine address"]
  F --> G["Run instruction routine"]
  G --> H["Return to fetch routine"]
  H --> A`,
        },
        {
          type: "table",
          headers: ["Feature", "Horizontal microcode", "Vertical microcode"],
          rows: [
            ["Encoding", "One bit per control signal", "Signals encoded into fields"],
            ["Word width", "Wide", "Narrow"],
            ["Parallel signals", "Many at once", "Limited"],
            ["Decoding hardware", "None", "Needs decoders, adding delay"],
            ["Control memory", "Larger", "Smaller"],
          ],
        },
        {
          type: "callout",
          variant: "formula",
          text: "Horizontal microinstruction width = control signal bits + condition select bits + next address bits. Next address bits = ⌈log₂ (control memory words)⌉",
        },
        {
          type: "callout",
          variant: "formula",
          text: "Vertical encoding: a group of g mutually exclusive signals needs ⌈log₂ (g + 1)⌉ bits, with one code reserved for none active",
        },
        {
          type: "example",
          title: "Control memory size",
          steps: [
            "Given: 64 control signals, horizontal encoding, 16 status conditions, 2048 microinstructions.",
            "Next address bits = log₂ 2048 = 11.",
            "Condition select bits = log₂ 16 = 4.",
            "Word width = 64 + 4 + 11 = 79 bits.",
            "Control memory size = 2048 × 79 = 161,792 bits, which is 20,224 bytes.",
          ],
        },
        {
          type: "table",
          headers: ["Feature", "Hardwired", "Microprogrammed"],
          rows: [
            ["Implementation", "Combinational logic", "Control memory"],
            ["Speed", "Faster", "Slower, since it needs a memory read per step"],
            ["Flexibility", "Hard to change", "Easy to update"],
            ["Design complexity", "Grows quickly with large ISAs", "Regular and systematic"],
            ["Best suited to", "RISC", "CISC"],
          ],
        },
        {
          type: "callout",
          variant: "exam-tip",
          text: "When comparing the two designs, include one line on where each is used: hardwired for RISC and microprogrammed for CISC. Examiners look for it.",
        },
      ],
    },
  ],
  flashcards: [
    { front: "Program Counter", back: "Holds the address of the next instruction. It is incremented during fetch." },
    { front: "MAR", back: "Memory Address Register, which holds the address sent to memory." },
    { front: "MDR", back: "Memory Data Register, which holds data being read from or written to memory." },
    { front: "Instruction Register", back: "Holds the current instruction while it is decoded and executed." },
    { front: "Micro-operation", back: "An elementary operation done in one clock, such as a register transfer." },
    { front: "Fetch micro-operations", back: "T0: MAR ← PC. T1: MDR ← M[MAR] and PC ← PC + 1. T2: IR ← MDR." },
    { front: "Hardwired control", back: "Control signals generated by combinational logic. It is fast but inflexible." },
    { front: "Microprogrammed control", back: "Control signals stored as microinstructions in control memory. It is flexible but slower." },
    { front: "Control memory", back: "Memory, usually ROM, holding microprograms." },
    { front: "Horizontal microcode", back: "One bit per control signal, so words are wide and parallelism is high." },
    { front: "Vertical microcode", back: "Encoded fields that need decoders, so words are narrow and parallelism is limited." },
    { front: "CAR and CDR", back: "Control Address Register selects a microinstruction. Control Data Register holds the one being executed." },
  ],
  quiz: [
    { id: "ch05-q01", question: "Which register holds the address of the next instruction?", options: ["IR", "PC", "MAR", "MDR"], answerIndex: 1, explanation: "The program counter points to the next instruction to fetch.", difficulty: "easy", topic: "CPU Registers" },
    { id: "ch05-q02", question: "Which register directly supplies an address to memory?", options: ["MDR", "PC", "MAR", "IR"], answerIndex: 2, explanation: "MAR drives the address lines. PC first copies its value into MAR during fetch.", difficulty: "easy", topic: "CPU Registers" },
    { id: "ch05-q03", question: "What is the correct first micro-operation of the fetch cycle?", options: ["IR ← MDR", "MAR ← PC", "PC ← PC + 1", "MDR ← M[MAR]"], answerIndex: 1, explanation: "The address must reach MAR before memory can be read.", difficulty: "easy", topic: "Micro-operations" },
    { id: "ch05-q04", question: "How many memory reads does ADD R1, @X (indirect) need, including the fetch?", options: ["1", "2", "3", "4"], answerIndex: 2, explanation: "One for the instruction, one for the effective address and one for the operand.", difficulty: "medium", topic: "Instruction Cycle" },
    { id: "ch05-q05", question: "When is the status of an interrupt usually checked?", options: ["Before fetch only", "After each micro-operation", "At the end of each instruction", "Only during I/O instructions"], answerIndex: 2, explanation: "Checking between instructions keeps the CPU state consistent and easy to save.", difficulty: "easy", topic: "Instruction Cycle" },
    { id: "ch05-q06", question: "Why does a single-bus ALU need temporary registers?", options: ["To store flags", "Because the bus carries only one value per cycle", "To hold the PC", "To speed up the clock"], answerIndex: 1, explanation: "The two operands cannot share the bus in one cycle, so one is held in Y and the result is held in Z.", difficulty: "medium", topic: "Datapath" },
    { id: "ch05-q07", question: "Which is an advantage of hardwired control?", options: ["Easy modification", "High speed", "Low design effort for large ISAs", "Uses control memory"], answerIndex: 1, explanation: "Combinational logic produces signals directly, without a control memory read.", difficulty: "easy", topic: "Hardwired Control" },
    { id: "ch05-q08", question: "In a microprogrammed unit, what does CAR hold?", options: ["The current machine instruction", "The address of the next microinstruction", "Status flags", "An ALU result"], answerIndex: 1, explanation: "The Control Address Register selects a word in control memory.", difficulty: "easy", topic: "Microprogrammed Control" },
    { id: "ch05-q09", question: "Which type of microcode has the widest control words?", options: ["Vertical", "Horizontal", "Nano", "Encoded"], answerIndex: 1, explanation: "Horizontal microcode uses one bit per control signal.", difficulty: "easy", topic: "Microprogrammed Control" },
    { id: "ch05-q10", question: "Control memory has 1024 words. The microinstruction has 40 control bits, 3 condition bits and a next address field. What is the word width?", options: ["43", "50", "53", "1067"], answerIndex: 2, explanation: "Next address = 10 bits. Width = 40 + 3 + 10 = 53 bits.", difficulty: "medium", topic: "Control Memory" },
    { id: "ch05-q11", question: "A group of 7 mutually exclusive control signals is vertically encoded. How many bits are needed, reserving one code for none active?", options: ["2", "3", "4", "7"], answerIndex: 1, explanation: "7 signals plus the none code gives 8 codes, and log₂ 8 = 3.", difficulty: "hard", topic: "Control Memory" },
    { id: "ch05-q12", question: "Microprogrammed control is commonly used with:", options: ["CISC processors", "Simple RISC only", "Memory chips", "Cache controllers only"], answerIndex: 0, explanation: "The regular structure handles the many complex instructions of CISC well.", difficulty: "easy", topic: "Control Unit Comparison" },
    { id: "ch05-q13", question: "A control memory has 512 words of 32 bits each. What is its size?", options: ["2 KB", "4 KB", "16 KB", "32 KB"], answerIndex: 0, explanation: "512 × 32 bits = 16,384 bits = 2048 bytes = 2 KB.", difficulty: "medium", topic: "Control Memory" },
  ],
  importantQuestions: [
    { q: "Explain the instruction cycle with a flowchart, including the interrupt cycle.", marks: 7, modelAnswer: "Draw: fetch, decode, indirect check, execute, interrupt check, then back to fetch.\nFetch: IR is loaded using PC, and PC advances.\nDecode: opcode and mode are identified.\nIndirect: the effective address is read from memory if needed.\nExecute: the operation is carried out.\nInterrupt: if one is pending, save PC and state and jump to the service routine." },
    { q: "Write the micro-operations for the fetch cycle and for ADD R1, X.", marks: 6, modelAnswer: "Fetch:\nT0: MAR ← PC\nT1: MDR ← M[MAR], PC ← PC + 1\nT2: IR ← MDR\nExecute:\nT3: MAR ← IR(address)\nT4: MDR ← M[MAR]\nT5: R1 ← R1 + MDR" },
    { q: "Compare hardwired and microprogrammed control units with block diagrams.", marks: 10, modelAnswer: "Hardwired: step counter, step decoder, instruction decoder and encoder logic produce the signals. It is fast and hard to change, and suits RISC.\nMicroprogrammed: mapping logic, sequencer, CAR, control memory and CDR. Signals are read from memory. It is slower but flexible and systematic, and suits CISC.\nDraw both block diagrams." },
    { q: "Differentiate between horizontal and vertical microprogramming.", marks: 5, modelAnswer: "Horizontal: one bit per signal, wide words, no decoding, high parallelism, larger control memory.\nVertical: encoded fields, narrow words, decoders needed, limited parallelism, smaller control memory, slightly slower." },
    { q: "A processor has 128 control signals, 8 condition flags and 4096 microinstructions, using horizontal encoding. Find the word width and control memory size.", marks: 5, modelAnswer: "Next address bits = log₂ 4096 = 12.\nCondition select bits = log₂ 8 = 3.\nWidth = 128 + 3 + 12 = 143 bits.\nSize = 4096 × 143 = 585,728 bits, or 73,216 bytes." },
    { q: "Explain how an ADD R1, R2, R3 instruction is executed on a single-bus datapath.", marks: 6, modelAnswer: "After fetch, the steps are:\n1. R2out, Yin: move R2 to temporary register Y.\n2. R3out, Add, Zin: place R3 on the bus. The ALU adds it to Y and stores the sum in Z.\n3. Zout, R1in: move Z to R1.\nThree cycles are needed because the bus carries one value per cycle." },
  ],
  keyTerms: ["Program counter", "MAR", "MDR", "Instruction cycle", "Micro-operation", "Register transfer", "Hardwired control", "Microprogrammed control", "Control memory", "Horizontal microcode", "Vertical microcode"],
};

export default chapter;
