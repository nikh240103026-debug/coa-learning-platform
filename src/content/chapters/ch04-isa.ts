import type { Chapter } from "@/lib/types";

const chapter: Chapter = {
  slug: "isa-addressing",
  number: 4,
  title: "Instruction Set Architecture & Addressing Modes",
  summary:
    "How instructions are encoded and classified, how RISC and CISC differ, and how each addressing mode finds its operand.",
  estMinutes: 45,
  videoUrl: "",
  learningObjectives: [
    "Explain the fields of an instruction and calculate field sizes",
    "Write programs using 3, 2, 1 and 0-address instructions",
    "Classify instructions by type",
    "Calculate the effective address for each addressing mode",
    "Compare RISC and CISC",
  ],
  sections: [
    {
      id: "instruction-format",
      title: "Instruction Formats",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "An instruction tells the CPU what to do and where to find the data. It contains an **opcode** field and zero or more **operand** fields, plus sometimes a mode field that says how to interpret the operands.",
        },
        {
          type: "diagram",
          title: "Typical instruction format",
          caption: "Field sizes must add up to the instruction length. The opcode width sets the maximum number of operations.",
          kind: "block",
          mermaid: `flowchart LR
  OP["Opcode: which operation"] --- MODE["Mode: how to find operand"] --- ADDR["Address or register: where the operand is"]`,
        },
        {
          type: "callout",
          variant: "formula",
          text: "An n-bit opcode supports 2ⁿ operations. An a-bit address field reaches 2ᵃ locations. Addressing r registers needs ⌈log₂ r⌉ bits",
        },
        {
          type: "example",
          title: "Finding the immediate field size",
          steps: [
            "Given: 32-bit instructions, 45 opcodes, 64 registers, and each instruction has 2 register operands and an immediate.",
            "Opcode bits = ⌈log₂ 45⌉ = 6.",
            "Register bits = 2 × ⌈log₂ 64⌉ = 2 × 6 = 12.",
            "Immediate bits = 32 − 6 − 12 = 14.",
            "Signed immediate range = −2¹³ to 2¹³ − 1, which is −8192 to +8191.",
          ],
        },
      ],
    },
    {
      id: "address-instructions",
      title: "3, 2, 1 & 0-Address Instructions",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "Machines differ in how many operands an instruction names explicitly. Fewer addresses mean shorter instructions but more of them. The example below evaluates `X = (A + B) × (C + D)`.",
        },
        {
          type: "table",
          headers: ["3-address", "2-address", "1-address (accumulator)", "0-address (stack)"],
          rows: [
            ["`ADD R1, A, B`", "`MOV R1, A`", "`LOAD A`", "`PUSH A`"],
            ["`ADD R2, C, D`", "`ADD R1, B`", "`ADD B`", "`PUSH B`"],
            ["`MUL X, R1, R2`", "`MOV R2, C`", "`STORE T`", "`ADD`"],
            ["", "`ADD R2, D`", "`LOAD C`", "`PUSH C`"],
            ["", "`MUL R1, R2`", "`ADD D`", "`PUSH D`"],
            ["", "`MOV X, R1`", "`MUL T`", "`ADD`"],
            ["", "", "`STORE X`", "`MUL`"],
            ["", "", "", "`POP X`"],
          ],
        },
        {
          type: "diagram",
          title: "Stack machine evaluating (A + B) × (C + D)",
          caption: "Operands are pushed. ADD and MUL pop the top two values and push the result.",
          kind: "working-flowchart",
          mermaid: `flowchart TD
  P1["PUSH A: stack is A"] --> P2["PUSH B: stack is A, B"]
  P2 --> P3["ADD: stack is A+B"]
  P3 --> P4["PUSH C: stack is A+B, C"]
  P4 --> P5["PUSH D: stack is A+B, C, D"]
  P5 --> P6["ADD: stack is A+B, C+D"]
  P6 --> P7["MUL: stack holds the product"]
  P7 --> P8["POP X: result stored in X"]`,
        },
        {
          type: "callout",
          variant: "remember",
          text: "Accumulator machines use an implied accumulator. Stack machines use an implied top of stack, so arithmetic instructions name no operands at all.",
        },
      ],
    },
    {
      id: "instruction-types",
      title: "Types of Instructions",
      videoUrl: "",
      blocks: [
        {
          type: "table",
          headers: ["Type", "Purpose", "Examples"],
          rows: [
            ["Data transfer", "Move data between registers, memory and I/O", "`MOV`, `LOAD`, `STORE`, `PUSH`, `POP`"],
            ["Arithmetic", "Perform calculations", "`ADD`, `SUB`, `MUL`, `DIV`, `INC`"],
            ["Logical and bit", "Manipulate bits", "`AND`, `OR`, `XOR`, `NOT`, `SHL`, `ROR`"],
            ["Program control", "Change the flow of execution", "`JMP`, `BEQ`, `CALL`, `RET`"],
            ["I/O and system", "Access devices or control the CPU", "`IN`, `OUT`, `HLT`, `INT`"],
          ],
        },
        {
          type: "points",
          items: [
            "**Conditional branches** test status flags: Zero, Sign, Carry and Overflow.",
            "**CALL** saves the return address, usually on the stack, and then jumps.",
            "**RET** pops the return address into the PC.",
          ],
        },
        {
          type: "diagram",
          title: "Subroutine call and return",
          caption: "The stack lets calls nest, because the most recent return address is restored first.",
          kind: "working-flowchart",
          mermaid: `flowchart TD
  A["Main program runs CALL SUB"] --> B["Push return address onto stack"]
  B --> C["Load PC with SUB address"]
  C --> D["Execute subroutine body"]
  D --> E["RET instruction"]
  E --> F["Pop return address into PC"]
  F --> G["Main program continues"]`,
        },
      ],
    },
    {
      id: "addressing-modes",
      title: "Addressing Modes",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "An addressing mode is the rule for finding an operand. The result of that rule is the **effective address (EA)**, which is the actual memory location of the operand.",
        },
        {
          type: "table",
          headers: ["Mode", "Rule", "Memory accesses for operand", "Typical use"],
          rows: [
            ["Immediate", "Operand is in the instruction", "0", "Constants"],
            ["Register", "Operand is in a register", "0", "Fast local values"],
            ["Direct", "EA = address field", "1", "Global variables"],
            ["Indirect", "EA = M[address field]", "2", "Pointers"],
            ["Register indirect", "EA = R", "1", "Pointers in registers"],
            ["Indexed", "EA = address field + index register", "1", "Arrays"],
            ["Base register", "EA = base register + offset", "1", "Relocatable code"],
            ["PC-relative", "EA = PC + offset", "1", "Branches"],
            ["Autoincrement", "EA = R, then R = R + d", "1", "Stepping through arrays"],
            ["Autodecrement", "R = R − d, then EA = R", "1", "Stacks"],
          ],
        },
        {
          type: "diagram",
          title: "Finding the operand",
          caption: "Follow the mode field to see where the operand comes from.",
          kind: "working-flowchart",
          mermaid: `flowchart TD
  S1["Read mode field"] --> M{"Mode?"}
  M -->|"Immediate"| IM["Operand = address field"]
  M -->|"Register"| RG["Operand = R"]
  M -->|"Direct"| DR["EA = address field"]
  M -->|"Indirect"| ID["EA = M at address field"]
  M -->|"Register indirect"| RI["EA = R"]
  M -->|"Indexed"| IX["EA = address field + index"]
  M -->|"PC-relative"| PC["EA = PC + offset"]
  DR --> RD["Operand = M at EA"]
  ID --> RD
  RI --> RD
  IX --> RD
  PC --> RD`,
        },
        {
          type: "example",
          title: "Effective address for each mode",
          steps: [
            "Given: a two-word load instruction sits at addresses 300 and 301. Address field = 400, so the next PC = 302. R1 = 500, index register XR = 50.",
            "Memory: M[400] = 700, M[450] = 800, M[499] = 120, M[500] = 600, M[700] = 350, M[702] = 275.",
            "Direct: EA = 400, operand = 700.",
            "Immediate: operand = 400, stored at location 301.",
            "Indirect: EA = M[400] = 700, operand = 350.",
            "PC-relative: EA = 302 + 400 = 702, operand = 275.",
            "Indexed: EA = 50 + 400 = 450, operand = 800.",
            "Register: operand = R1 = 500.",
            "Register indirect: EA = 500, operand = 600.",
            "Autoincrement: EA = 500, operand = 600, then R1 becomes 501.",
            "Autodecrement: R1 becomes 499 first, so EA = 499 and operand = 120.",
          ],
        },
        {
          type: "callout",
          variant: "exam-tip",
          text: "In PC-relative numericals, the PC already points to the next instruction when the offset is added. Add the instruction length before calculating the EA.",
        },
      ],
    },
    {
      id: "risc-cisc",
      title: "RISC vs CISC",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "**CISC** processors provide many powerful instructions, so one instruction can do several steps. **RISC** processors provide fewer simple instructions that finish quickly and are easy to pipeline.",
        },
        {
          type: "table",
          headers: ["Feature", "RISC", "CISC"],
          rows: [
            ["Instruction count", "Small", "Large"],
            ["Instruction length", "Fixed", "Variable"],
            ["Addressing modes", "Few", "Many"],
            ["Memory access", "Only load and store", "Many instructions can access memory"],
            ["Typical CPI", "About 1", "Greater than 1"],
            ["Control unit", "Usually hardwired", "Often microprogrammed"],
            ["Registers", "Many", "Fewer"],
            ["Pipelining", "Easy", "Harder"],
            ["Examples", "ARM, RISC-V, MIPS", "x86, VAX"],
          ],
        },
        {
          type: "diagram",
          title: "Same task in RISC and CISC",
          caption: "CISC uses one complex instruction. RISC uses several simple ones, which are easier to pipeline.",
          kind: "flowchart",
          mermaid: `flowchart LR
  subgraph CI["CISC"]
    C1["MUL A, B: load, multiply and store in one instruction"]
  end
  subgraph RI["RISC"]
    direction LR
    R1["LOAD R1, A"] --> R2["LOAD R2, B"]
    R2 --> R3["MUL R1, R2"]
    R3 --> R4["STORE A, R1"]
  end`,
        },
        {
          type: "callout",
          variant: "remember",
          text: "Load-store architecture means only LOAD and STORE touch memory. All arithmetic works on registers. This is the defining feature of RISC.",
        },
        {
          type: "callout",
          variant: "exam-tip",
          text: "Modern x86 chips decode CISC instructions into RISC-like micro-operations internally. Mentioning this earns credit in a long answer.",
        },
      ],
    },
  ],
  flashcards: [
    { front: "Opcode", back: "The instruction field specifying the operation. n bits allow 2ⁿ operations." },
    { front: "Effective address", back: "The actual memory address of the operand after the addressing mode is applied." },
    { front: "Immediate mode", back: "The operand is inside the instruction, so no memory access is needed for it." },
    { front: "Direct mode", back: "The address field holds the operand's memory address. EA = address field." },
    { front: "Indirect mode", back: "The address field points to a location holding the EA. EA = M[address field]." },
    { front: "Register indirect mode", back: "A register holds the operand's memory address. EA = R." },
    { front: "Indexed mode", back: "EA = address field + index register. Commonly used for arrays." },
    { front: "PC-relative mode", back: "EA = PC + offset. Used for branches and position-independent code." },
    { front: "Autodecrement mode", back: "Decrement the register first, then use it as the EA. Commonly used to push onto a stack." },
    { front: "Zero-address instruction", back: "Operands are implied on the stack, as in stack machines." },
    { front: "Load-store architecture", back: "Only load and store instructions access memory. Arithmetic uses registers." },
    { front: "RISC", back: "A small set of simple, fixed-length instructions with CPI near 1, designed for easy pipelining." },
    { front: "CISC", back: "A large set of complex, variable-length instructions, often microprogrammed, with many addressing modes." },
  ],
  quiz: [
    { id: "ch04-q01", question: "A computer has 16-bit instructions with a 6-bit opcode and the remainder as a direct address. How many words can it address?", options: ["64", "512", "1024", "65536"], answerIndex: 2, explanation: "16 − 6 = 10 address bits, and 2¹⁰ = 1024.", difficulty: "easy", topic: "Instruction Format" },
    { id: "ch04-q02", question: "Which addressing mode needs no memory access to get the operand?", options: ["Direct", "Indirect", "Immediate", "Indexed"], answerIndex: 2, explanation: "In immediate mode the operand is already part of the fetched instruction.", difficulty: "easy", topic: "Addressing Modes" },
    { id: "ch04-q03", question: "Which addressing mode is best for accessing array elements?", options: ["Immediate", "Indexed", "Register", "Direct"], answerIndex: 1, explanation: "The address field holds the array's base and the index register holds the element offset.", difficulty: "easy", topic: "Addressing Modes" },
    { id: "ch04-q04", question: "How many memory accesses does an indirect mode operand need, after the instruction fetch?", options: ["0", "1", "2", "3"], answerIndex: 2, explanation: "One access reads the effective address, and a second reads the operand.", difficulty: "medium", topic: "Addressing Modes" },
    { id: "ch04-q05", question: "A 2-word instruction is at address 500. Its address field is 100 and the mode is PC-relative. What is the EA?", options: ["600", "601", "602", "100"], answerIndex: 2, explanation: "After fetching 2 words, PC = 502. EA = 502 + 100 = 602.", difficulty: "medium", topic: "Addressing Modes" },
    { id: "ch04-q06", question: "R1 contains 1000 and the instruction uses autoincrement with a step of 4. What are the EA and R1 afterwards?", options: ["EA 1000, R1 1004", "EA 1004, R1 1004", "EA 1000, R1 1000", "EA 996, R1 996"], answerIndex: 0, explanation: "Autoincrement uses R1 first, then adds the step.", difficulty: "medium", topic: "Addressing Modes" },
    { id: "ch04-q07", question: "Which addressing mode is most suitable for implementing a stack push?", options: ["Immediate", "Autodecrement", "Direct", "PC-relative"], answerIndex: 1, explanation: "On a downward-growing stack, decrementing the stack pointer before the write implements a push.", difficulty: "medium", topic: "Addressing Modes" },
    { id: "ch04-q08", question: "How many instructions does a stack machine need for X = A + B?", options: ["1", "2", "3", "4"], answerIndex: 3, explanation: "PUSH A, PUSH B, ADD and POP X.", difficulty: "easy", topic: "Instruction Formats" },
    { id: "ch04-q09", question: "Which is a key characteristic of RISC?", options: ["Variable instruction length", "Many addressing modes", "Load-store architecture", "Microprogrammed control required"], answerIndex: 2, explanation: "Only load and store access memory in RISC, while arithmetic works on registers.", difficulty: "easy", topic: "RISC vs CISC" },
    { id: "ch04-q10", question: "Which processor family is an example of CISC?", options: ["ARM", "RISC-V", "MIPS", "x86"], answerIndex: 3, explanation: "x86 has variable-length instructions and complex memory operations.", difficulty: "easy", topic: "RISC vs CISC" },
    { id: "ch04-q11", question: "A machine has 32-bit instructions, 128 registers and 3-register instructions. What is the maximum number of opcodes?", options: ["2048", "4096", "1024", "256"], answerIndex: 0, explanation: "Registers use 7 × 3 = 21 bits, leaving 11 opcode bits, so 2¹¹ = 2048.", difficulty: "hard", topic: "Instruction Format" },
    { id: "ch04-q12", question: "Which addressing mode makes program relocation easiest?", options: ["Direct", "Base register", "Immediate", "Absolute"], answerIndex: 1, explanation: "To relocate, only the base register value needs to change.", difficulty: "medium", topic: "Addressing Modes" },
    { id: "ch04-q13", question: "CALL differs from JMP because CALL:", options: ["Is always conditional", "Saves the return address", "Cannot use memory", "Does not change the PC"], answerIndex: 1, explanation: "CALL saves the return address so RET can come back to the caller.", difficulty: "easy", topic: "Instruction Types" },
  ],
  importantQuestions: [
    { q: "Explain the addressing modes with an example of each, and calculate the effective address.", marks: 10, modelAnswer: "Immediate: `MOV R1, #5`, operand in instruction.\nRegister: `ADD R1, R2`, operand in register.\nDirect: `LOAD 400`, EA = 400.\nIndirect: `LOAD @400`, EA = M[400].\nRegister indirect: `LOAD (R1)`, EA = R1.\nIndexed: `LOAD 400(X)`, EA = 400 + X.\nPC-relative: `BEQ offset`, EA = PC + offset.\nAutoincrement: `LOAD (R1)+`, EA = R1, then R1 is incremented.\nAutodecrement: `LOAD -(R1)`, R1 is decremented, then EA = R1.\nAdd a short numerical with PC, register and memory values." },
    { q: "Write programs to evaluate X = (A + B) × (C − D) using 3, 2, 1 and 0-address instructions.", marks: 8, modelAnswer: "3-address: ADD R1, A, B / SUB R2, C, D / MUL X, R1, R2.\n2-address: MOV R1, A / ADD R1, B / MOV R2, C / SUB R2, D / MUL R1, R2 / MOV X, R1.\n1-address: LOAD C / SUB D / STORE T / LOAD A / ADD B / MUL T / STORE X.\n0-address: PUSH A / PUSH B / ADD / PUSH C / PUSH D / SUB / MUL / POP X." },
    { q: "Compare RISC and CISC architectures.", marks: 6, modelAnswer: "RISC: few simple instructions, fixed length, few addressing modes, load-store only, CPI near 1, hardwired control, many registers, easy pipelining. Examples: ARM and RISC-V.\nCISC: many complex instructions, variable length, many modes, memory operands in most instructions, higher CPI, often microprogrammed, fewer registers. Examples: x86 and VAX." },
    { q: "A machine has 32-bit instructions, 200 opcodes and 32 registers. Each instruction names 2 registers and a memory offset. Find the offset width and range.", marks: 5, modelAnswer: "Opcode bits = ⌈log₂ 200⌉ = 8.\nRegister bits = 2 × 5 = 10.\nOffset bits = 32 − 8 − 10 = 14.\nUnsigned range: 0 to 16383. Signed range: −8192 to +8191." },
    { q: "What is an instruction format? Explain the instruction types with examples.", marks: 5, modelAnswer: "An instruction format is the layout of an instruction's bits into opcode, mode and address fields.\nData transfer: MOV, LOAD, STORE.\nArithmetic: ADD, MUL.\nLogical: AND, SHL.\nProgram control: JMP, CALL, RET.\nI/O: IN, OUT." },
    { q: "Why are autoincrement and autodecrement modes useful? Show how they support a stack.", marks: 4, modelAnswer: "They step a pointer automatically, so no separate increment instruction is needed. This shortens loops over arrays.\nFor a stack growing downward: push uses autodecrement, as in `MOV -(SP), R1`, and pop uses autoincrement, as in `MOV R1, (SP)+`." },
  ],
  keyTerms: ["Opcode", "Effective address", "Immediate addressing", "Direct addressing", "Indirect addressing", "Indexed addressing", "PC-relative addressing", "Stack machine", "Load-store architecture", "RISC", "CISC"],
};

export default chapter;
