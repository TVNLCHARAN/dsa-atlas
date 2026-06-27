// Concepts: Intervals · Bit Manipulation · Dynamic Programming · Advanced DP · Segment Tree · Fenwick Tree · Advanced Graph Algorithms
export const BATCH = {
  "intervals": {
    id: "intervals",
    name: "Intervals",
    summary: "Sort by an endpoint, then sweep once — overlaps become a simple comparison between neighbours.",
    overview: "## The core idea\n\nAn interval is a pair `[start, end]`. Almost every interval problem collapses to one move: **sort the intervals** (usually by `start`, sometimes by `end`) and then make a single left-to-right pass, comparing each interval only to what you are currently tracking. Once sorted, two intervals `a` and `b` overlap iff `a.start <= b.end` and `b.start <= a.end`; when both are sorted by start, the test simplifies to `b.start <= a.end`.\n\n## How to think\n\nAsk three questions: **What am I sorting by?** (start to merge/insert, end to schedule greedily), **what state do I carry?** (the current merged interval, or the last chosen end-time), and **what does the next interval do to that state?** (extend it, leave it alone, or start fresh). If you can answer those, the loop writes itself.\n\n## Variants\n\n- **Merge** — sort by start; extend `cur.end = max(cur.end, x.end)` while overlapping, else push.\n- **Insert** — three phases: copy intervals strictly before, merge those overlapping the new one, copy the rest.\n- **Greedy scheduling / non-overlapping** — sort by **end**; always keep the interval that finishes earliest to maximize how many fit.\n- **Sweep line / min rooms** — split into +1 start events and -1 end events, sort, and track a running counter for the peak overlap.\n\n## Edge thinking\n\nDecide up front whether endpoints are **inclusive** (`[1,2]` and `[2,3]` touch) or treated as half-open (`[1,2)` does not). That single choice flips a `<=` to a `<` and is the most common source of wrong answers.",
    recognition: [
      "Input is a list of pairs/ranges like [start, end] or [[1,3],[2,6],...]",
      "Question asks to merge, combine, or coalesce overlapping ranges",
      "Asks for minimum rooms/CPUs/platforms needed for simultaneous events",
      "Asks the minimum number of intervals to remove so the rest don't overlap",
      "Mentions meetings, bookings, calendars, schedules, or time slots",
      "Asks whether a person can attend all events / detect any conflict",
      "Asks to insert a new range into an already-sorted set of ranges"
    ],
    whenToUse: [
      "You can sort and a single sweep answers the question",
      "Overlap or coverage of 1-D ranges is the central relationship",
      "A greedy 'earliest finishing time' choice is provably optimal",
      "You need the maximum number of concurrently active intervals"
    ],
    whenNotToUse: [
      "Ranges live in 2-D/space — you likely need a sweep with a BST or segment tree",
      "There are heavy online updates/queries — prefer an interval/segment tree",
      "The relationship is containment-by-value not by position (use a different structure)"
    ],
    patterns: [
      { name: "Merge overlapping", note: "sort by start; if x.start <= cur.end extend cur.end = max(cur.end, x.end), else push cur and start new" },
      { name: "Insert interval", note: "before-phase, merge-phase, after-phase on an already-sorted list" },
      { name: "Greedy by end-time", note: "sort by end; keep the interval that finishes first to fit the most / remove the fewest" },
      { name: "Sweep line / events", note: "+1 at start, -1 at end, sort events, running counter gives peak overlap (min rooms)" },
      { name: "Two-heap / starts+ends arrays", note: "sort starts and ends separately; advance a pointer to reuse a freed room" }
    ],
    complexity: [
      { operation: "sort intervals", time: "O(n log n)", space: "O(n)", note: "dominant cost; the sweep itself is linear" },
      { operation: "merge / insert sweep", time: "O(n)", space: "O(n)", note: "one pass after sorting; output list" },
      { operation: "min rooms (events)", time: "O(n log n)", space: "O(n)", note: "sort 2n events, then linear counter" }
    ],
    edgeCases: [
      "Empty input or a single interval",
      "Touching endpoints: is [1,2] and [2,3] an overlap? decide inclusive vs half-open",
      "Fully nested interval: [1,10] contains [3,4] — still one merged block",
      "Duplicate intervals and zero-length intervals [t,t]",
      "Input not sorted (most problems do NOT pre-sort — you must)",
      "All intervals overlap into one, or none overlap at all"
    ],
    commonMistakes: [
      "Forgetting to sort, or sorting by the wrong key (start vs end)",
      "Using cur.end = x.end instead of max(cur.end, x.end) — loses a long enclosing interval",
      "Confusing <= and < at the boundary (inclusive vs exclusive endpoints)",
      "For min-rooms, comparing each pair O(n^2) instead of using sorted events",
      "Mutating the input list while iterating over it",
      "Greedy by start instead of by end when minimizing removals/maximizing count"
    ],
    template: { language: "python", code: "def merge(intervals):\n    intervals.sort(key=lambda iv: iv[0])          # sort by start\n    merged = []\n    for start, end in intervals:\n        # no overlap with the last merged block -> start a new one\n        if not merged or start > merged[-1][1]:\n            merged.append([start, end])\n        else:                                      # overlap -> extend\n            merged[-1][1] = max(merged[-1][1], end)\n    return merged\n\n\ndef min_meeting_rooms(intervals):\n    starts = sorted(iv[0] for iv in intervals)\n    ends   = sorted(iv[1] for iv in intervals)\n    rooms = peak = 0\n    j = 0\n    for s in starts:\n        if s < ends[j]:        # a meeting starts before the earliest end -> need a room\n            rooms += 1\n        else:                  # a room freed up; reuse it\n            j += 1\n        peak = max(peak, rooms)\n    return peak" },
    observations: [
      "Sorting is the whole game: once sorted, every interval only ever interacts with its immediate neighbour or the current block.",
      "To minimize removals (max non-overlapping count) sort by END and greedily keep earliest finishers — sorting by start is wrong.",
      "Min rooms equals the maximum number of intervals alive at any single point — a classic sweep-line counting result.",
      "The overlap test for two general intervals is a.start <= b.end and b.start <= a.end; memorize it.",
      "Insert/merge are the same problem: 'insert' is just merge restricted to one new interval against a sorted list."
    ],
    problems: [
      { title: "Meeting Rooms", url: "https://leetcode.com/problems/meeting-rooms/", difficulty: "Easy", pattern: "sort by start, detect any overlap" },
      { title: "Merge Intervals", url: "https://leetcode.com/problems/merge-intervals/", difficulty: "Medium", pattern: "sort by start, extend current block" },
      { title: "Insert Interval", url: "https://leetcode.com/problems/insert-interval/", difficulty: "Medium", pattern: "before / merge / after three-phase pass" },
      { title: "Non-overlapping Intervals", url: "https://leetcode.com/problems/non-overlapping-intervals/", difficulty: "Medium", pattern: "greedy by end-time, count removals" },
      { title: "Meeting Rooms II", url: "https://leetcode.com/problems/meeting-rooms-ii/", difficulty: "Medium", pattern: "sweep line / two-pointer peak overlap = min rooms" }
    ],
    videos: [
      { title: "Merge Intervals - Sorting - Leetcode 56", url: "https://www.youtube.com/watch?v=44H3cEC2fFM", source: "NeetCode" },
      { title: "Non-overlapping Intervals - Leetcode 435", url: "https://www.youtube.com/watch?v=nONCGxWoUfM", source: "NeetCode" },
      { title: "Intervals playlist (NeetCode 150)", url: "https://neetcode.io/courses/advanced-algorithms", source: "neetcode.io" }
    ],
    articles: [
      { title: "Merge Overlapping Intervals", url: "https://www.geeksforgeeks.org/dsa/merging-intervals/", source: "GeeksforGeeks" },
      { title: "Interval Scheduling Maximization (greedy)", url: "https://en.wikipedia.org/wiki/Interval_scheduling", source: "Wikipedia" },
      { title: "Merge Intervals - Solution & Explanation", url: "https://neetcode.io/solutions/merge-intervals", source: "NeetCode" }
    ]
  },

  "bit-manipulation": {
    id: "bit-manipulation",
    name: "Bit Manipulation",
    summary: "Treat an integer as an array of 32/64 bits and operate on all of them at once with AND, OR, XOR and shifts.",
    overview: "## The core idea\n\nEvery integer is a fixed-width string of bits. Bitwise operators let you read, set, clear and combine those bits in O(1) without loops, and they let one integer act as a tiny set (a **bitmask**). The five workhorses: `&` (AND, keep/test bits), `|` (OR, set bits), `^` (XOR, toggle / cancel pairs), `~` (NOT, flip), and `<<` / `>>` (shift = multiply/divide by powers of two).\n\n## How to think\n\nAsk: *what property of a single bit am I tracking, and which operator exposes it?* The recurring idioms are worth memorizing because they appear everywhere:\n\n- **Test bit i:** `x & (1 << i)`\n- **Set / clear / toggle bit i:** `x | (1 << i)` / `x & ~(1 << i)` / `x ^ (1 << i)`\n- **Lowest set bit:** `x & -x` — isolates the rightmost 1.\n- **Clear lowest set bit:** `x & (x - 1)` — the basis of Brian Kernighan's popcount.\n- **Is power of two:** `x > 0 and x & (x - 1) == 0`.\n\n## Variants\n\n- **XOR tricks** — `a ^ a = 0`, `a ^ 0 = a`, so XOR-ing a list cancels every duplicated value and leaves the unique one.\n- **Popcount / Kernighan** — strip the lowest 1 repeatedly to count set bits.\n- **Subset enumeration** — iterate all subsets of a mask, or all `2^n` masks for bitmask DP.\n- **Bit DP / masks as state** — represent 'which items are used' as one integer.\n\n## Edge thinking\n\nPython integers are **arbitrary precision and signed**, so there is no automatic 32-bit wraparound and `~x == -(x+1)`. For LeetCode 32-bit problems, mask with `& 0xFFFFFFFF` and re-interpret values above `0x7FFFFFFF` as negative.",
    recognition: [
      "Constraints are tiny (n <= 20-22), hinting a 2^n bitmask state",
      "Every element appears twice except one/two — screams XOR",
      "Asks to count set bits, or do something for each bit 0..31",
      "Mentions 'without using + / - / * /' or 'O(1) extra space'",
      "Asks about powers of two, single bit toggles, or subsets",
      "Problem is about flags/presence of a small fixed set of items",
      "Numbers compared by their binary representation (Hamming distance, Gray code)"
    ],
    whenToUse: [
      "State is a subset of a small universe (bitmask DP / TSP-style)",
      "You need O(1) set/test/clear of membership flags",
      "Duplicates cancel and you want the odd one out (XOR)",
      "Arithmetic must avoid +/- or you want fast *2 //2 via shifts"
    ],
    whenNotToUse: [
      "The universe of items is large (> ~30-60) — a mask no longer fits",
      "Logic is clearer with a real set/dict and performance is fine",
      "You need fractional or very large values where bit semantics blur"
    ],
    patterns: [
      { name: "XOR cancellation", note: "XOR all elements; pairs vanish (a^a=0), leaving the unique value" },
      { name: "Brian Kernighan popcount", note: "n &= n - 1 clears the lowest set bit; count iterations" },
      { name: "Lowest set bit isolate", note: "x & -x extracts the rightmost 1 (used in Fenwick trees too)" },
      { name: "Bitmask as a set", note: "1<<i is item i; OR to add, &~ to remove, & to test membership" },
      { name: "Subset / submask enumeration", note: "for sub in iterating mask: sub = (sub - 1) & mask visits every submask" },
      { name: "32-bit simulation", note: "mask with 0xFFFFFFFF and fix sign to emulate fixed-width ints in Python" }
    ],
    complexity: [
      { operation: "single bitwise op / shift", time: "O(1)", space: "O(1)", note: "on machine-word ints" },
      { operation: "Kernighan popcount", time: "O(set bits)", space: "O(1)", note: "<= word width iterations" },
      { operation: "enumerate all submasks of m", time: "O(3^n)", space: "O(1)", note: "summed over all masks of an n-bit universe" }
    ],
    edgeCases: [
      "Zero: no set bits, x & -x == 0",
      "Negative numbers and Python's infinite two's-complement (~x == -(x+1))",
      "Overflow expectations in 32-bit problems — mask with 0xFFFFFFFF",
      "Most significant / sign bit handling when reversing or adding bits",
      "n == 0 or n == 1 for power-of-two checks (1 is 2^0; 0 is not a power of two)",
      "Shifting by >= word width is undefined in C-like langs (fine in Python but mind intent)"
    ],
    commonMistakes: [
      "Operator precedence: & and | bind looser than ==, so write (x & m) == 0",
      "Forgetting Python ints don't wrap — needing & 0xFFFFFFFF for 32-bit answers",
      "Using x & (x-1) on a negative number and expecting power-of-two logic",
      "Confusing logical and/or with bitwise & / | in conditions",
      "Off-by-one in shifts: bit i is 1 << i, not 1 << (i-1)",
      "Assuming >> on negatives is logical shift (Python >> is arithmetic / floor)"
    ],
    template: { language: "python", code: "def single_number(nums):\n    # every value appears twice except one; XOR cancels the pairs\n    x = 0\n    for v in nums:\n        x ^= v\n    return x\n\n\ndef count_bits(n):\n    # Brian Kernighan: x & (x - 1) clears the lowest set bit\n    res = [0] * (n + 1)\n    for x in range(1, n + 1):\n        res[x] = res[x & (x - 1)] + 1   # one more bit than x with its lowest 1 removed\n    return res\n\n\ndef get_sum(a, b):\n    # add without + : XOR is sum-without-carry, (a&b)<<1 is the carry\n    mask = 0xFFFFFFFF\n    while b & mask:\n        a, b = a ^ b, (a & b) << 1\n    a &= mask\n    return a if a <= 0x7FFFFFFF else ~(a ^ mask)" },
    observations: [
      "x & -x isolating the lowest set bit is the single most reused trick — it powers Fenwick trees.",
      "XOR is its own inverse and order-independent; that is why it 'remembers' only odd-count elements.",
      "Iterating submasks with sub=(sub-1)&mask is the canonical way to split a set into two parts in DP.",
      "A mask of n bits has exactly 2^n subsets — that is why bitmask DP needs n <= ~20.",
      "In Python, bin(x).count('1') and int.bit_count() (3.10+) are clean popcounts when speed is fine."
    ],
    problems: [
      { title: "Single Number", url: "https://leetcode.com/problems/single-number/", difficulty: "Easy", pattern: "XOR cancellation" },
      { title: "Number of 1 Bits", url: "https://leetcode.com/problems/number-of-1-bits/", difficulty: "Easy", pattern: "Brian Kernighan popcount" },
      { title: "Counting Bits", url: "https://leetcode.com/problems/counting-bits/", difficulty: "Easy", pattern: "DP on x & (x-1)" },
      { title: "Sum of Two Integers", url: "https://leetcode.com/problems/sum-of-two-integers/", difficulty: "Medium", pattern: "XOR sum + carry, 32-bit masking" },
      { title: "Single Number II", url: "https://leetcode.com/problems/single-number-ii/", difficulty: "Medium", pattern: "bit-count mod 3 / two-state automaton" }
    ],
    videos: [
      { title: "Single Number - Leetcode 136 - Python", url: "https://www.youtube.com/watch?v=qMPX1AOa83k", source: "NeetCode" },
      { title: "Bit Manipulation Algorithms (full lesson)", url: "https://www.youtube.com/watch?v=NLKQEOgBAnw", source: "freeCodeCamp" },
      { title: "Bit Manipulation course / topic page", url: "https://neetcode.io/courses/dsa-for-beginners", source: "neetcode.io" }
    ],
    articles: [
      { title: "Bitwise Operators / All About Bit Manipulation", url: "https://www.geeksforgeeks.org/dsa/all-about-bit-manipulation/", source: "GeeksforGeeks" },
      { title: "Bit manipulation, setting/clearing bits", url: "https://cp-algorithms.com/algebra/bit-manipulation.html", source: "cp-algorithms" },
      { title: "Bitwise operation", url: "https://en.wikipedia.org/wiki/Bitwise_operation", source: "Wikipedia" }
    ]
  },

  "dp": {
    id: "dp",
    name: "Dynamic Programming",
    summary: "Solve a problem once per distinct subproblem by caching answers along an acyclic dependency of states.",
    overview: "## The core idea\n\nDynamic programming applies when a problem has **optimal substructure** (the answer is built from answers to smaller subproblems) and **overlapping subproblems** (the same subproblem is reached many ways). Instead of recomputing, you define a **state**, a **recurrence** that expresses it from smaller states, and **base cases** — then evaluate each state exactly once.\n\n## How to think\n\nWrite the brute-force recursion first, then ask three questions: **What are the parameters that change?** Those are your state. **What is the recurrence?** Express the answer at a state in terms of strictly smaller states. **What order makes dependencies ready?** Top-down (memoized recursion) computes lazily; bottom-up (a table/loop) computes in dependency order. A clean test: if you can describe the state in one sentence and the transition in one line, the code follows.\n\n## Variants\n\n- **1-D linear** — `dp[i]` from `dp[i-1]`/`dp[i-2]` (climbing stairs, house robber, max subarray).\n- **Grid / 2-D** — `dp[i][j]` from up/left neighbours (unique paths, edit distance, LCS).\n- **Knapsack-style** — choose-or-skip with a capacity dimension (subset sum, coin change).\n- **Subsequence** — LIS, LCS: state indexed by position(s).\n\n## Edge thinking\n\nGet the **base cases and array bounds** exactly right — an empty string, a zero target, or index `-1` is where DP breaks. When only the previous row/few states are used, **roll the array** to drop a dimension of space.",
    recognition: [
      "Asks for a count of ways, or a min/max over many overlapping choices",
      "Brute-force recursion reveals the same arguments recomputed repeatedly",
      "'Optimal'/'longest'/'fewest' over sequences, grids, or selections",
      "Greedy gives a wrong answer on a small counterexample",
      "Choices at each step are 'take it or skip it' with a running constraint",
      "The answer at position i clearly depends on a few earlier positions",
      "Constraints (n up to a few thousand, capacity small) allow an n*W table"
    ],
    whenToUse: [
      "Overlapping subproblems make plain recursion exponential",
      "There is clear optimal substructure (subproblem answers compose)",
      "You need an exact optimum/count, not an approximation",
      "State space is polynomial and fits in time and memory"
    ],
    whenNotToUse: [
      "A greedy choice is provably optimal (then greedy is simpler/faster)",
      "Subproblems don't overlap (plain divide and conquer suffices)",
      "State space is exponential with no structure to prune it",
      "Each subproblem is used once — caching buys nothing"
    ],
    patterns: [
      { name: "1-D linear DP", note: "dp[i] from dp[i-1], dp[i-2]: climbing stairs, house robber, max subarray (Kadane)" },
      { name: "Grid / 2-D DP", note: "dp[i][j] from neighbours: unique paths, min path sum, edit distance, LCS" },
      { name: "0/1 Knapsack", note: "dp[i][w] = max(skip, take if w>=weight); subset sum, partition" },
      { name: "Unbounded knapsack", note: "reuse items: coin change (min coins / number of ways)" },
      { name: "Subsequence DP", note: "LIS (dp[i]=longest ending at i), LCS (dp[i][j] over two strings)" },
      { name: "Memoization (top-down)", note: "@lru_cache the recursion; let recursion order resolve dependencies" }
    ],
    complexity: [
      { operation: "evaluate all states once", time: "O(#states * transition)", space: "O(#states)", note: "the universal DP cost model" },
      { operation: "0/1 knapsack", time: "O(n*W)", space: "O(W)", note: "rolling 1-D array over capacity" },
      { operation: "LIS (binary search)", time: "O(n log n)", space: "O(n)", note: "patience sorting tails array" }
    ],
    edgeCases: [
      "Empty input / n == 0 / target == 0",
      "Single element or single row/column grid",
      "Unreachable target (e.g., coin change returns -1)",
      "Negative numbers (Kadane must allow restarting the running sum)",
      "Base-case index of -1 or 0 (use a +1 offset row/col to avoid branches)",
      "Integer overflow in counting variants (not in Python, but mind the spec)"
    ],
    commonMistakes: [
      "Wrong base cases or off-by-one in table dimensions",
      "Iterating states in an order where a dependency isn't computed yet",
      "0/1 knapsack: looping capacity ascending in 1-D (reuses an item — that's unbounded)",
      "Forgetting to initialize 'impossible' states to inf / -inf / 0 correctly",
      "Caching on a mutable argument or missing a state parameter",
      "Assuming greedy works (e.g., coin change with arbitrary denominations)"
    ],
    template: { language: "python", code: "from functools import lru_cache\n\ndef coin_change(coins, amount):\n    # bottom-up unbounded knapsack: fewest coins to make `amount`\n    INF = float('inf')\n    dp = [0] + [INF] * amount        # dp[a] = min coins for amount a\n    for a in range(1, amount + 1):\n        for c in coins:\n            if c <= a:\n                dp[a] = min(dp[a], dp[a - c] + 1)\n    return dp[amount] if dp[amount] != INF else -1\n\n\ndef longest_common_subsequence(s, t):\n    # top-down memoized 2-D DP over two string indices\n    @lru_cache(maxsize=None)\n    def go(i, j):\n        if i == len(s) or j == len(t):\n            return 0\n        if s[i] == t[j]:\n            return 1 + go(i + 1, j + 1)\n        return max(go(i + 1, j), go(i, j + 1))\n    return go(0, 0)" },
    observations: [
      "Always derive the recurrence from a correct brute-force recursion first; the table is just that recursion memoized.",
      "Top-down only touches reachable states and is easier to get right; bottom-up is faster and enables space rolling.",
      "0/1 vs unbounded knapsack differs only by the inner loop direction over capacity — a one-character bug.",
      "If a state uses only the previous row/few values, you can almost always cut a whole dimension of memory.",
      "Counting problems and optimization problems share the same state; only the combine operator changes (sum vs min/max)."
    ],
    problems: [
      { title: "Climbing Stairs", url: "https://leetcode.com/problems/climbing-stairs/", difficulty: "Easy", pattern: "1-D linear, Fibonacci-style recurrence" },
      { title: "House Robber", url: "https://leetcode.com/problems/house-robber/", difficulty: "Medium", pattern: "1-D take-or-skip with a gap" },
      { title: "Coin Change", url: "https://leetcode.com/problems/coin-change/", difficulty: "Medium", pattern: "unbounded knapsack, min coins" },
      { title: "Longest Common Subsequence", url: "https://leetcode.com/problems/longest-common-subsequence/", difficulty: "Medium", pattern: "2-D subsequence DP over two strings" },
      { title: "Edit Distance", url: "https://leetcode.com/problems/edit-distance/", difficulty: "Hard", pattern: "2-D grid DP, insert/delete/replace" }
    ],
    videos: [
      { title: "Dynamic Programming Playlist (1-D, 2-D, knapsack...)", url: "https://www.youtube.com/playlist?list=PLot-Xpze53lcvx_tjrr_m2lgD2NsRHlNO", source: "NeetCode" },
      { title: "Dynamic Programming - Learn to Solve Algorithmic Problems (full course)", url: "https://www.youtube.com/watch?v=oBt53YbR9Kk", source: "freeCodeCamp" },
      { title: "Coin Change - Leetcode 322", url: "https://www.youtube.com/watch?v=ZM9svNsfzc4", source: "NeetCode" }
    ],
    articles: [
      { title: "Dynamic Programming (overview & patterns)", url: "https://www.geeksforgeeks.org/dsa/dynamic-programming/", source: "GeeksforGeeks" },
      { title: "Dynamic programming", url: "https://en.wikipedia.org/wiki/Dynamic_programming", source: "Wikipedia" },
      { title: "Intro to DP (knapsack & gold mine)", url: "https://usaco.guide/gold/intro-dp", source: "USACO Guide" }
    ]
  },

  "advanced-dp": {
    id: "advanced-dp",
    name: "Advanced DP",
    summary: "Higher-dimensional and structured DP: knapsack, LIS, interval DP, bitmask DP, digit DP and DP on trees.",
    overview: "## The core idea\n\nOnce the basic 1-D/2-D toolkit is fluent, advanced DP is about **choosing a richer state** so that an apparently exponential problem still has polynomially many distinct subproblems. The recurrence machinery is identical — the art is recognizing which extra dimension (a subset, an interval, a tree node, a 'tight' flag) tames the problem.\n\n## How to think\n\nIdentify the *minimal* information you must carry to make the next decision. If the state is **'which elements are used'** and n is tiny, encode it as a **bitmask** (`dp[mask]`). If decisions are over a **range that you split** at some midpoint `k`, it is **interval DP** (`dp[i][j]`). If you process a number **digit by digit** under an upper bound, carry a **'tight' flag** (digit DP). If the structure is a **tree**, root it and combine children results in a post-order DFS (DP on trees / rerooting).\n\n## Variants\n\n- **Knapsack family** — 0/1, unbounded, bounded, subset-sum, partition.\n- **LIS** — O(n log n) patience sorting; longest increasing/chain variants.\n- **Interval DP** — `dp[i][j]` split at `k`: matrix-chain, burst balloons, palindrome partitioning.\n- **Bitmask DP** — `dp[mask]` or `dp[mask][i]`: TSP, assignment, Hamiltonian counts.\n- **Digit DP** — count numbers <= N with a property, state = (pos, tight, accumulated).\n- **DP on trees** — subtree aggregates; rerooting for all-nodes answers.\n\n## Edge thinking\n\nWatch the **state-space size**: 2^n masks demand n <= ~20; interval DP is O(n^2) states with O(n) split, so O(n^3); digit DP states multiply by every flag you add, so keep flags minimal.",
    recognition: [
      "n <= 18-22 with 'visit all / assign all' -> bitmask DP (TSP, assignment)",
      "Cost depends on the order you merge/split a contiguous range -> interval DP",
      "'How many integers in [L, R] satisfy ...' -> digit DP with a tight flag",
      "Pick a value per node so adjacent nodes conflict (tree) -> DP on trees",
      "Longest increasing/chain under an ordering -> LIS with binary search",
      "Weights + a capacity with item-reuse rules -> a knapsack variant",
      "Brute force is exponential but the 'extra dimension' is small/bounded"
    ],
    whenToUse: [
      "The natural state needs a subset, an interval, a digit position, or a tree node",
      "A small bound (n<=20, value<=1e18 digits, capacity small) keeps states polynomial",
      "Greedy and basic DP both fail but optimal substructure still holds",
      "You must count or optimize over an exponential-looking choice set"
    ],
    whenNotToUse: [
      "n is large so 2^n masks blow up — seek a greedy/flow/graph model instead",
      "The split structure isn't contiguous (interval DP won't apply)",
      "A simpler 1-D/2-D DP already captures the state",
      "No optimal substructure — the global optimum isn't built from sub-optima"
    ],
    patterns: [
      { name: "0/1 & unbounded knapsack", note: "dp[w] capacity loop; descending = 0/1, ascending = unbounded; subset-sum/partition" },
      { name: "LIS in O(n log n)", note: "maintain 'tails'; bisect_left to place each value (patience sorting)" },
      { name: "Interval DP", note: "dp[i][j] = best over split k in (i,j); matrix chain, burst balloons, palindrome partition" },
      { name: "Bitmask DP", note: "dp[mask][i] = best path covering set mask ending at i; Held-Karp TSP, assignment" },
      { name: "Digit DP", note: "recurse over positions with (tight, started, accumulated) flags to count numbers <= N" },
      { name: "DP on trees / rerooting", note: "post-order DFS aggregates subtrees; second pass reroots for every node" }
    ],
    complexity: [
      { operation: "bitmask DP (Held-Karp TSP)", time: "O(2^n * n^2)", space: "O(2^n * n)", note: "n <= ~18-20" },
      { operation: "interval DP", time: "O(n^3)", space: "O(n^2)", note: "n^2 states, O(n) split each" },
      { operation: "digit DP", time: "O(digits * states * 10)", space: "O(digits * states)", note: "states = product of flags" }
    ],
    edgeCases: [
      "Bitmask: the empty mask (start) and full mask (all visited) base cases",
      "Interval DP: length-1 and length-2 ranges; inclusive vs exclusive split bounds",
      "Digit DP: leading zeros (a 'started' flag) and the tight constraint at the boundary",
      "Trees: leaves as base cases; disconnected forest; re-rooting parent contribution",
      "LIS: strictly vs non-strictly increasing changes bisect_left vs bisect_right",
      "Knapsack: capacity 0, items heavier than capacity, negative weights"
    ],
    commonMistakes: [
      "Iterating bitmasks out of order so a submask dependency isn't ready",
      "Interval DP: looping by i,j instead of by increasing length",
      "Digit DP: forgetting to reset the tight flag when a digit < bound is placed",
      "Trees: doing work before the children return (must be post-order)",
      "LIS: using bisect_right when the problem wants strictly increasing",
      "Exponential blowup from adding an unnecessary state dimension/flag"
    ],
    template: { language: "python", code: "from functools import lru_cache\n\ndef tsp(dist):\n    # Held-Karp bitmask DP: shortest tour visiting all n nodes, return to 0\n    n = len(dist)\n    FULL = (1 << n) - 1\n\n    @lru_cache(maxsize=None)\n    def go(mask, i):                       # min cost to finish, at i, visited = mask\n        if mask == FULL:\n            return dist[i][0]\n        best = float('inf')\n        for j in range(n):\n            if not (mask >> j) & 1:        # j not yet visited\n                best = min(best, dist[i][j] + go(mask | (1 << j), j))\n        return best\n    return go(1, 0)                        # start at node 0, only it visited\n\n\ndef interval_dp_min_cost(a):\n    # generic interval DP skeleton: combine two halves split at k\n    n = len(a)\n    dp = [[0] * n for _ in range(n)]\n    for length in range(2, n + 1):         # grow by interval length\n        for i in range(0, n - length + 1):\n            j = i + length - 1\n            dp[i][j] = min(dp[i][k] + dp[k + 1][j] + (a[i] + a[j])\n                           for k in range(i, j))\n    return dp[0][n - 1]" },
    observations: [
      "Iterate bitmask DP in increasing integer order (or by popcount) so every submask is finished before the superset.",
      "Interval DP must loop by length, not by raw i/j, so sub-intervals are ready when you split.",
      "Digit DP collapses an astronomical count into 'positions * flags' states — keep the flag set as small as possible.",
      "DP on trees is just a post-order DFS that returns an aggregate; rerooting reuses it to answer for every node in O(n).",
      "Held-Karp turns brute-force O(n!) TSP into O(2^n n^2) purely by remembering the visited *set* instead of the path."
    ],
    problems: [
      { title: "Longest Increasing Subsequence", url: "https://leetcode.com/problems/longest-increasing-subsequence/", difficulty: "Medium", pattern: "LIS, O(n log n) tails + bisect" },
      { title: "Partition Equal Subset Sum", url: "https://leetcode.com/problems/partition-equal-subset-sum/", difficulty: "Medium", pattern: "0/1 subset-sum knapsack" },
      { title: "Partition to K Equal Sum Subsets", url: "https://leetcode.com/problems/partition-to-k-equal-sum-subsets/", difficulty: "Medium", pattern: "bitmask DP over used elements" },
      { title: "Burst Balloons", url: "https://leetcode.com/problems/burst-balloons/", difficulty: "Hard", pattern: "interval DP, split at last-burst k" },
      { title: "Count Numbers with Unique Digits", url: "https://leetcode.com/problems/count-numbers-with-unique-digits/", difficulty: "Medium", pattern: "digit/combinatorial DP over positions" }
    ],
    videos: [
      { title: "Dynamic Programming Playlist (knapsack, LIS, MCM, DP on trees)", url: "https://www.youtube.com/playlist?list=PLgUwDviBIf0qUlt5H_kiKYaNSqJ81PMMY", source: "take U forward (Striver)" },
      { title: "0/1 Knapsack Problem (Dynamic Programming)", url: "https://www.youtube.com/watch?v=8LusJS5-AGo", source: "Tushar Roy" },
      { title: "Longest Increasing Subsequence - Leetcode 300", url: "https://www.youtube.com/watch?v=cjWnW0hdF1Y", source: "NeetCode" }
    ],
    articles: [
      { title: "Knapsack, LIS & advanced DP problems", url: "https://www.geeksforgeeks.org/dsa/dynamic-programming/", source: "GeeksforGeeks" },
      { title: "Bitmask DP / DP over subsets (SOS DP)", url: "https://cp-algorithms.com/algebra/all-submasks.html", source: "cp-algorithms" },
      { title: "Digit DP", url: "https://codeforces.com/blog/entry/53960", source: "Codeforces" }
    ]
  },

  "segment-tree": {
    id: "segment-tree",
    name: "Segment Tree",
    summary: "A balanced binary tree over array ranges giving O(log n) range queries and point/range updates for any associative op.",
    overview: "## The core idea\n\nA segment tree stores an array as a balanced binary tree where each node owns a contiguous range and holds an **aggregate** of that range (sum, min, max, gcd — any associative function with an identity). A query for `[l, r]` walks down, stitching together O(log n) precomputed node aggregates instead of scanning the range. An update fixes one leaf and re-aggregates its O(log n) ancestors.\n\n## How to think\n\nAsk: *is my combine operation associative, and what is its identity?* If yes, a segment tree works. Picture the recursion at a node covering `[lo, hi]` against a query `[l, r]`: **no overlap** -> return identity; **total cover** (`l <= lo and hi <= r`) -> return this node's value; **partial** -> recurse both children and combine. That three-case split is the whole algorithm for both query and update.\n\n## Variants\n\n- **Point update, range query** — the classic; rebuild one leaf path.\n- **Range update, range query** — needs **lazy propagation**: store a pending delta on a node and push it to children only when you next descend.\n- **Iterative (bottom-up) segment tree** — a compact `2n` array, great for point updates.\n- **Merge-sort tree / persistent** — store sorted lists or versioned nodes for harder queries.\n\n## Edge thinking\n\nAlways size the tree `2*N` (iterative) or `4*N` (recursive) so it never overflows for non-power-of-two `N`. The most error-prone part is **lazy propagation order**: push pending updates *down* before you read or recurse into children.",
    recognition: [
      "Many range queries (sum/min/max/gcd) interleaved with element updates",
      "Naive prefix sums break because the array keeps changing (mutable)",
      "Need range MIN/MAX/GCD, which prefix sums cannot do at all",
      "Both 'update a range' and 'query a range' are required (lazy propagation)",
      "Online queries you must answer as data arrives, not in one batch",
      "Counting/order-statistic over values after coordinate compression",
      "Constraints ~1e5 ops where O(n) per query would TLE"
    ],
    whenToUse: [
      "Mutable array with mixed range queries and updates",
      "The aggregate is associative (sum/min/max/gcd/xor) with an identity",
      "You need range MIN/MAX/GCD (Fenwick can't easily do these)",
      "Range updates are required (use lazy propagation)"
    ],
    whenNotToUse: [
      "Array is static — prefix sums / sparse table are simpler and faster",
      "You only need prefix sums with point updates — a Fenwick tree is shorter",
      "The operation isn't associative (no clean way to combine subranges)",
      "n is tiny — a plain loop is clearer and fast enough"
    ],
    patterns: [
      { name: "Recursive point-update tree", note: "three cases per node: no overlap (identity) / full cover (return) / partial (recurse both)" },
      { name: "Iterative bottom-up tree", note: "2n-sized array; leaves at [n, 2n), update a leaf and walk parents upward" },
      { name: "Lazy propagation", note: "range update: store pending delta, push down before descending into children" },
      { name: "Range-min / range-max", note: "combine = min/max, identity = +inf / -inf" },
      { name: "Merge-sort tree", note: "each node stores a sorted list of its range for 'count < x in [l,r]' queries" }
    ],
    complexity: [
      { operation: "build", time: "O(n)", space: "O(n)", note: "post-order fill of 2n/4n nodes" },
      { operation: "point update", time: "O(log n)", space: "O(1)", note: "one root-to-leaf path" },
      { operation: "range query", time: "O(log n)", space: "O(log n)", note: "recursion stack; iterative is O(1) extra" },
      { operation: "range update (lazy)", time: "O(log n)", space: "O(n)", note: "lazy tags array" }
    ],
    edgeCases: [
      "Non-power-of-two n (size the array 2n/4n to be safe)",
      "Single-element range l == r",
      "Empty / fully-out-of-range query must return the identity element",
      "Identity correctness: 0 for sum, +inf for min, -inf for max, 0 for xor",
      "Lazy: forgetting to push down before reading a child",
      "Index base: 0-indexed leaves vs 1-indexed node arithmetic"
    ],
    commonMistakes: [
      "Under-sizing the tree array (use 4*n recursive / 2*n iterative)",
      "Wrong identity so out-of-range branches corrupt the answer",
      "Lazy propagation: not pushing pending updates down before recursing/reading",
      "Mixing inclusive/exclusive range conventions between query and node ranges",
      "Recomputing a parent before both children are updated",
      "Using a segment tree where a static prefix sum or Fenwick tree would do"
    ],
    template: { language: "python", code: "class SegTree:\n    # point-update, range-sum segment tree (iterative, bottom-up)\n    def __init__(self, data):\n        self.n = len(data)\n        self.t = [0] * (2 * self.n)\n        self.t[self.n:] = data[:]               # leaves\n        for i in range(self.n - 1, 0, -1):      # build internal nodes\n            self.t[i] = self.t[2 * i] + self.t[2 * i + 1]\n\n    def update(self, i, val):                   # set position i to val\n        i += self.n\n        self.t[i] = val\n        i >>= 1\n        while i:\n            self.t[i] = self.t[2 * i] + self.t[2 * i + 1]\n            i >>= 1\n\n    def query(self, l, r):                       # sum of [l, r)  (half-open)\n        res = 0\n        l += self.n\n        r += self.n\n        while l < r:\n            if l & 1:\n                res += self.t[l]; l += 1\n            if r & 1:\n                r -= 1; res += self.t[r]\n            l >>= 1; r >>= 1\n        return res" },
    observations: [
      "Any associative op with an identity works: swap + for min/max/gcd/xor and the structure is unchanged.",
      "The iterative 2n version is shorter and faster for point updates; reach for recursion only when you need lazy ranges.",
      "Lazy propagation is the key skill for range-update problems — the invariant is 'a node's value is correct, its pending tag is not yet pushed'.",
      "A segment tree is strictly more powerful than a Fenwick tree (it does min/max/range-update); the cost is more code.",
      "Coordinate compression + segment tree turns value-based counting (e.g., inversions, k-th order) into index-based range queries."
    ],
    problems: [
      { title: "Range Sum Query - Mutable", url: "https://leetcode.com/problems/range-sum-query-mutable/", difficulty: "Medium", pattern: "point update, range-sum segment tree" },
      { title: "Range Sum Query 2D - Mutable", url: "https://leetcode.com/problems/range-sum-query-2d-mutable/", difficulty: "Medium", pattern: "2-D segment tree / Fenwick" },
      { title: "Count of Smaller Numbers After Self", url: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/", difficulty: "Hard", pattern: "BIT/segment tree on compressed values" },
      { title: "The Skyline Problem", url: "https://leetcode.com/problems/the-skyline-problem/", difficulty: "Hard", pattern: "range-max sweep / segment tree" },
      { title: "Falling Squares", url: "https://leetcode.com/problems/falling-squares/", difficulty: "Hard", pattern: "range-max update + query with lazy propagation" }
    ],
    videos: [
      { title: "Segment Tree & Fenwick Tree Masterclass (Range Query DS)", url: "https://www.youtube.com/watch?v=NEG-SoyigGE", source: "take U forward (Striver)" },
      { title: "Segment Trees - The Best Introduction in 10 mins", url: "https://www.youtube.com/watch?v=Ic7OO3Uw6J0", source: "Kunal Kushwaha" },
      { title: "WilliamFiset channel (data structures, segment tree)", url: "https://www.youtube.com/channel/UCD8yeTczadqdARzQUp29PJw", source: "WilliamFiset" }
    ],
    articles: [
      { title: "Segment Tree", url: "https://cp-algorithms.com/data_structures/segment_tree.html", source: "cp-algorithms" },
      { title: "Segment Tree Data Structure", url: "https://www.geeksforgeeks.org/dsa/segment-tree-data-structure/", source: "GeeksforGeeks" },
      { title: "Point Update Range Sum (segment tree)", url: "https://usaco.guide/gold/PURS", source: "USACO Guide" }
    ]
  },

  "fenwick-tree": {
    id: "fenwick-tree",
    name: "Fenwick Tree",
    summary: "A 15-line array (Binary Indexed Tree) giving O(log n) prefix sums and point updates using the lowest-set-bit trick.",
    overview: "## The core idea\n\nA Fenwick tree (Binary Indexed Tree, BIT) is a 1-indexed array where index `i` is responsible for the partial sum of a block of `i & -i` elements ending at `i`. That single trick — **`i & -i` isolates the lowest set bit** — lets you walk to the next relevant index in O(log n) for both prefix queries and point updates. A range sum `[l, r]` is just `prefix(r) - prefix(l-1)`.\n\n## How to think\n\nDon't picture an explicit tree — picture the index moving along its binary representation. **Query** `prefix(i)`: add `tree[i]`, then strip the lowest bit `i -= i & -i`, until `i == 0`. **Update** `add(i, delta)`: add to `tree[i]`, then climb `i += i & -i`, until past `n`. Two four-line loops cover most uses.\n\n## Variants\n\n- **Point update, prefix/range sum** — the canonical BIT.\n- **Range update, point query** — store deltas in a difference array under the BIT.\n- **Range update, range query** — two BITs combined.\n- **2-D BIT** — nest the trick over two dimensions for grid prefix sums.\n- **BIT for counting** — coordinate-compress values, then count inversions / smaller-after-self.\n\n## Edge thinking\n\nThe BIT is strictly **1-indexed** — index 0 is a sentinel and updating it loops forever (`0 & -0 == 0`). Compared with a segment tree it is shorter and ~2x faster, but it only does invertible aggregates (sum/xor), not range min/max.",
    recognition: [
      "Need prefix sums on an array that also receives point updates",
      "Counting inversions, or 'how many smaller/greater elements before/after'",
      "Range-sum queries with frequent single-element changes at ~1e5 scale",
      "You'd reach for a segment tree but only need sums (BIT is shorter)",
      "Order statistics over values after coordinate compression",
      "2-D grid cumulative sums with point updates",
      "Problem reduces to 'count of items <= x seen so far'"
    ],
    whenToUse: [
      "Point updates + prefix/range SUM (or xor) queries",
      "You want minimal code and the best constant factor",
      "Counting problems via coordinate compression (inversions, rank queries)",
      "2-D prefix sums with updates (nested BIT)"
    ],
    whenNotToUse: [
      "You need range MIN/MAX/GCD — the op isn't invertible, use a segment tree",
      "Range updates AND range min/max — segment tree with lazy propagation",
      "Array is static — a plain prefix-sum array is simpler",
      "The aggregate has no inverse (can't subtract prefixes)"
    ],
    patterns: [
      { name: "Point update / prefix sum", note: "update climbs i += i&-i; query descends i -= i&-i" },
      { name: "Range sum via two prefixes", note: "rangeSum(l, r) = prefix(r) - prefix(l - 1)" },
      { name: "Range update / point query", note: "store a difference array in the BIT: add +d at l, -d at r+1" },
      { name: "Range update / range query", note: "maintain two BITs to support both in O(log n)" },
      { name: "BIT for counting / inversions", note: "compress values; process array, query prefix count, then add 1 at the value's index" }
    ],
    complexity: [
      { operation: "build", time: "O(n log n)", space: "O(n)", note: "n point updates (or O(n) with a linear build)" },
      { operation: "point update", time: "O(log n)", space: "O(1)", note: "climb via i += i & -i" },
      { operation: "prefix query", time: "O(log n)", space: "O(1)", note: "descend via i -= i & -i" },
      { operation: "2-D BIT op", time: "O(log^2 n)", space: "O(n*m)", note: "nested loops over two dims" }
    ],
    edgeCases: [
      "1-indexing: never call update(0, ...) — it loops forever (0 & -0 == 0)",
      "Empty range query (l > r) should return 0",
      "Coordinate compression needed when values are large/sparse",
      "Duplicates in compression — decide stable ordering for counting",
      "Negative deltas (sum stays correct; min/max would not)",
      "Off-by-one converting external 0-based indices to internal 1-based"
    ],
    commonMistakes: [
      "Using 0-based indexing and getting an infinite loop at index 0",
      "Forgetting prefix(l-1) and double-counting the left endpoint in range sum",
      "Trying to do range min/max with a BIT (only invertible ops work)",
      "Mismatched compression maps between the update and the query phase",
      "Sizing the array n instead of n+1 (1-indexed needs one extra slot)",
      "Reaching for a BIT when a static prefix-sum array would suffice"
    ],
    template: { language: "python", code: "class Fenwick:\n    # 1-indexed Binary Indexed Tree: point update, prefix/range sum\n    def __init__(self, n):\n        self.n = n\n        self.tree = [0] * (n + 1)        # index 0 is a sentinel, unused\n\n    def update(self, i, delta):          # add delta at 1-based index i\n        while i <= self.n:\n            self.tree[i] += delta\n            i += i & (-i)                # climb to the next responsible index\n\n    def prefix(self, i):                 # sum of [1 .. i]\n        s = 0\n        while i > 0:\n            s += self.tree[i]\n            i -= i & (-i)                # strip the lowest set bit\n        return s\n\n    def range_sum(self, l, r):           # sum of [l .. r], 1-based inclusive\n        return self.prefix(r) - self.prefix(l - 1)\n\n\ndef count_inversions(a):\n    # classic BIT counting: process left->right, count larger seen before\n    order = {v: i + 1 for i, v in enumerate(sorted(set(a)))}\n    bit = Fenwick(len(order))\n    inv = 0\n    for v in reversed(a):                # count smaller elements to the right\n        inv += bit.prefix(order[v] - 1)\n        bit.update(order[v], 1)\n    return inv" },
    observations: [
      "The entire data structure is the identity i & -i = lowest set bit; everything else is two short loops.",
      "A BIT does anything a sum/xor segment tree does, in half the code and with a smaller constant — but never range min/max.",
      "Range sum is two prefix queries; range-update/range-query needs two BITs, a famous trick worth memorizing.",
      "For counting problems, coordinate-compress values to 1..k first, then the BIT indexes by rank, not value.",
      "Keep it strictly 1-indexed; a single 0-based update silently hangs because 0 & -0 == 0."
    ],
    problems: [
      { title: "Range Sum Query - Mutable", url: "https://leetcode.com/problems/range-sum-query-mutable/", difficulty: "Medium", pattern: "point update + prefix-sum BIT" },
      { title: "Range Sum Query 2D - Mutable", url: "https://leetcode.com/problems/range-sum-query-2d-mutable/", difficulty: "Medium", pattern: "2-D Fenwick tree" },
      { title: "Count of Smaller Numbers After Self", url: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/", difficulty: "Hard", pattern: "BIT counting + coordinate compression" },
      { title: "Reverse Pairs", url: "https://leetcode.com/problems/reverse-pairs/", difficulty: "Hard", pattern: "BIT / merge-sort inversion counting" },
      { title: "Count of Range Sum", url: "https://leetcode.com/problems/count-of-range-sum/", difficulty: "Hard", pattern: "prefix sums + BIT on compressed values" }
    ],
    videos: [
      { title: "Fenwick Tree (Binary Indexed Tree) - Tutorial & Source Code", url: "https://www.youtube.com/watch?v=uSFzHCZ4E-8", source: "WilliamFiset" },
      { title: "Binary Indexed Trees / Fenwick Trees made easy", url: "https://www.youtube.com/watch?v=DPiY9wFxGIw", source: "Tushar Roy" },
      { title: "Segment Tree & Fenwick Tree Masterclass (Range Query DS)", url: "https://www.youtube.com/watch?v=NEG-SoyigGE", source: "take U forward (Striver)" }
    ],
    articles: [
      { title: "Fenwick Tree", url: "https://cp-algorithms.com/data_structures/fenwick.html", source: "cp-algorithms" },
      { title: "Binary Indexed Tree or Fenwick Tree", url: "https://www.geeksforgeeks.org/dsa/binary-indexed-tree-or-fenwick-tree-2/", source: "GeeksforGeeks" },
      { title: "Fenwick tree", url: "https://en.wikipedia.org/wiki/Fenwick_tree", source: "Wikipedia" }
    ]
  },

  "advanced-graph": {
    id: "advanced-graph",
    name: "Advanced Graph Algorithms",
    summary: "Beyond BFS/DFS/Dijkstra: negative-weight shortest paths, all-pairs, connectivity structure (SCC, bridges) and max-flow.",
    overview: "## The core idea\n\nOnce you know BFS, DFS and Dijkstra, advanced graph work is about matching a *specialized* algorithm to a *specialized* requirement: **negative weights**, **all pairs at once**, **connectivity structure**, or **flow capacity**. Each has a signature shape and complexity; recognizing the requirement is most of the battle.\n\n## How to think\n\nClassify the question along two axes — *what are edges weighted with* and *what am I asked to find*:\n\n- **Shortest path, negative edges allowed?** -> **Bellman-Ford** (O(VE), also detects negative cycles). All pairs on a small dense graph -> **Floyd-Warshall** (O(V^3)).\n- **Directed connectivity / cycles collapsed?** -> **SCC** via Tarjan or Kosaraju (low-link / two DFS passes), then work on the condensation DAG.\n- **Undirected weak points?** -> **bridges and articulation points** via a single DFS tracking discovery time and `low` values.\n- **Throughput / matching / min-cut?** -> **max-flow** (Edmonds-Karp / Dinic); min-cut = max-flow.\n\n## Variants\n\n- **Bellman-Ford** — relax all edges V-1 times; a V-th relaxation that still improves means a negative cycle.\n- **Floyd-Warshall** — DP `dist[i][j] = min(dist[i][j], dist[i][k]+dist[k][j])` over intermediate k.\n- **Tarjan SCC / bridges** — DFS low-link unifies SCCs, bridges, and articulation points.\n- **Max-flow / min-cut** — augmenting paths through a residual graph.\n\n## Edge thinking\n\nMind the **negative-cycle** case (Bellman-Ford / Floyd-Warshall must detect it), the difference between **directed SCC** and **undirected bridges**, and that **Dijkstra silently breaks with negative edges** — a classic trap.",
    recognition: [
      "Edge weights can be negative -> Bellman-Ford, not Dijkstra",
      "Need shortest paths between ALL pairs on a small (V<=400) graph -> Floyd-Warshall",
      "Detect a negative cycle (arbitrage, profit loop)",
      "Collapse directed cycles / count strongly connected components -> SCC",
      "Find edges/nodes whose removal disconnects an undirected graph -> bridges/articulation",
      "Maximize flow / find a bottleneck min-cut / bipartite matching -> max-flow",
      "'At most k stops' shortest path -> Bellman-Ford style bounded relaxation"
    ],
    whenToUse: [
      "Negative edge weights or negative-cycle detection (Bellman-Ford)",
      "All-pairs shortest paths on a small dense graph (Floyd-Warshall)",
      "Reasoning about directed connectivity via the condensation DAG (SCC)",
      "Network throughput, min-cut, or bipartite matching (max-flow)"
    ],
    whenNotToUse: [
      "Non-negative weights, single source -> Dijkstra is faster than Bellman-Ford",
      "All-pairs on a large sparse graph -> run Dijkstra from each node, not Floyd-Warshall",
      "Unweighted shortest path -> plain BFS",
      "Graph is a tree/DAG with simpler structure (use DFS/topo DP)"
    ],
    patterns: [
      { name: "Bellman-Ford", note: "relax every edge V-1 times; an extra improving pass signals a negative cycle" },
      { name: "Floyd-Warshall", note: "triple loop over intermediate k; dist[i][j]=min(dist[i][j], dist[i][k]+dist[k][j])" },
      { name: "Tarjan SCC (low-link)", note: "single DFS with disc[] and low[]; pop a stack when low[u]==disc[u]" },
      { name: "Kosaraju SCC", note: "DFS order on G, then DFS on reversed G in that order" },
      { name: "Bridges & articulation points", note: "DFS tracking disc/low; bridge if low[v]>disc[u]; articulation via child counts" },
      { name: "Max-flow / min-cut", note: "BFS augmenting paths on the residual graph (Edmonds-Karp) until none remain" }
    ],
    complexity: [
      { operation: "Bellman-Ford", time: "O(V*E)", space: "O(V)", note: "detects negative cycles" },
      { operation: "Floyd-Warshall", time: "O(V^3)", space: "O(V^2)", note: "all pairs, small dense graphs" },
      { operation: "Tarjan / Kosaraju SCC", time: "O(V+E)", space: "O(V+E)", note: "single or double linear DFS" },
      { operation: "bridges / articulation", time: "O(V+E)", space: "O(V+E)", note: "one DFS, disc/low arrays" },
      { operation: "Edmonds-Karp max-flow", time: "O(V*E^2)", space: "O(V+E)", note: "Dinic is O(V^2 E)" }
    ],
    edgeCases: [
      "Negative cycle reachable from the source (no finite shortest path)",
      "Disconnected graph / unreachable nodes left at infinity",
      "Self-loops and parallel edges (matter for flow and bridges)",
      "Floyd-Warshall: initialize dist[i][i]=0 and use a safe 'infinity' that won't overflow on addition",
      "Directed vs undirected: bridges are undirected, SCC is directed",
      "Max-flow with zero-capacity or already-saturated edges; remember reverse residual edges"
    ],
    commonMistakes: [
      "Using Dijkstra with negative edges (it can return wrong distances silently)",
      "Bellman-Ford: stopping at V-1 passes and never checking for a negative cycle",
      "Floyd-Warshall: wrong loop order — k MUST be the outermost loop",
      "Adding to an INF sentinel and overflowing (cap or use float('inf'))",
      "Tarjan: confusing the on-stack check with plain visited; updating low incorrectly",
      "Max-flow: forgetting to add/decrement the reverse (residual) edge"
    ],
    template: { language: "python", code: "def bellman_ford(n, edges, src):\n    # shortest paths with negative edges; returns None if a negative cycle exists\n    INF = float('inf')\n    dist = [INF] * n\n    dist[src] = 0\n    for _ in range(n - 1):                 # relax all edges V-1 times\n        for u, v, w in edges:\n            if dist[u] != INF and dist[u] + w < dist[v]:\n                dist[v] = dist[u] + w\n    for u, v, w in edges:                  # one more pass detects a negative cycle\n        if dist[u] != INF and dist[u] + w < dist[v]:\n            return None\n    return dist\n\n\ndef floyd_warshall(dist):\n    # all-pairs shortest path; dist is a V x V matrix (INF where no edge)\n    n = len(dist)\n    for k in range(n):                     # intermediate node k MUST be outermost\n        for i in range(n):\n            if dist[i][k] == float('inf'):\n                continue\n            for j in range(n):\n                if dist[i][k] + dist[k][j] < dist[i][j]:\n                    dist[i][j] = dist[i][k] + dist[k][j]\n    return dist" },
    observations: [
      "Bellman-Ford's gift is the V-th pass: anything that still relaxes lies on (or downstream of) a negative cycle.",
      "Floyd-Warshall is just DP over 'allowed intermediate vertices'; the k-outermost loop order encodes that DP and is non-negotiable.",
      "Tarjan's low-link value (lowest disc reachable) is one idea that simultaneously yields SCCs, bridges, and articulation points.",
      "Max-flow equals min-cut (max-flow min-cut theorem), so the same algorithm answers bottleneck and separation questions.",
      "Bipartite matching is max-flow in disguise: source->left->right->sink with unit capacities."
    ],
    problems: [
      { title: "Network Delay Time", url: "https://leetcode.com/problems/network-delay-time/", difficulty: "Medium", pattern: "single-source shortest path (Bellman-Ford / Dijkstra)" },
      { title: "Cheapest Flights Within K Stops", url: "https://leetcode.com/problems/cheapest-flights-within-k-stops/", difficulty: "Medium", pattern: "bounded Bellman-Ford (k+1 relaxations)" },
      { title: "Find the City With the Smallest Number of Neighbors at a Threshold Distance", url: "https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/", difficulty: "Medium", pattern: "all-pairs Floyd-Warshall" },
      { title: "Critical Connections in a Network", url: "https://leetcode.com/problems/critical-connections-in-a-network/", difficulty: "Hard", pattern: "bridges via Tarjan low-link DFS" },
      { title: "Maximum Students Taking Exam", url: "https://leetcode.com/problems/maximum-students-taking-exam/", difficulty: "Hard", pattern: "bitmask DP / matching (max-flow flavored)" }
    ],
    videos: [
      { title: "Bellman Ford Algorithm - Single Source Shortest Path", url: "https://www.youtube.com/watch?v=FtN3BYH2Zes", source: "Abdul Bari" },
      { title: "Floyd-Warshall All Pairs Shortest Path", url: "https://www.youtube.com/watch?v=oNI0rf2P9gE", source: "Abdul Bari" },
      { title: "Tarjan's Strongly Connected Components Algorithm", url: "https://www.youtube.com/watch?v=TyWtx7q2D7Y", source: "WilliamFiset" },
      { title: "Bridges and Articulation Points", url: "https://www.youtube.com/watch?v=08SQ0KCgaR8", source: "WilliamFiset" },
      { title: "Max Flow Ford-Fulkerson | Source Code", url: "https://www.youtube.com/watch?v=Xu8jjJnwvxE", source: "WilliamFiset" }
    ],
    articles: [
      { title: "Bellman-Ford Algorithm", url: "https://cp-algorithms.com/graph/bellman_ford.html", source: "cp-algorithms" },
      { title: "Floyd-Warshall - All Pairs Shortest Paths", url: "https://cp-algorithms.com/graph/all-pair-shortest-path-floyd-warshall.html", source: "cp-algorithms" },
      { title: "Strongly Connected Components / Bridges & Cut Points", url: "https://cp-algorithms.com/graph/cutpoints.html", source: "cp-algorithms" },
      { title: "Maximum flow - Ford-Fulkerson and Edmonds-Karp", url: "https://cp-algorithms.com/graph/edmonds_karp.html", source: "cp-algorithms" }
    ]
  }
};
