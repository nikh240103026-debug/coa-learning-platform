import type { Chapter } from "@/lib/types";

const chapter: Chapter = {
  slug: "memory",
  number: 7,
  title: "Memory Organization",
  summary:
    "The memory hierarchy, RAM and ROM types, cache mapping, replacement and write policies, and how to calculate average memory access time.",
  estMinutes: 60,
  videoUrl: "",
  learningObjectives: [
    "Explain the memory hierarchy and the principle of locality",
    "Compare SRAM, DRAM and ROM types and build larger memories from chips",
    "Split an address into tag, index and offset for each cache mapping",
    "Apply replacement and write policies",
    "Calculate AMAT for one and two levels of cache",
  ],
  sections: [
    {
      id: "memory-hierarchy",
      title: "Memory Hierarchy & Locality",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "Fast memory is expensive and slow memory is cheap, so computers use several levels. Frequently used data stays in small, fast levels near the CPU. This gives the illusion of memory that is both large and fast.",
        },
        {
          type: "diagram",
          title: "Memory hierarchy",
          caption: "Moving down, capacity grows, while speed and cost per bit fall.",
          kind: "block",
          mermaid: `flowchart TD
  R["Registers: under 1 ns, bytes"] --> L1["L1 Cache: about 1 ns, tens of KB"]
  L1 --> L2["L2 and L3 Cache: several ns, up to tens of MB"]
  L2 --> MM["Main Memory DRAM: about 100 ns, GB"]
  MM --> SSD["SSD: about 100 microseconds, TB"]
  SSD --> HDD["Hard Disk: about 10 ms, TB"]`,
        },
        {
          type: "points",
          items: [
            "**Temporal locality:** a recently used item is likely to be used again soon, as with loop variables.",
            "**Spatial locality:** items near a recently used item are likely to be used soon, as with arrays.",
            "**Hit:** the data is found in the level being checked.",
            "**Miss:** the data must come from a lower level.",
          ],
        },
        {
          type: "callout",
          variant: "remember",
          text: "Locality is why caches work. Temporal locality justifies keeping recent data. Spatial locality justifies fetching whole blocks.",
        },
      ],
    },
    {
      id: "ram-rom",
      title: "RAM, ROM & Memory Chips",
      videoUrl: "",
      blocks: [
        {
          type: "table",
          headers: ["Feature", "SRAM", "DRAM"],
          rows: [
            ["Storage cell", "6 transistors (flip-flop)", "1 transistor and 1 capacitor"],
            ["Refresh", "Not needed", "Needed periodically"],
            ["Speed", "Faster", "Slower"],
            ["Density", "Lower", "Higher"],
            ["Cost per bit", "Higher", "Lower"],
            ["Use", "Cache", "Main memory"],
          ],
        },
        {
          type: "table",
          headers: ["ROM type", "Written by", "Erased by"],
          rows: [
            ["Mask ROM", "Manufacturer", "Cannot be erased"],
            ["PROM", "User, once", "Cannot be erased"],
            ["EPROM", "User", "UV light, whole chip"],
            ["EEPROM", "User", "Electrically, byte by byte"],
            ["Flash", "User", "Electrically, block by block"],
          ],
        },
        {
          type: "callout",
          variant: "formula",
          text: "Chips needed = (target words / chip words) × (target width / chip width). Address lines for N words = log₂ N",
        },
        {
          type: "example",
          title: "Building 64K × 16 from 16K × 8 chips",
          steps: [
            "Chips per row for width = 16 / 8 = 2.",
            "Rows for depth = 64K / 16K = 4.",
            "Total chips = 4 × 2 = 8.",
            "Address lines needed = log₂ 64K = 16. Each chip uses 14 of them.",
            "The remaining 2 lines drive a 2-to-4 decoder that selects a row.",
          ],
        },
      ],
    },
    {
      id: "cache-mapping",
      title: "Cache Mapping",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "Memory is divided into **blocks**, and the cache into **lines** of the same size. The **mapping function** decides which line or lines a block may occupy. The address is split into fields to find it.",
        },
        {
          type: "table",
          headers: ["Mapping", "Where a block can go", "Address fields", "Comparators"],
          rows: [
            ["Direct", "Exactly one line: block mod lines", "Tag, Line, Offset", "1"],
            ["Fully associative", "Any line", "Tag, Offset", "One per line"],
            ["k-way set associative", "Any line in one set: block mod sets", "Tag, Set, Offset", "k"],
          ],
        },
        {
          type: "callout",
          variant: "formula",
          text: "Offset bits = log₂ (block size). Lines = cache size / block size. Sets = lines / k. Tag bits = address bits − index bits − offset bits",
        },
        {
          type: "diagram",
          title: "Direct-mapped cache lookup",
          caption: "The index selects one line, then the stored tag is compared with the address tag.",
          kind: "working-diagram",
          mermaid: `flowchart LR
  ADDR["Address: Tag, Index, Offset"] --> IDX["Index selects a line"]
  IDX --> LINE["Line: Valid bit, Stored tag, Data block"]
  ADDR --> CMP{"Stored tag equals address tag and valid is 1?"}
  LINE --> CMP
  CMP -->|"Yes"| HIT["Hit: offset selects the byte"]
  CMP -->|"No"| MISS["Miss: fetch block from memory"]`,
        },
        {
          type: "example",
          title: "Address breakdown",
          steps: [
            "Given: 32-bit address, 32 KB cache, 64-byte blocks.",
            "Offset bits = log₂ 64 = 6. Lines = 32 KB / 64 B = 512.",
            "Direct mapped: index = log₂ 512 = 9 bits, tag = 32 − 9 − 6 = 17 bits.",
            "4-way set associative: sets = 512 / 4 = 128, so index = 7 bits and tag = 32 − 7 − 6 = 19 bits.",
            "Fully associative: no index, tag = 32 − 6 = 26 bits.",
            "Tag storage for direct mapped, with 1 valid bit per line: 512 × (17 + 1) = 9216 bits.",
          ],
        },
        {
          type: "example",
          title: "Tracing block accesses 0, 8, 0, 6, 8 with 4 lines",
          steps: [
            "Direct mapped (line = block mod 4): 0 miss, 8 miss and replaces 0, 0 miss and replaces 8, 6 miss in line 2, 8 miss and replaces 0. Total: 5 misses.",
            "2-way set associative with LRU (set = block mod 2): 0 miss, 8 miss, 0 hit, 6 miss and replaces 8, 8 miss and replaces 0. Total: 4 misses.",
            "Fully associative with LRU: 0 miss, 8 miss, 0 hit, 6 miss, 8 hit. Total: 3 misses.",
            "Conclusion: higher associativity reduces conflict misses here.",
          ],
        },
        {
          type: "table",
          headers: ["Miss type", "Cause", "Reduced by"],
          rows: [
            ["Compulsory (cold)", "First access to a block", "Larger blocks, prefetching"],
            ["Capacity", "The cache is too small for the working set", "Larger cache"],
            ["Conflict", "Too many blocks map to the same set", "Higher associativity"],
          ],
        },
      ],
    },
    {
      id: "replacement-write",
      title: "Replacement & Write Policies",
      videoUrl: "",
      blocks: [
        {
          type: "paragraph",
          text: "On a miss in a full set, a **replacement policy** picks the victim. Direct-mapped caches need no policy because there is only one choice.",
        },
        {
          type: "points",
          items: [
            "**LRU:** replaces the least recently used block. It performs well but costs hardware to track usage.",
            "**FIFO:** replaces the oldest block, regardless of recent use.",
            "**Random:** simple to build and surprisingly effective.",
            "**LFU:** replaces the least frequently used block.",
          ],
        },
        {
          type: "diagram",
          title: "Cache read operation",
          caption: "On a miss, the block is loaded into the cache before the data is returned.",
          kind: "working-flowchart",
          mermaid: `flowchart TD
  A["CPU issues read address"] --> B{"Block in cache?"}
  B -->|"Yes"| C["Return data from cache"]
  B -->|"No"| D{"Free line in the set?"}
  D -->|"Yes"| G["Fetch block from memory"]
  D -->|"No"| E["Select victim using replacement policy"]
  E --> F{"Victim dirty?"}
  F -->|"Yes"| W["Write victim back to memory"]
  F -->|"No"| G
  W --> G
  G --> H["Place block in cache and update tag"]
  H --> C`,
        },
        {
          type: "table",
          headers: ["Feature", "Write-through", "Write-back"],
          rows: [
            ["On a write hit", "Update cache and memory", "Update cache only, and set the dirty bit"],
            ["Memory consistency", "Always current", "Stale until the block is evicted"],
            ["Write traffic", "High", "Low"],
            ["Eviction cost", "None", "Dirty block must be written"],
            ["Usual miss policy", "No-write-allocate", "Write-allocate"],
          ],
        },
        {
          type: "diagram",
          title: "Cache write operation",
          caption: "Write-through updates memory on every write. Write-back delays it until eviction.",
          kind: "working-flowchart",
          mermaid: `flowchart TD
  A["CPU issues write"] --> B{"Block in cache?"}
  B -->|"Hit"| C{"Write policy?"}
  C -->|"Write-through"| D["Update cache and memory"]
  C -->|"Write-back"| E["Update cache and set dirty bit"]
  B -->|"Miss"| F{"Allocate policy?"}
  F -->|"Write-allocate"| G["Load block into cache"]
  G --> C
  F -->|"No-write-allocate"| H["Update memory only"]`,
        },
        {
          type: "callout",
          variant: "remember",
          text: "The dirty bit is only needed in write-back caches. A write buffer lets a write-through cache continue without waiting for slow memory.",
        },
      ],
    },
    {
      id: "amat",
      title: "Average Memory Access Time",
      videoUrl: "",
      blocks: [
        {
          type: "callout",
          variant: "formula",
          text: "AMAT = Hit time + Miss rate × Miss penalty",
        },
        {
          type: "callout",
          variant: "formula",
          text: "Two levels: AMAT = L1 hit time + L1 miss rate × (L2 hit time + L2 local miss rate × Memory penalty)",
        },
        {
          type: "callout",
          variant: "formula",
          text: "Global L2 miss rate = L1 miss rate × L2 local miss rate. Stall CPI = accesses per instruction × miss rate × miss penalty",
        },
        {
          type: "example",
          title: "One-level AMAT",
          steps: [
            "Given: hit time 1 ns, miss rate 5%, miss penalty 100 ns.",
            "AMAT = 1 + 0.05 × 100 = 6 ns.",
          ],
        },
        {
          type: "example",
          title: "Two-level AMAT",
          steps: [
            "Given: L1 hit 1 ns with 5% miss rate, L2 hit 10 ns with 20% local miss rate, memory 100 ns.",
            "L2 AMAT = 10 + 0.2 × 100 = 30 ns.",
            "Overall AMAT = 1 + 0.05 × 30 = 2.5 ns.",
            "Global L2 miss rate = 0.05 × 0.2 = 1%.",
          ],
        },
        {
          type: "example",
          title: "Effect of misses on CPI",
          steps: [
            "Given: base CPI 1, 1.3 memory accesses per instruction, 2% miss rate, 50-cycle penalty.",
            "Memory stalls per instruction = 1.3 × 0.02 × 50 = 1.3 cycles.",
            "Effective CPI = 1 + 1.3 = 2.3.",
            "The processor runs 2.3 times slower than with a perfect cache.",
          ],
        },
        {
          type: "diagram",
          title: "Calculating AMAT",
          caption: "Work from the lowest level upward, replacing each miss penalty with the AMAT of the next level.",
          kind: "working-flowchart",
          mermaid: `flowchart TD
  A["Start at the lowest cache level"] --> B["Level AMAT = hit time + miss rate times penalty of next level"]
  B --> C{"Any higher level left?"}
  C -->|"Yes"| D["Use this AMAT as the miss penalty of the level above"]
  D --> B
  C -->|"No"| E["Result is the overall AMAT"]`,
        },
        {
          type: "callout",
          variant: "exam-tip",
          text: "Check whether the question gives a local or global miss rate for L2. Using the wrong one is the most common error in two-level cache numericals.",
        },
      ],
    },
  ],
  flashcards: [
    { front: "Temporal locality", back: "A recently accessed item is likely to be accessed again soon." },
    { front: "Spatial locality", back: "Items near a recently accessed item are likely to be accessed soon." },
    { front: "SRAM vs DRAM", back: "SRAM uses 6 transistors with no refresh and is used for cache. DRAM uses 1 transistor and 1 capacitor, needs refresh and is used for main memory." },
    { front: "Direct mapping", back: "Each block maps to exactly one line: line = block mod number of lines." },
    { front: "Fully associative", back: "A block can go in any line, so all tags must be compared." },
    { front: "Set associative", back: "A block maps to one set and may occupy any of k lines in it." },
    { front: "Tag bits formula", back: "Tag = address bits − index bits − offset bits." },
    { front: "AMAT", back: "Hit time + miss rate × miss penalty." },
    { front: "Write-through", back: "Each write updates both cache and memory." },
    { front: "Write-back", back: "Writes update only the cache, and memory is updated when a dirty block is evicted." },
    { front: "Dirty bit", back: "Marks a cache block as modified, so it must be written back on eviction." },
    { front: "Three Cs of cache misses", back: "Compulsory, capacity and conflict." },
    { front: "LRU", back: "Replaces the block that has gone unused for the longest time." },
    { front: "Write-allocate", back: "On a write miss, the block is loaded into the cache and then written." },
  ],
  quiz: [
    { id: "ch07-q01", question: "Which type of locality justifies fetching a whole block on a miss?", options: ["Temporal", "Spatial", "Sequential only", "None"], answerIndex: 1, explanation: "Nearby addresses are likely to be used soon, so a whole block is fetched.", difficulty: "easy", topic: "Locality" },
    { id: "ch07-q02", question: "Which memory needs periodic refresh?", options: ["SRAM", "DRAM", "EEPROM", "Flash"], answerIndex: 1, explanation: "DRAM stores charge on a capacitor, which leaks.", difficulty: "easy", topic: "RAM Types" },
    { id: "ch07-q03", question: "How many 4K × 8 chips are needed to build a 32K × 16 memory?", options: ["8", "12", "16", "32"], answerIndex: 2, explanation: "(32K/4K) × (16/8) = 8 × 2 = 16.", difficulty: "medium", topic: "Memory Chips" },
    { id: "ch07-q04", question: "A direct-mapped 16 KB cache has 32-byte blocks and 32-bit addresses. What are the tag, index and offset widths?", options: ["18, 9, 5", "17, 10, 5", "19, 8, 5", "20, 7, 5"], answerIndex: 0, explanation: "Offset = 5. Lines = 16 KB / 32 B = 512, so index = 9. Tag = 32 − 14 = 18.", difficulty: "medium", topic: "Cache Mapping" },
    { id: "ch07-q05", question: "An 8 KB 4-way cache has 16-byte blocks and 24-bit addresses. How many tag bits are there?", options: ["11", "12", "13", "14"], answerIndex: 2, explanation: "Offset = 4. Sets = 8192 / (16 × 4) = 128, so set bits = 7. Tag = 24 − 7 − 4 = 13.", difficulty: "hard", topic: "Cache Mapping" },
    { id: "ch07-q06", question: "In a direct-mapped cache with 16 lines, block 77 maps to which line?", options: ["5", "11", "13", "15"], answerIndex: 2, explanation: "77 mod 16 = 13.", difficulty: "easy", topic: "Cache Mapping" },
    { id: "ch07-q07", question: "Which mapping suffers most from conflict misses?", options: ["Direct", "2-way", "4-way", "Fully associative"], answerIndex: 0, explanation: "Each block has only one possible line, so conflicts are more frequent.", difficulty: "easy", topic: "Cache Misses" },
    { id: "ch07-q08", question: "Hit time is 2 ns, miss rate is 10% and miss penalty is 50 ns. What is the AMAT?", options: ["5 ns", "7 ns", "20 ns", "52 ns"], answerIndex: 1, explanation: "2 + 0.1 × 50 = 7 ns.", difficulty: "easy", topic: "AMAT" },
    { id: "ch07-q09", question: "L1: 1 ns, 10% miss rate. L2: 5 ns, 50% local miss rate. Memory: 100 ns. What is the AMAT?", options: ["2.5 ns", "6.5 ns", "11.5 ns", "16 ns"], answerIndex: 1, explanation: "L2 AMAT = 5 + 0.5 × 100 = 55. AMAT = 1 + 0.1 × 55 = 6.5 ns.", difficulty: "medium", topic: "AMAT" },
    { id: "ch07-q10", question: "The dirty bit is used in which kind of cache?", options: ["Write-through", "Write-back", "Read-only", "All direct-mapped"], answerIndex: 1, explanation: "It records which blocks must be written to memory on eviction.", difficulty: "easy", topic: "Write Policies" },
    { id: "ch07-q11", question: "Base CPI is 1, there are 1.5 memory accesses per instruction, the miss rate is 4% and the penalty is 20 cycles. What is the effective CPI?", options: ["1.8", "2.2", "2.5", "3.0"], answerIndex: 1, explanation: "Stalls = 1.5 × 0.04 × 20 = 1.2. CPI = 1 + 1.2 = 2.2.", difficulty: "medium", topic: "AMAT" },
    { id: "ch07-q12", question: "Using LRU with 2 lines fully associative, how many misses occur for blocks A, B, A, C, B?", options: ["3", "4", "5", "2"], answerIndex: 1, explanation: "A miss, B miss, A hit, C miss evicts B, B miss evicts A. That is 4 misses.", difficulty: "medium", topic: "Replacement" },
    { id: "ch07-q13", question: "A first access to a block is which kind of miss?", options: ["Capacity", "Conflict", "Compulsory", "Coherence"], answerIndex: 2, explanation: "It would miss even in an infinite cache.", difficulty: "easy", topic: "Cache Misses" },
    { id: "ch07-q14", question: "Which ROM type can be erased electrically one byte at a time?", options: ["PROM", "EPROM", "EEPROM", "Mask ROM"], answerIndex: 2, explanation: "EEPROM allows electrical erasure at byte level. EPROM needs UV light.", difficulty: "easy", topic: "ROM Types" },
    { id: "ch07-q15", question: "Doubling the associativity of a cache, with the size and block size fixed, changes the tag by:", options: ["+1 bit", "−1 bit", "No change", "Doubling"], answerIndex: 0, explanation: "The number of sets halves, so the index loses one bit and the tag gains one.", difficulty: "hard", topic: "Cache Mapping" },
  ],
  importantQuestions: [
    { q: "Explain the three cache mapping techniques with diagrams and compare them.", marks: 10, modelAnswer: "Direct: a block goes to one line, block mod lines. Address = Tag, Line, Offset. Simple and fast, with more conflict misses.\nFully associative: a block goes to any line. Address = Tag, Offset. Lowest conflict misses, but one comparator per line.\nSet associative: a block goes to any line in one set. Address = Tag, Set, Offset. A practical balance of both.\nDraw each lookup and compare hit time, cost and miss rate." },
    { q: "A 64 KB, 8-way set-associative cache has 64-byte blocks and 32-bit addresses. Find the tag, set and offset bits, and the total tag storage.", marks: 6, modelAnswer: "Offset = log₂ 64 = 6.\nLines = 64 KB / 64 B = 1024.\nSets = 1024 / 8 = 128, so set bits = 7.\nTag = 32 − 7 − 6 = 19.\nTag storage = 1024 × 19 = 19,456 bits, not counting valid and dirty bits." },
    { q: "Compare write-through and write-back policies. Explain write-allocate.", marks: 6, modelAnswer: "Write-through updates memory on every write, so memory is always current, but there is more traffic. It uses a write buffer.\nWrite-back updates only the cache and sets the dirty bit. Memory is updated on eviction, so traffic is lower but logic is more complex.\nWrite-allocate loads the block on a write miss, and is usually paired with write-back. No-write-allocate writes straight to memory." },
    { q: "Explain the memory hierarchy. Why does it work?", marks: 5, modelAnswer: "Levels: registers, cache, main memory, secondary storage. Moving down, size grows while speed and cost per bit fall.\nIt works because of locality: temporal, since recently used data is reused, and spatial, since nearby data is used soon.\nMost accesses are therefore served by fast levels." },
    { q: "L1 has a 1 ns hit time and a 4% miss rate, L2 has a 12 ns hit time and a 25% local miss rate, and memory takes 80 ns. Find the AMAT and the global miss rate.", marks: 5, modelAnswer: "L2 AMAT = 12 + 0.25 × 80 = 32 ns.\nAMAT = 1 + 0.04 × 32 = 2.28 ns.\nGlobal miss rate = 0.04 × 0.25 = 1%." },
    { q: "Compare SRAM and DRAM. Describe the ROM types.", marks: 5, modelAnswer: "SRAM: 6-transistor flip-flop, no refresh, fast, expensive, used for cache.\nDRAM: 1 transistor and 1 capacitor, needs refresh, dense, cheaper, used for main memory.\nROM types: Mask ROM (factory), PROM (one-time), EPROM (UV erase), EEPROM (electrical byte erase), Flash (electrical block erase)." },
    { q: "Compare LRU, FIFO and random replacement.", marks: 4, modelAnswer: "LRU evicts the least recently used block. It follows locality well and needs usage tracking.\nFIFO evicts the oldest block. It is simple, but may evict heavily used blocks.\nRandom picks any block. It needs almost no hardware and performs reasonably with large caches." },
  ],
  keyTerms: ["Memory hierarchy", "Locality of reference", "SRAM", "DRAM", "Cache", "Direct mapping", "Set associative", "Fully associative", "Tag", "AMAT", "LRU", "Write-through", "Write-back", "Dirty bit", "Hit ratio"],
};

export default chapter;
