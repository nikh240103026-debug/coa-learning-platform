import type { Chapter } from "@/lib/types";

const chapter: Chapter = {
  slug: "io",
  number: 9,
  title: "Input/Output Organization",
  summary:
    "How the CPU talks to devices: I/O interfaces, programmed I/O, interrupts, DMA, buses and bus arbitration.",
  estMinutes: 45,
  videoUrl: "",
  learningObjectives: [
    "Explain the role of an I/O interface and compare memory-mapped with isolated I/O",
    "Compare programmed I/O, interrupt-driven I/O and DMA",
    "Describe interrupt handling, priority and vectoring",
    "Trace a DMA transfer and compare DMA modes",
    "Explain synchronous and asynchronous buses and bus arbitration",
  ],
  sections: [
    {
      id: "io-interface",
      title: "I/O Interfaces",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "Devices differ widely in speed, data format and signalling, so they cannot connect to the system bus directly. An **I/O interface** (or device controller) sits between them, handling the differences.",
        },
        {
          type: "points",
          items: [
            "**Address decoding:** recognizes when the CPU is addressing this device.",
            "**Data buffering:** absorbs the speed difference between CPU and device.",
            "**Status and control:** reports busy or ready, and accepts commands.",
            "**Format conversion:** for example, between serial and parallel.",
          ],
        },
        {
          type: "diagram",
          title: "I/O interface",
          caption: "The CPU sees a small set of registers. The interface turns accesses to these registers into device operations.",
          kind: "block",
          mermaid: `flowchart LR
  BUS["System Bus"] <--> DEC["Address Decoder"]
  BUS <--> DR["Data Register"]
  BUS <--> SR["Status Register"]
  BUS --> CR["Control Register"]
  DEC --> CTL["Interface Control Logic"]
  DR <--> CTL
  SR <--> CTL
  CR --> CTL
  CTL <--> DEV["I/O Device"]`,
        },
        {
          type: "table",
          headers: ["Feature", "Memory-mapped I/O", "Isolated I/O"],
          rows: [
            ["Address space", "Shared with memory", "Separate I/O space"],
            ["Instructions", "Normal load and store", "Special IN and OUT"],
            ["Control signal", "Same as memory", "Separate I/O read and write signals"],
            ["Memory space lost", "Yes, a part is reserved", "No"],
            ["Typical example", "ARM, RISC-V", "x86 (which supports both)"],
          ],
        },
        {
          type: "callout",
          variant: "remember",
          text: "Memory-mapped device registers must not be cached, or the CPU may read a stale status value.",
        },
      ],
    },
    {
      id: "programmed-io",
      title: "Programmed I/O",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "In **programmed I/O**, the CPU runs a loop that repeatedly reads the device's status register, called **polling** or busy waiting. When the device is ready, the CPU moves one unit of data.",
        },
        {
          type: "diagram",
          title: "Programmed I/O",
          caption: "The CPU stays busy for the whole transfer, including all of the waiting.",
          kind: "working-flowchart",
          mermaid: `flowchart TD
  A["Issue command to device"] --> B["Read status register"]
  B --> C{"Device ready?"}
  C -->|"No"| B
  C -->|"Yes"| D["Transfer one word"]
  D --> E{"More data?"}
  E -->|"Yes"| A
  E -->|"No"| F["Transfer complete"]`,
        },
        {
          type: "example",
          title: "Cost of polling",
          steps: [
            "Given: 1 GHz CPU, with each poll costing 400 cycles.",
            "Mouse polled 30 times per second: 30 × 400 = 12,000 cycles/s, which is 0.0012% of the CPU. This is negligible.",
            "Disk at 4 MB/s, transferring 16-byte units: 4,000,000 / 16 = 250,000 polls/s.",
            "Cycles used = 250,000 × 400 = 100,000,000 cycles/s, which is 10% of the CPU, even if no time is wasted on waiting.",
          ],
        },
      ],
    },
    {
      id: "interrupts",
      title: "Interrupt-Driven I/O",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "With **interrupts**, the CPU starts the I/O and goes back to other work. When ready, the device signals the CPU, which runs an **interrupt service routine (ISR)** and then resumes the original program.",
        },
        {
          type: "diagram",
          title: "Interrupt handling",
          caption: "The state is saved so the interrupted program can continue as if nothing happened.",
          kind: "working-flowchart",
          mermaid: `flowchart TD
  A["Device raises interrupt request"] --> B["CPU finishes current instruction"]
  B --> C{"Interrupts enabled?"}
  C -->|"No"| B
  C -->|"Yes"| D["Send acknowledge and identify source"]
  D --> E["Save PC and status on stack"]
  E --> F["Disable interrupts as needed"]
  F --> G["Load PC with ISR address"]
  G --> H["Run ISR and service device"]
  H --> I["Restore status and PC"]
  I --> J["Resume interrupted program"]`,
        },
        {
          type: "points",
          items: [
            "**Vectored interrupt:** the device supplies a number that indexes the vector table holding ISR addresses.",
            "**Non-vectored interrupt:** the ISR is at a fixed address and polls devices to find the source.",
            "**Maskable interrupt:** can be disabled by software.",
            "**Non-maskable interrupt (NMI):** cannot be disabled, and is used for critical events.",
            "**Nested interrupts:** a higher-priority interrupt can preempt a running ISR.",
            "**Exceptions** come from inside the CPU, such as divide by zero. **Interrupts** come from outside.",
          ],
        },
        {
          type: "paragraph",
          text: "When several devices share one request line, a **daisy chain** sets priority by position. The acknowledge signal passes along the chain, and the first requesting device takes it.",
        },
        {
          type: "diagram",
          title: "Daisy-chain priority",
          caption: "The device closest to the CPU has the highest priority, since it can block the acknowledge from reaching those behind it.",
          kind: "block",
          mermaid: `flowchart LR
  CPU["CPU"] -->|"Interrupt acknowledge"| D1["Device 1: highest priority"]
  D1 -->|"Passes if not requesting"| D2["Device 2"]
  D2 -->|"Passes if not requesting"| D3["Device 3: lowest priority"]
  D1 -.->|"Request"| CPU
  D2 -.->|"Request"| CPU
  D3 -.->|"Request"| CPU`,
        },
        {
          type: "callout",
          variant: "exam-tip",
          text: "Interrupts save waiting time, but the CPU still moves every word. For fast block devices this overhead is too high, which is why DMA exists.",
        },
      ],
    },
    {
      id: "dma",
      title: "Direct Memory Access",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "A **DMA controller** moves a whole block between a device and memory without the CPU. The CPU only sets up the transfer and handles one interrupt when it finishes.",
        },
        {
          type: "diagram",
          title: "DMA transfer",
          caption: "The CPU gives up the bus when it grants the request, and can continue with work that does not need the bus, such as running from cache.",
          kind: "working-diagram",
          mermaid: `sequenceDiagram
  participant CPU
  participant DMA as DMA Controller
  participant DEV as Device
  participant MEM as Memory
  CPU->>DMA: Program address, count and direction
  CPU->>DEV: Start the operation
  DEV->>DMA: DMA request
  DMA->>CPU: Bus request
  CPU-->>DMA: Bus grant
  loop Until count is zero
    DEV->>MEM: Transfer word over the bus
    DMA->>DMA: Update address and count
  end
  DMA->>CPU: Release bus and raise interrupt`,
        },
        {
          type: "table",
          headers: ["DMA mode", "How it works", "Effect on CPU"],
          rows: [
            ["Burst (block)", "Holds the bus until the whole block is sent", "CPU is off the bus for the whole transfer"],
            ["Cycle stealing", "Takes the bus for one word at a time", "CPU slows slightly"],
            ["Transparent", "Uses the bus only when the CPU does not need it", "No slowdown, but the transfer is slowest"],
          ],
        },
        {
          type: "example",
          title: "DMA overhead",
          steps: [
            "Given: 1 GHz CPU, 4 MB/s disk, 8 KB blocks, 1000 cycles to set up and 500 cycles for the completion interrupt.",
            "Blocks per second = 4,000,000 / 8,000 = 500.",
            "CPU cycles used = 500 × 1500 = 750,000 cycles/s.",
            "CPU overhead = 750,000 / 10⁹ = 0.075%, compared with 10% for polling.",
          ],
        },
        {
          type: "table",
          headers: ["Technique", "CPU moves data?", "CPU waits?", "Best for"],
          rows: [
            ["Programmed I/O", "Yes", "Yes", "Simple, slow devices"],
            ["Interrupt-driven", "Yes", "No", "Slow, infrequent devices such as keyboards"],
            ["DMA", "No", "No", "Fast block devices such as disks and network cards"],
          ],
        },
        {
          type: "callout",
          variant: "remember",
          text: "DMA can cause cache coherence problems, because memory changes without the cache knowing. Bus snooping or cache flushing solves this.",
        },
      ],
    },
    {
      id: "buses",
      title: "Buses & Arbitration",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "A **bus** is a shared communication path. It has three groups of lines: **address** (where), **data** (what) and **control** (how and when).",
        },
        {
          type: "callout",
          variant: "formula",
          text: "Maximum addressable memory = 2^(address lines). Bus bandwidth = bus width in bytes × clock rate / cycles per transfer",
        },
        {
          type: "example",
          title: "Bus bandwidth",
          steps: [
            "Given: 32-bit data bus at 100 MHz.",
            "With one transfer per cycle: 4 bytes × 100 MHz = 400 MB/s.",
            "If each transfer takes 3 cycles: 400 / 3 = 133.3 MB/s.",
          ],
        },
        {
          type: "table",
          headers: ["Feature", "Synchronous bus", "Asynchronous bus"],
          rows: [
            ["Timing", "Shared clock", "Handshake signals"],
            ["Device speed", "All tied to clock rate", "Mixed speeds supported"],
            ["Length", "Limited by clock skew", "Can be longer"],
            ["Logic", "Simple", "More complex"],
            ["Speed", "Generally faster", "Slower, due to handshaking"],
          ],
        },
        {
          type: "diagram",
          title: "Asynchronous bus handshake",
          caption: "Each signal responds to the previous one, so no shared clock is needed.",
          kind: "working-diagram",
          mermaid: `sequenceDiagram
  participant M as Master
  participant S as Slave
  M->>S: Place address and assert Ready
  S-->>M: Assert Acknowledge and place data
  M->>S: Latch data and drop Ready
  S-->>M: Drop Acknowledge`,
        },
        {
          type: "paragraph",
          text: "**Bus arbitration** decides who uses the bus when several masters request it at once.",
        },
        {
          type: "table",
          headers: ["Method", "How it works", "Pros and cons"],
          rows: [
            ["Daisy chain", "A grant line passes through devices in order", "Simple, but priority is fixed and failure can break the chain"],
            ["Polling", "The arbiter asks devices in turn", "Flexible priority, but slower"],
            ["Independent request", "Each device has its own request and grant lines", "Fastest, but needs the most wiring"],
            ["Distributed", "Devices decide among themselves", "No single point of failure, but more complex"],
          ],
        },
        {
          type: "diagram",
          title: "Centralized bus arbitration",
          caption: "Each master has its own request and grant lines to the arbiter, which grants the bus to one at a time.",
          kind: "block",
          mermaid: `flowchart TD
  ARB["Bus Arbiter"]
  M1["Master 1"] -->|"Request"| ARB
  M2["Master 2"] -->|"Request"| ARB
  M3["Master 3"] -->|"Request"| ARB
  ARB -.->|"Grant"| M1
  ARB -.->|"Grant"| M2
  ARB -.->|"Grant"| M3
  M1 <--> SB["Shared Bus"]
  M2 <--> SB
  M3 <--> SB`,
        },
      ],
    },
  ],
  flashcards: [
    { front: "Programmed I/O", back: "The CPU polls the status register in a loop and moves all data itself." },
    { front: "Interrupt-driven I/O", back: "The device signals when ready, so the CPU can do other work while waiting." },
    { front: "DMA", back: "A controller moves a block between device and memory with the CPU only involved at start and finish." },
    { front: "Interrupt service routine", back: "The code that runs in response to an interrupt." },
    { front: "Vectored interrupt", back: "The device provides an index into a table of ISR addresses." },
    { front: "Non-maskable interrupt", back: "An interrupt that cannot be disabled, used for critical events." },
    { front: "Daisy chain", back: "A priority scheme where acknowledge or grant passes along devices in order." },
    { front: "Cycle stealing", back: "DMA takes the bus one word at a time, slightly slowing the CPU." },
    { front: "Burst mode DMA", back: "The DMA controller holds the bus until the whole block has been transferred." },
    { front: "Memory-mapped I/O", back: "Device registers share the memory address space, using normal load and store." },
    { front: "Isolated I/O", back: "Devices have a separate address space, with special IN and OUT instructions." },
    { front: "Synchronous bus", back: "All transfers are timed by a shared clock." },
    { front: "Asynchronous bus", back: "Transfers are coordinated using handshake signals, so no shared clock is needed." },
    { front: "Bus arbitration", back: "The method of choosing which master may use the bus next." },
  ],
  quiz: [
    { id: "ch09-q01", question: "In which I/O method does the CPU spend the most time waiting?", options: ["DMA", "Interrupt-driven", "Programmed I/O", "Burst mode"], answerIndex: 2, explanation: "The CPU polls continuously until the device is ready.", difficulty: "easy", topic: "Programmed I/O" },
    { id: "ch09-q02", question: "Which method is most suitable for transferring large blocks from a disk?", options: ["Polling", "Interrupts per byte", "DMA", "Programmed I/O"], answerIndex: 2, explanation: "DMA moves the block without CPU involvement per word.", difficulty: "easy", topic: "DMA" },
    { id: "ch09-q03", question: "What does memory-mapped I/O use to access device registers?", options: ["IN and OUT instructions", "Load and store instructions", "Only interrupts", "Only DMA"], answerIndex: 1, explanation: "Device registers look like memory locations.", difficulty: "easy", topic: "I/O Interface" },
    { id: "ch09-q04", question: "What is saved first when an interrupt is accepted?", options: ["Cache contents", "PC and status", "All of memory", "The ISR"], answerIndex: 1, explanation: "PC and status must be saved so the program can resume.", difficulty: "easy", topic: "Interrupts" },
    { id: "ch09-q05", question: "When does a CPU usually respond to a pending interrupt?", options: ["In the middle of an instruction", "After the current instruction completes", "Only after a program ends", "Only during a DMA transfer"], answerIndex: 1, explanation: "Interrupts are normally checked between instructions.", difficulty: "easy", topic: "Interrupts" },
    { id: "ch09-q06", question: "How is the priority determined in a daisy chain?", options: ["By device speed", "By position in the chain", "Randomly", "By address size"], answerIndex: 1, explanation: "The device nearest the CPU or arbiter sees the signal first.", difficulty: "easy", topic: "Priority" },
    { id: "ch09-q07", question: "Which DMA mode slows the CPU only slightly by taking one bus cycle at a time?", options: ["Burst", "Cycle stealing", "Block", "Polling"], answerIndex: 1, explanation: "Cycle stealing interleaves single-word transfers with CPU bus use.", difficulty: "easy", topic: "DMA" },
    { id: "ch09-q08", question: "A 2 GHz CPU polls a device 1000 times per second at 500 cycles per poll. What fraction of the CPU is used?", options: ["0.025%", "0.05%", "0.25%", "2.5%"], answerIndex: 0, explanation: "1000 × 500 = 500,000 cycles/s. 500,000 / 2×10⁹ = 0.025%.", difficulty: "medium", topic: "Programmed I/O" },
    { id: "ch09-q09", question: "A disk transfers at 8 MB/s in 4 KB blocks using DMA, costing 2000 CPU cycles per block on a 1 GHz CPU. What is the CPU overhead?", options: ["0.04%", "0.4%", "4%", "40%"], answerIndex: 1, explanation: "8,000,000 / 4,000 = 2000 blocks/s. 2000 × 2000 = 4×10⁶ cycles/s, which is 0.4%.", difficulty: "medium", topic: "DMA" },
    { id: "ch09-q10", question: "What is the bandwidth of a 64-bit bus at 200 MHz with one transfer every 2 cycles?", options: ["400 MB/s", "800 MB/s", "1600 MB/s", "200 MB/s"], answerIndex: 1, explanation: "8 bytes × 200 MHz / 2 = 800 MB/s.", difficulty: "medium", topic: "Buses" },
    { id: "ch09-q11", question: "A system bus has 24 address lines. What is the maximum addressable memory (byte addressable)?", options: ["1 MB", "4 MB", "16 MB", "24 MB"], answerIndex: 2, explanation: "2²⁴ bytes = 16 MB.", difficulty: "easy", topic: "Buses" },
    { id: "ch09-q12", question: "Which feature best describes an asynchronous bus?", options: ["Shared clock", "Handshake signals", "Only one device allowed", "No data lines"], answerIndex: 1, explanation: "Handshaking allows devices of different speeds to communicate.", difficulty: "easy", topic: "Buses" },
    { id: "ch09-q13", question: "Which arbitration method requires the most wiring but gives the fastest response?", options: ["Daisy chain", "Polling", "Independent request", "Software polling"], answerIndex: 2, explanation: "Each device has its own request and grant lines.", difficulty: "medium", topic: "Bus Arbitration" },
    { id: "ch09-q14", question: "Why can DMA cause a cache coherence problem?", options: ["DMA disables the cache", "Memory changes without the cache being updated", "DMA uses virtual addresses", "The CPU stops working"], answerIndex: 1, explanation: "A device writing directly to memory can leave stale copies in the cache.", difficulty: "hard", topic: "DMA" },
  ],
  importantQuestions: [
    { q: "Compare programmed I/O, interrupt-driven I/O and DMA.", marks: 6, modelAnswer: "Programmed I/O: the CPU polls and moves every word, wasting time on waiting. It is simple.\nInterrupt-driven: the device signals readiness, and the CPU moves each word in an ISR. It removes waiting but has per-word overhead.\nDMA: a controller moves the block, and the CPU only sets up and handles a final interrupt. It suits fast block devices." },
    { q: "Explain the DMA transfer process with a diagram. Describe the DMA modes.", marks: 10, modelAnswer: "Draw the CPU, DMA controller, device and memory on a shared bus.\nSteps: the CPU programs the address, count and direction. The device requests DMA. The controller requests the bus and the CPU grants it. Words are moved, updating address and count. When the count is zero, the bus is released and an interrupt is raised.\nModes: burst holds the bus for the block. Cycle stealing takes one word at a time. Transparent uses only idle bus cycles." },
    { q: "Explain the interrupt handling process with a flowchart.", marks: 7, modelAnswer: "The device raises a request. The CPU completes the current instruction and checks whether interrupts are enabled.\nIt acknowledges and identifies the source, saves PC and status, and loads the ISR address, using a vector if present.\nThe ISR services the device. Status and PC are restored, and the program resumes." },
    { q: "Compare memory-mapped I/O and isolated I/O.", marks: 4, modelAnswer: "Memory-mapped: a shared address space, normal load and store, part of the address space is lost, and all addressing modes can be used.\nIsolated: a separate I/O space, special IN and OUT instructions and separate control signals, with memory space preserved." },
    { q: "Explain daisy-chain priority interrupts. What are its limitations?", marks: 5, modelAnswer: "Devices share a request line. The acknowledge passes serially from the CPU through each device. A requesting device blocks it from continuing and places its vector on the bus.\nLimitations: priority is fixed by position, low-priority devices can starve, delay grows with chain length, and a failed device can break the chain." },
    { q: "Compare synchronous and asynchronous buses. Explain the handshake.", marks: 6, modelAnswer: "Synchronous: a shared clock, simple logic and high speed, but all devices are tied to the clock and length is limited by skew.\nAsynchronous: no clock, handshaking allows mixed speeds, with more complex logic.\nHandshake: the master asserts Ready with the address, the slave responds with Acknowledge and data, the master latches and drops Ready, and the slave drops Acknowledge." },
    { q: "A disk transfers at 2 MB/s in 512-byte sectors on a 500 MHz CPU. Interrupt handling costs 1000 cycles per interrupt. Find the CPU overhead if one interrupt occurs per sector.", marks: 5, modelAnswer: "Sectors per second = 2,000,000 / 512 = 3906.25.\nCycles per second = 3906.25 × 1000 = 3,906,250.\nOverhead = 3,906,250 / 500,000,000 = 0.78%." },
  ],
  keyTerms: ["I/O interface", "Memory-mapped I/O", "Isolated I/O", "Polling", "Programmed I/O", "Interrupt", "Interrupt service routine", "Vectored interrupt", "Daisy chain", "DMA", "Cycle stealing", "Bus arbitration", "Handshake"],
};

export default chapter;
