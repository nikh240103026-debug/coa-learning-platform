import type { Chapter } from "@/lib/types";

const chapter: Chapter = {
  slug: "multiprocessors",
  number: 10,
  title: "Multiprocessors & Advanced Topics",
  summary:
    "Why computers went multicore, how shared memory is organized, how MESI keeps caches coherent, how processors are interconnected, and how GPUs differ from CPUs.",
  estMinutes: 45,
  videoUrl: "",
  learningObjectives: [
    "Explain why multicore replaced ever-faster single cores",
    "Compare UMA, NUMA and message-passing systems",
    "Explain the cache coherence problem and trace the MESI protocol",
    "Compare interconnection networks using their degree, diameter and cost",
    "Describe how GPUs differ from CPUs",
  ],
  sections: [
    {
      id: "multicore",
      title: "Multicore Processors",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "Raising the clock rate stopped being practical because of the **power wall**: power grows quickly with frequency and voltage. Instead, designers now place several simpler cores on one chip, so programs must use parallelism to run faster.",
        },
        {
          type: "diagram",
          title: "Typical multicore processor",
          caption: "Each core has private L1 and L2 caches. All cores share the L3 cache and the memory controller.",
          kind: "block",
          mermaid: `flowchart TD
  subgraph CHIP["Multicore Chip"]
    subgraph C0["Core 0"]
      L10["L1 and L2 Cache"]
    end
    subgraph C1["Core 1"]
      L11["L1 and L2 Cache"]
    end
    subgraph C2["Core 2"]
      L12["L1 and L2 Cache"]
    end
    L3["Shared L3 Cache"]
    MC["Memory Controller"]
  end
  L10 --> L3
  L11 --> L3
  L12 --> L3
  L3 --> MC
  MC --> RAM["Main Memory"]`,
        },
        {
          type: "points",
          items: [
            "**Multicore:** several full cores on one chip.",
            "**SMT (Hyper-Threading):** one core runs several hardware threads by sharing its execution units.",
            "**Heterogeneous multicore:** performance and efficiency cores on one chip, as in big.LITTLE designs.",
          ],
        },
        {
          type: "callout",
          variant: "formula",
          text: "Amdahl's speedup on N processors: S = 1 / ((1 − f) + f / N). Efficiency = S / N",
        },
        {
          type: "callout",
          variant: "formula",
          text: "Gustafson's scaled speedup: S = N − (1 − f) × (N − 1), where the problem grows with N",
        },
        {
          type: "example",
          title: "Parallel speedup",
          steps: [
            "Given: 90% of a program is parallel, running on 8 cores. So f = 0.9 and N = 8.",
            "Amdahl: S = 1 / (0.1 + 0.9/8) = 1 / 0.2125 = 4.71.",
            "Efficiency = 4.71 / 8 = 0.59, which is 59%.",
            "Upper limit with infinite cores = 1 / 0.1 = 10.",
            "Gustafson, with a scaled problem: S = 8 − 0.1 × 7 = 7.3.",
          ],
        },
        {
          type: "callout",
          variant: "exam-tip",
          text: "Amdahl assumes a fixed problem size. Gustafson assumes the problem grows with the processor count. That is why Gustafson's result is more optimistic.",
        },
      ],
    },
    {
      id: "memory-models",
      title: "Shared Memory & Message Passing",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "Multiprocessors differ in how processors share data. In **shared memory** systems, all processors use one address space. In **message passing** systems (multicomputers), each has private memory and communicates by explicit messages.",
        },
        {
          type: "table",
          headers: ["Feature", "UMA", "NUMA", "Message passing"],
          rows: [
            ["Address space", "Shared", "Shared", "Private per node"],
            ["Memory access time", "Same for all", "Local is faster than remote", "Local only, remote by message"],
            ["Scalability", "Low", "Medium to high", "High"],
            ["Communication", "Loads and stores", "Loads and stores", "Send and receive"],
            ["Example", "Small SMP", "Multi-socket servers", "Clusters using MPI"],
          ],
        },
        {
          type: "diagram",
          title: "UMA vs NUMA organization",
          caption: "UMA has equal access through one bus. In NUMA, each processor has fast local memory and slower access to remote memory.",
          kind: "block",
          mermaid: `flowchart TB
  subgraph UMA["UMA"]
    P1["CPU 1"] --> BUS1["Shared Bus"]
    P2["CPU 2"] --> BUS1
    BUS1 --> M1["Shared Memory"]
  end
  subgraph NUMA["NUMA"]
    P3["CPU 3"] --> M2["Local Memory A"]
    P4["CPU 4"] --> M3["Local Memory B"]
    P3 <-->|"Interconnect"| P4
  end`,
        },
        {
          type: "callout",
          variant: "remember",
          text: "Atomic instructions such as test-and-set and compare-and-swap are needed for locks, since ordinary loads and stores from different cores can interleave.",
        },
      ],
    },
    {
      id: "cache-coherence",
      title: "Cache Coherence & MESI",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "When each core has a private cache, copies of one memory block can disagree. This is the **cache coherence problem**.",
        },
        {
          type: "example",
          title: "The coherence problem",
          steps: [
            "Memory holds X = 5.",
            "Core 1 and Core 2 both read X, so both caches hold 5.",
            "Core 1 writes X = 7 in a write-back cache. Its copy now holds 7, but memory still holds 5.",
            "Core 2 reads X and gets the stale value 5 from its cache. This is incorrect.",
          ],
        },
        {
          type: "table",
          headers: ["Approach", "How it works", "Trade-off"],
          rows: [
            ["Snooping", "All caches watch a shared bus", "Simple, but limited to smaller systems"],
            ["Directory", "A directory tracks which caches hold each block", "Scales well, but needs extra storage and latency"],
            ["Write-invalidate", "A write removes other copies", "Less bus traffic, so most common"],
            ["Write-update", "A write updates other copies", "Readers keep data, but traffic is higher"],
          ],
        },
        {
          type: "table",
          headers: ["MESI state", "Valid", "Same as memory", "Other copies"],
          rows: [
            ["Modified", "Yes", "No, this copy is dirty", "None"],
            ["Exclusive", "Yes", "Yes", "None"],
            ["Shared", "Yes", "Yes", "May exist"],
            ["Invalid", "No", "Not applicable", "Not applicable"],
          ],
        },
        {
          type: "diagram",
          title: "MESI state transitions",
          caption: "Local means this core's own access. Remote means another core's access seen on the bus.",
          kind: "working-diagram",
          mermaid: `stateDiagram-v2
  [*] --> Invalid
  Invalid --> Exclusive: Local read and no other copy
  Invalid --> Shared: Local read and other copies exist
  Invalid --> Modified: Local write
  Exclusive --> Modified: Local write
  Exclusive --> Shared: Remote read
  Exclusive --> Invalid: Remote write
  Shared --> Modified: Local write and invalidate others
  Shared --> Invalid: Remote write
  Modified --> Shared: Remote read and write back
  Modified --> Invalid: Remote write and write back`,
        },
        {
          type: "diagram",
          title: "Write-invalidate snooping",
          caption: "Core 1 invalidates Core 2's copy before writing. Core 2's next read gets the new value.",
          kind: "working-diagram",
          mermaid: `sequenceDiagram
  participant C1 as Core 1 Cache
  participant BUS as Shared Bus
  participant C2 as Core 2 Cache
  participant MEM as Memory
  Note over C1,C2: Both caches hold X in Shared state
  C1->>BUS: Invalidate X
  BUS->>C2: Snoop sees invalidate
  C2->>C2: Mark X as Invalid
  C1->>C1: Write X and mark as Modified
  C2->>BUS: Read miss on X
  BUS->>C1: Snoop sees read
  C1->>MEM: Write back X
  C1-->>C2: Supply X and both become Shared`,
        },
        {
          type: "callout",
          variant: "remember",
          text: "False sharing: two cores write different variables in one cache block, so the block bounces between caches although no data is truly shared. Padding variables onto separate blocks fixes it.",
        },
        {
          type: "callout",
          variant: "formula",
          text: "Directory overhead per block = (N presence bits + 1 dirty bit) / block size in bits, for N processors",
        },
        {
          type: "example",
          title: "Directory overhead",
          steps: [
            "Given: 64 processors and 64-byte blocks.",
            "Directory bits per block = 64 + 1 = 65.",
            "Block size = 64 × 8 = 512 bits.",
            "Overhead = 65 / 512 = 12.7%.",
          ],
        },
      ],
    },
    {
      id: "interconnection",
      title: "Interconnection Networks",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "Processors and memories need a network between them. Networks are compared using **degree** (links per node), **diameter** (worst-case hops), **bisection width** and cost.",
        },
        {
          type: "table",
          headers: ["Network", "Links or switches", "Degree", "Diameter", "Bisection"],
          rows: [
            ["Bus", "1 shared bus", "1", "1", "1"],
            ["Ring", "N", "2", "⌊N/2⌋", "2"],
            ["2D mesh (√N × √N)", "2√N(√N − 1)", "Up to 4", "2(√N − 1)", "√N"],
            ["Hypercube", "(N log₂ N) / 2", "log₂ N", "log₂ N", "N/2"],
            ["Fully connected", "N(N − 1) / 2", "N − 1", "1", "N²/4"],
            ["Crossbar", "N² crosspoints", "Not applicable", "1", "N"],
            ["Omega (multistage)", "(N/2) log₂ N switches", "Not applicable", "log₂ N stages", "N/2"],
          ],
        },
        {
          type: "diagram",
          title: "Choosing an interconnection network",
          caption: "Common networks arranged by cost and blocking behaviour.",
          kind: "flowchart",
          mermaid: `flowchart TD
  Q1{"Small number of processors?"}
  Q1 -->|"Yes"| BUSN["Shared Bus: cheap, but a bottleneck"]
  Q1 -->|"No"| Q2{"Need non-blocking access at any cost?"}
  Q2 -->|"Yes"| XB["Crossbar: N squared crosspoints"]
  Q2 -->|"No"| Q3{"On a single chip?"}
  Q3 -->|"Yes"| MESH["Mesh or Ring: simple and short wires"]
  Q3 -->|"No"| MS["Hypercube or Multistage: low diameter"]`,
        },
        {
          type: "example",
          title: "Comparing networks with N = 16",
          steps: [
            "Ring: 16 links, diameter 8.",
            "4 × 4 mesh: 2 × 4 × 3 = 24 links, diameter 2 × 3 = 6.",
            "Hypercube: dimension 4, 16 × 4 / 2 = 32 links, diameter 4.",
            "Fully connected: 16 × 15 / 2 = 120 links, diameter 1.",
            "Crossbar: 16² = 256 crosspoints.",
            "Omega: 4 stages with (16/2) × 4 = 32 switches.",
          ],
        },
        {
          type: "callout",
          variant: "exam-tip",
          text: "In a hypercube, neighbouring node labels differ by exactly one bit. The number of hops between two nodes equals the Hamming distance of their labels.",
        },
      ],
    },
    {
      id: "gpus",
      title: "GPUs Overview",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "A **GPU** contains many simple cores designed for data parallelism, where the same operation is applied to huge amounts of data. First built for graphics, GPUs now also power scientific computing and machine learning.",
        },
        {
          type: "table",
          headers: ["Feature", "CPU", "GPU"],
          rows: [
            ["Cores", "Few, complex", "Many, simple"],
            ["Optimized for", "Low latency on a single task", "High throughput on many tasks"],
            ["Control flow", "Handles complex branches well", "Best with uniform work"],
            ["Caches", "Large, multi-level", "Smaller, with high memory bandwidth"],
            ["Parallel model", "MIMD with SIMD extensions", "SIMD and SIMT"],
          ],
        },
        {
          type: "diagram",
          title: "CPU and GPU working together",
          caption: "The CPU runs control logic and sends data-parallel work to the GPU.",
          kind: "working-flowchart",
          mermaid: `flowchart LR
  APP["Application on CPU"] --> DATA["Copy data to GPU memory"]
  DATA --> KERNEL["Launch kernel on GPU"]
  subgraph GPUBOX["GPU"]
    CU1["Compute Unit 1"]
    CU2["Compute Unit 2"]
    CUN["Compute Unit N"]
  end
  KERNEL --> CU1
  KERNEL --> CU2
  KERNEL --> CUN
  CU1 --> RES["Results copied back"]
  CU2 --> RES
  CUN --> RES
  RES --> APP2["CPU continues"]`,
        },
        {
          type: "points",
          items: [
            "**SIMT:** many threads run the same instruction stream on different data.",
            "**Good GPU workloads:** matrix operations, image processing and neural network training.",
            "**Poor GPU workloads:** branch-heavy code with little parallelism, such as parsing.",
            "**Other accelerators:** TPUs and NPUs target machine learning more specifically.",
          ],
        },
      ],
    },
  ],
  flashcards: [
    { front: "Power wall", back: "Power and heat limits that stopped further clock rate increases, leading to multicore designs." },
    { front: "SMT", back: "Simultaneous multithreading: one core runs several hardware threads by sharing execution units." },
    { front: "UMA", back: "Uniform memory access: all processors have the same memory access time." },
    { front: "NUMA", back: "Non-uniform memory access: local memory is faster than remote memory." },
    { front: "Cache coherence", back: "Ensuring all caches see a consistent value for each memory location." },
    { front: "Snooping", back: "Caches monitor a shared bus and react to transactions from other caches." },
    { front: "Directory protocol", back: "A central or distributed directory tracks which caches hold each block, and scales better than snooping." },
    { front: "MESI states", back: "Modified, Exclusive, Shared and Invalid." },
    { front: "Exclusive vs Modified", back: "Both have the only copy. Exclusive matches memory, while Modified is dirty." },
    { front: "False sharing", back: "Different variables in one cache block cause coherence traffic although no data is truly shared." },
    { front: "Hypercube properties", back: "N = 2ᵈ nodes, degree d, diameter d, and (N log₂ N) / 2 links." },
    { front: "Crossbar", back: "A non-blocking switch with N² crosspoints." },
    { front: "Omega network", back: "A multistage network with log₂ N stages and (N/2) log₂ N switches." },
    { front: "GPU", back: "A processor with many simple cores, optimized for data-parallel throughput." },
    { front: "Gustafson's law", back: "S = N − (1 − f)(N − 1). It assumes the problem size grows with the processor count." },
  ],
  quiz: [
    { id: "ch10-q01", question: "Why did the industry move to multicore processors?", options: ["Memory became too cheap", "The power wall limited clock rate growth", "Compilers stopped working", "Disks became faster"], answerIndex: 1, explanation: "Power and heat made further clock increases impractical.", difficulty: "easy", topic: "Multicore" },
    { id: "ch10-q02", question: "A program is 95% parallel and runs on 16 processors. What is the speedup, by Amdahl's law?", options: ["7.2", "9.14", "12.5", "15.2"], answerIndex: 1, explanation: "S = 1 / (0.05 + 0.95/16) = 1 / 0.109375 = 9.14.", difficulty: "medium", topic: "Amdahl's Law" },
    { id: "ch10-q03", question: "With 10% serial code and 10 processors, what is the scaled speedup by Gustafson's law?", options: ["5.26", "9.1", "10", "1.9"], answerIndex: 1, explanation: "S = 10 − 0.1 × 9 = 9.1.", difficulty: "medium", topic: "Gustafson's Law" },
    { id: "ch10-q04", question: "In a NUMA system:", options: ["All memory has the same access time", "Local memory is faster than remote memory", "There is no shared address space", "Caches are not allowed"], answerIndex: 1, explanation: "Access time depends on where the memory physically resides.", difficulty: "easy", topic: "NUMA" },
    { id: "ch10-q05", question: "In MESI, what state means the only copy, which is dirty?", options: ["Modified", "Exclusive", "Shared", "Invalid"], answerIndex: 0, explanation: "Modified means this cache has the only valid copy and memory is stale.", difficulty: "easy", topic: "MESI" },
    { id: "ch10-q06", question: "A block is in Exclusive state and the local core writes it. What happens?", options: ["It becomes Invalid", "It becomes Modified with no bus traffic", "It becomes Shared", "It is written to memory first"], answerIndex: 1, explanation: "No other copies exist, so no invalidation is needed.", difficulty: "medium", topic: "MESI" },
    { id: "ch10-q07", question: "A block is Modified in one cache and another core reads it. What happens?", options: ["It stays Modified", "It is written back and both copies become Shared", "It is lost", "Both copies become Exclusive"], answerIndex: 1, explanation: "The owner supplies the data and memory is updated. Both copies are then Shared.", difficulty: "medium", topic: "MESI" },
    { id: "ch10-q08", question: "Which approach to coherence scales better to large systems?", options: ["Snooping", "Directory-based", "Write-through only", "Disabling caches"], answerIndex: 1, explanation: "Directories avoid broadcasting every transaction on a shared bus.", difficulty: "easy", topic: "Cache Coherence" },
    { id: "ch10-q09", question: "Two threads write different variables that share a cache block, which slows both down. This is:", options: ["True sharing", "False sharing", "Thrashing", "Race-around"], answerIndex: 1, explanation: "No data is actually shared, but the block moves back and forth between caches.", difficulty: "medium", topic: "Cache Coherence" },
    { id: "ch10-q10", question: "What is the diameter of a 64-node hypercube?", options: ["4", "6", "8", "32"], answerIndex: 1, explanation: "Diameter = log₂ 64 = 6.", difficulty: "easy", topic: "Interconnection Networks" },
    { id: "ch10-q11", question: "How many links does a 64-node hypercube have?", options: ["64", "128", "192", "384"], answerIndex: 2, explanation: "(64 × 6) / 2 = 192.", difficulty: "medium", topic: "Interconnection Networks" },
    { id: "ch10-q12", question: "What is the diameter of an 8 × 8 mesh, without wraparound?", options: ["7", "8", "14", "16"], answerIndex: 2, explanation: "2 × (8 − 1) = 14.", difficulty: "medium", topic: "Interconnection Networks" },
    { id: "ch10-q13", question: "How many 2×2 switches does an 8-input Omega network use?", options: ["8", "12", "16", "24"], answerIndex: 1, explanation: "(8/2) × log₂ 8 = 4 × 3 = 12.", difficulty: "medium", topic: "Interconnection Networks" },
    { id: "ch10-q14", question: "How many crosspoints does a 32 × 32 crossbar have?", options: ["64", "160", "512", "1024"], answerIndex: 3, explanation: "N² = 32² = 1024.", difficulty: "easy", topic: "Interconnection Networks" },
    { id: "ch10-q15", question: "GPUs are best suited to:", options: ["Branch-heavy code", "Data-parallel workloads", "Single-threaded parsing", "Disk scheduling"], answerIndex: 1, explanation: "Many simple cores apply the same operation across large data sets.", difficulty: "easy", topic: "GPUs" },
  ],
  importantQuestions: [
    { q: "What is the cache coherence problem? Explain the MESI protocol with a state diagram.", marks: 10, modelAnswer: "Problem: private caches can hold different values for one block after a write.\nMESI states: Modified (only copy, dirty), Exclusive (only copy, clean), Shared (clean, others may have it) and Invalid.\nTransitions: a local read miss goes to E or S. A local write goes to M and invalidates others. A remote read moves M or E to S, with M writing back. A remote write moves any state to I, with M writing back.\nDraw the four-state diagram." },
    { q: "Compare snooping and directory-based coherence protocols.", marks: 5, modelAnswer: "Snooping: each cache monitors a shared bus, which is simple and fast for few processors, but broadcasts limit scaling.\nDirectory: tracks sharers of each block and sends messages only to those caches. It scales to many processors but needs extra storage and has higher latency." },
    { q: "Compare UMA and NUMA architectures with diagrams.", marks: 6, modelAnswer: "UMA: processors share memory through one bus or switch, with equal access time. It is simple but limited by bus contention.\nNUMA: each processor has local memory, with remote memory reached through an interconnect. It scales better, but software should keep data local for good performance.\nBoth have one shared address space." },
    { q: "Compare the ring, mesh, hypercube and crossbar interconnection networks for N = 16.", marks: 6, modelAnswer: "Ring: 16 links, degree 2, diameter 8.\nMesh (4 × 4): 24 links, degree up to 4, diameter 6.\nHypercube: 32 links, degree 4, diameter 4.\nCrossbar: 256 crosspoints, non-blocking, single-hop.\nCost rises while diameter falls." },
    { q: "A program has 15% serial code. Find the speedup and efficiency on 4 and 32 processors, and the maximum speedup.", marks: 6, modelAnswer: "f = 0.85.\nN = 4: S = 1 / (0.15 + 0.2125) = 2.76, efficiency = 69%.\nN = 32: S = 1 / (0.15 + 0.0266) = 5.66, efficiency = 17.7%.\nMaximum speedup = 1 / 0.15 = 6.67.\nEfficiency falls as processors are added." },
    { q: "Differentiate between a CPU and a GPU. What kinds of workloads suit each?", marks: 5, modelAnswer: "CPU: few complex cores, large caches and strong branch handling, optimized for latency. It suits general-purpose, control-heavy code.\nGPU: many simple cores and high memory bandwidth, optimized for throughput. It suits data-parallel work such as matrix math, graphics and machine learning." },
    { q: "What is false sharing? How can it be avoided?", marks: 3, modelAnswer: "False sharing occurs when threads write different variables located in one cache block, so the block keeps moving between caches.\nAvoid it by padding or aligning variables so each sits in its own block, or by using per-thread data." },
  ],
  keyTerms: ["Multicore", "Power wall", "SMT", "UMA", "NUMA", "Cache coherence", "Snooping", "Directory protocol", "MESI", "False sharing", "Hypercube", "Crossbar", "Omega network", "GPU", "Gustafson's law"],
};

export default chapter;
