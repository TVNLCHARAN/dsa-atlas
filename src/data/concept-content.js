// Static reference content for each DSA roadmap concept.
// Consumed by the Concept page. User-editable notes live separately in the DB.
export const CONCEPT_CONTENT = {
  "big-o": {
    id: "big-o",
    name: "Time Complexity & Big O",
    summary: "A language for describing how an algorithm's cost grows as the input grows, ignoring constants.",
    description:
      "Big O describes the asymptotic upper bound on how an algorithm's running time (or memory) scales with input size n. We drop constant factors and lower-order terms, so O(2n + 5) is just O(n). What matters in interviews is the dominant term as n gets large.\n\nTo estimate complexity, count how the number of operations grows: a single loop over n items is O(n), a nested loop is usually O(n^2), halving the search space each step is O(log n), and recursion that branches into two halves each call is often O(n log n). Always state both time and space.\n\nKnow the rough budget: most judges allow ~10^8 simple operations per second. If n <= 20 think exponential/bitmask, n <= 500 think O(n^3), n <= 5000 think O(n^2), n <= 10^6 think O(n) or O(n log n).",
    recognition: [
      "You need to justify why an approach is fast enough for the given constraints",
      "The problem gives explicit bounds like n <= 10^5, which hint at the target complexity",
      "You are comparing two correct solutions and must pick the more efficient one",
      "A solution times out (TLE) and you must find which loop dominates",
      "You see nested loops, recursion, or repeated work and need to total the cost",
    ],
    whenToUse: [
      "Choosing an algorithm before coding, using the constraints to back into the target Big O",
      "Explaining a TLE and deciding what to optimize",
      "Estimating extra memory for arrays, recursion stacks, or hash maps",
      "Comparing the trade-off between a faster algorithm and a simpler one",
    ],
    whenNotToUse: [
      "Micro-optimizing constants when the asymptotic class is already optimal",
      "Treating Big O as exact runtime; O(n) with a huge constant can lose to O(n log n)",
      "Ignoring it for tiny fixed inputs where any approach passes",
    ],
    complexity: [
      { operation: "Single pass over array", time: "O(n)", space: "O(1)", note: "one loop, constant extra space" },
      { operation: "Nested loop over all pairs", time: "O(n^2)", space: "O(1)", note: "watch for n > ~5000" },
      { operation: "Binary search / divide-and-halve", time: "O(log n)", space: "O(1)", note: "input must be sorted/monotonic" },
      { operation: "Sort then process", time: "O(n log n)", space: "O(n)", note: "comparison sort lower bound" },
      { operation: "Subsets / bitmask enumeration", time: "O(2^n)", space: "O(n)", note: "only feasible for n <= ~22" },
    ],
    commonMistakes: [
      "Forgetting that string concatenation in a loop is O(n^2), not O(n)",
      "Saying a hash map lookup is O(1) without noting worst-case O(n) on collisions",
      "Ignoring the O(n) recursion-stack space in 'O(1) space' claims",
      "Confusing the number of loop iterations with the work inside each iteration",
      "Dropping the wrong term: O(n + m) is not O(n) when m can dominate",
      "Assuming O(n log n) and O(n) are interchangeable under tight constraints",
    ],
    template: {
      language: "python",
      code: "# Estimating complexity by counting growth\n\n# O(n): one pass\ntotal = 0\nfor x in nums:\n    total += x\n\n# O(n^2): all pairs\nfor i in range(n):\n    for j in range(i + 1, n):\n        check(nums[i], nums[j])\n\n# O(log n): halve each step\nlo, hi = 0, n - 1\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    lo, hi = mid + 1, hi  # or hi = mid - 1\n\n# O(n log n): sort dominates\nnums.sort()",
    },
    observations: [
      "Constraints are a hint: n <= 10^5 almost always means O(n) or O(n log n) is intended",
      "Amortized O(1) (e.g. dynamic array append) can hide occasional O(n) resizes",
      "Two sequential loops are O(n + m), not O(n*m); nesting is what multiplies",
      "Space includes the output only if it is auxiliary; result storage is often excluded by convention",
      "log base does not matter in Big O since logs differ by a constant factor",
    ],
    videos: [
      { title: "Big O Notation - Full Course", url: "https://www.youtube.com/@NeetCode", source: "NeetCode" },
    ],
    articles: [
      { title: "Analysis of Algorithms (Big-O)", url: "https://www.geeksforgeeks.org/analysis-of-algorithms-big-o-analysis/", source: "GeeksforGeeks" },
      { title: "Big O notation", url: "https://en.wikipedia.org/wiki/Big_O_notation", source: "Wikipedia" },
    ],
  },

  "arrays": {
    id: "arrays",
    name: "Arrays",
    summary: "Contiguous, index-addressable storage — the foundation almost every other technique builds on.",
    description:
      "An array stores elements in contiguous memory, giving O(1) access by index. This makes scanning, in-place swaps, and random reads extremely cheap, but inserting or deleting in the middle costs O(n) because everything after shifts.\n\nMost array problems reduce to a small set of moves: scan once and track something (max, count, running value), use two indices that walk toward or with each other, or transform in place to save space. Recognizing which move applies is most of the battle.\n\nWatch the edges: empty arrays, single elements, and off-by-one bounds cause more bugs than the core logic. Decide up front whether you may mutate the input.",
    recognition: [
      "Input is a list/array and you need to read or transform it by position",
      "You can solve it with one or two linear scans",
      "In-place modification is requested or rewarded (O(1) extra space)",
      "Order matters and you cannot freely reorder without losing information",
      "You need running aggregates (max so far, count, sum) while iterating",
    ],
    whenToUse: [
      "Random access by index is needed in O(1)",
      "The data is fixed-size or append-mostly",
      "You want cache-friendly sequential iteration",
      "In-place rearrangement (rotate, partition, dedupe sorted) is the goal",
    ],
    whenNotToUse: [
      "Frequent insertion/deletion in the middle (prefer linked list or balanced structure)",
      "You need fast membership tests by value (prefer a hash set)",
      "Keys are sparse or non-integer (prefer a hash map)",
    ],
    complexity: [
      { operation: "Access / update by index", time: "O(1)", space: "O(1)", note: "direct addressing" },
      { operation: "Linear scan / search", time: "O(n)", space: "O(1)", note: "unsorted data" },
      { operation: "Insert / delete at middle", time: "O(n)", space: "O(1)", note: "shifts elements" },
      { operation: "Append (dynamic array)", time: "O(1) amortized", space: "O(1)", note: "occasional resize" },
    ],
    commonMistakes: [
      "Off-by-one errors in loop bounds (range(n) vs range(n-1))",
      "Mutating the array while iterating over it by index, skipping elements",
      "Forgetting empty-array and single-element edge cases",
      "Using O(n) del/pop(0) inside a loop, making it O(n^2)",
      "Assuming the input is sorted when it is not",
      "Aliasing: copying a reference instead of the data when you need a snapshot",
    ],
    template: {
      language: "python",
      code: "def transform_in_place(nums):\n    # Two-index in-place pattern: write compacted result to the front\n    write = 0\n    for read in range(len(nums)):\n        if keep(nums[read]):\n            nums[write] = nums[read]\n            write += 1\n    # nums[:write] is the result; return new logical length\n    return write\n\n\ndef keep(x):\n    return x != 0  # example: move non-zeros to front",
    },
    observations: [
      "Many 'O(1) space' array tricks work by overwriting the input from the front while reading ahead",
      "Negating values or using index-as-hash lets you mark seen state without extra space when values are bounded by n",
      "Reversing subarrays is the key primitive behind in-place rotation",
      "Iterating backward avoids index shifts when deleting in place",
    ],
    videos: [
      { title: "Arrays & Hashing - NeetCode Roadmap", url: "https://neetcode.io/roadmap", source: "NeetCode" },
    ],
    articles: [
      { title: "Array Data Structure", url: "https://www.geeksforgeeks.org/array-data-structure/", source: "GeeksforGeeks" },
    ],
  },

  "strings": {
    id: "strings",
    name: "Strings",
    summary: "Arrays of characters with their own gotchas: immutability, encoding, and pattern matching.",
    description:
      "Strings are sequences of characters and share most array techniques, but in many languages (Python, Java) they are immutable, so building a result character-by-character with + is O(n^2). Collect parts in a list and join once instead.\n\nCommon string tasks: frequency counting (use a hash map or fixed-size array of 26), comparing anagrams, checking palindromes with two pointers, parsing/tokenizing, and substring search. For heavy pattern matching, know that naive search is O(n*m) and algorithms like KMP get it to O(n + m).\n\nBe explicit about the alphabet (lowercase only? ASCII? Unicode?) and about case sensitivity — these assumptions change both correctness and the size of your counting array.",
    recognition: [
      "Input is text and you must search, count, compare, or transform characters",
      "You need to detect anagrams, palindromes, or character frequencies",
      "Parsing or tokenizing structured text (split, trim, group)",
      "Substring or pattern matching is involved",
      "A fixed small alphabet (a-z) lets you use a length-26 count array",
    ],
    whenToUse: [
      "Counting character frequencies for anagram/permutation checks",
      "Two-pointer palindrome or reversal checks",
      "Sliding window over characters (longest substring problems)",
      "Building output incrementally via a list + join",
    ],
    whenNotToUse: [
      "Repeated concatenation with + in a loop (use a list/StringBuilder)",
      "Treating bytes as characters when Unicode/multi-byte matters",
      "Assuming case/whitespace normalization that the problem did not state",
    ],
    complexity: [
      { operation: "Index a character", time: "O(1)", space: "O(1)", note: "by position" },
      { operation: "Concatenate two strings", time: "O(n + m)", space: "O(n + m)", note: "creates a new string" },
      { operation: "Build via list + join", time: "O(n)", space: "O(n)", note: "preferred over += in loop" },
      { operation: "Naive substring search", time: "O(n*m)", space: "O(1)", note: "KMP/Z give O(n+m)" },
      { operation: "Sort characters (anagram key)", time: "O(n log n)", space: "O(n)", note: "or O(n) with counts" },
    ],
    commonMistakes: [
      "Using s += c in a loop, turning O(n) into O(n^2)",
      "Comparing anagrams by sorting when counting is O(n) and faster",
      "Forgetting to normalize case or strip non-alphanumerics in palindrome checks",
      "Hardcoding 26 when the alphabet may include uppercase, digits, or Unicode",
      "Off-by-one in substring slicing (end index is exclusive in Python)",
      "Mutating a string in place where the language forbids it",
    ],
    template: {
      language: "python",
      code: "from collections import Counter\n\ndef is_anagram(s, t):\n    # O(n) frequency compare, no sorting needed\n    return Counter(s) == Counter(t)\n\n\ndef is_palindrome(s):\n    # Two pointers over alphanumeric chars, case-insensitive\n    i, j = 0, len(s) - 1\n    while i < j:\n        while i < j and not s[i].isalnum():\n            i += 1\n        while i < j and not s[j].isalnum():\n            j -= 1\n        if s[i].lower() != s[j].lower():\n            return False\n        i, j = i + 1, j - 1\n    return True",
    },
    observations: [
      "A length-26 int array is faster and lighter than a hash map for lowercase-only counting",
      "Anagram grouping uses the sorted string (or a count tuple) as a dictionary key",
      "Palindrome-with-deletion problems reduce to expand-around-center or two-pointer with one mismatch allowed",
      "ord(c) - ord('a') maps lowercase letters to 0..25 for indexing",
    ],
    videos: [
      { title: "NeetCode Roadmap - Strings", url: "https://neetcode.io/roadmap", source: "NeetCode" },
    ],
    articles: [
      { title: "String Data Structure", url: "https://www.geeksforgeeks.org/string-data-structure/", source: "GeeksforGeeks" },
    ],
  },

  "hashing": {
    id: "hashing",
    name: "Hash Maps / Hash Sets",
    summary: "Average O(1) lookup, insert, and delete by key — the universal trade of memory for speed.",
    description:
      "A hash map stores key-value pairs and a hash set stores unique keys, both giving expected O(1) insert, delete, and membership tests by hashing the key to a bucket. This is the single most common way to turn an O(n^2) scan into O(n).\n\nThe classic pattern is the 'complement' or 'seen' trick: as you iterate, store what you have seen so a future element can find its match in O(1) (Two Sum), or detect duplicates instantly. Maps are also the backbone of frequency counting, grouping, and memoization.\n\nThe cost is memory and the loss of order; iteration order is not the sorted order. Worst case is O(n) per operation under adversarial collisions, and hashing large/compound keys is not free.",
    recognition: [
      "You need fast membership or 'have I seen this?' checks",
      "Counting frequencies of items or characters",
      "Looking up a complement or pairing as you scan (Two Sum style)",
      "Grouping items by a derived key (anagrams, prefixes, categories)",
      "Caching results by an input key (memoization)",
      "De-duplicating a collection",
    ],
    whenToUse: [
      "Turning a nested-loop search into a single pass with a lookup table",
      "Counting or grouping by key",
      "Detecting duplicates or cycles in values",
      "Constant-time set operations (intersection, difference) on hashable items",
    ],
    whenNotToUse: [
      "You need ordered traversal or range queries (use a sorted structure/tree)",
      "Keys are unhashable or very large to hash repeatedly",
      "Memory is tight and the input is huge",
      "You need the smallest/largest element quickly (use a heap)",
    ],
    complexity: [
      { operation: "Insert / lookup / delete", time: "O(1) avg", space: "O(n)", note: "O(n) worst case on collisions" },
      { operation: "Count frequencies", time: "O(n)", space: "O(k)", note: "k distinct keys" },
      { operation: "Build set from list", time: "O(n)", space: "O(n)", note: "dedupe" },
      { operation: "Iterate all entries", time: "O(n)", space: "O(1)", note: "order not guaranteed" },
    ],
    commonMistakes: [
      "Using a list for membership tests, making the loop O(n^2)",
      "Mutating a key after insertion so it can no longer be found",
      "Using unhashable types (lists) as keys; use tuples instead",
      "Counting then forgetting to handle the key-not-present default (use defaultdict/get)",
      "Assuming dict iteration is sorted",
      "Storing indices vs values inconsistently in 'seen' maps",
    ],
    template: {
      language: "python",
      code: "def two_sum(nums, target):\n    # Map value -> index; look up the complement in O(1)\n    seen = {}\n    for i, x in enumerate(nums):\n        need = target - x\n        if need in seen:\n            return [seen[need], i]\n        seen[x] = i\n    return []\n\n\nfrom collections import defaultdict, Counter\n\ndef group_anagrams(words):\n    groups = defaultdict(list)\n    for w in words:\n        key = tuple(sorted(w))   # or a length-26 count tuple\n        groups[key].append(w)\n    return list(groups.values())",
    },
    observations: [
      "Store the index, not just presence, when you must return positions",
      "A count tuple (26 ints) is a collision-free anagram key and avoids sorting",
      "Set membership 'x in s' is O(1); 'x in list' is O(n) — a frequent hidden TLE",
      "Use a frozenset/tuple when you need a set or list as a dictionary key",
      "defaultdict(int) and Counter remove boilerplate for frequency maps",
    ],
    videos: [
      { title: "NeetCode Roadmap - Arrays & Hashing", url: "https://neetcode.io/roadmap", source: "NeetCode" },
    ],
    articles: [
      { title: "Hashing Data Structure", url: "https://www.geeksforgeeks.org/hashing-data-structure/", source: "GeeksforGeeks" },
    ],
  },

  "two-pointers": {
    id: "two-pointers",
    name: "Two Pointers",
    summary: "Two indices that walk a sequence to replace a nested loop with a single linear pass.",
    description:
      "The two-pointer technique uses two indices into one or more sequences and advances them based on a condition, turning many O(n^2) problems into O(n). There are two main flavors: opposite-ends (start and end moving inward, usually on sorted data) and same-direction (a slow/fast or read/write pair).\n\nOpposite-ends shines on sorted arrays: to find a pair with a target sum, move the left pointer right to increase the sum or the right pointer left to decrease it. Same-direction is the basis of in-place compaction and merging.\n\nThe key insight is that each pointer only moves in one direction and never backtracks, so total work is linear. You must be able to argue why moving a given pointer cannot skip a valid answer.",
    recognition: [
      "The array is sorted (or can be sorted) and you want pairs/triples meeting a sum condition",
      "You need to compare or merge from both ends inward",
      "Palindrome or reverse checks",
      "In-place removal/partition where a read and write index diverge",
      "Merging two sorted sequences",
    ],
    whenToUse: [
      "Finding pairs/triplets with a target on sorted data (2Sum/3Sum)",
      "Reversing or palindrome-checking in place",
      "Partitioning (Dutch national flag, move zeroes)",
      "Merging two sorted arrays or comparing two sequences",
      "Container/trapping-water style max-area problems",
    ],
    whenNotToUse: [
      "Data is unsorted and order matters and sorting would break the requirement",
      "You need all pairs regardless of a monotonic condition",
      "The decision to move a pointer is not monotonic/justifiable (you might skip answers)",
    ],
    complexity: [
      { operation: "Pair with target (sorted)", time: "O(n)", space: "O(1)", note: "after sorting if needed" },
      { operation: "3Sum (sort + two pointers)", time: "O(n^2)", space: "O(1)", note: "outer loop + inner two pointers" },
      { operation: "Merge two sorted arrays", time: "O(n + m)", space: "O(n + m)", note: "or O(1) merging in place from the back" },
      { operation: "In-place partition", time: "O(n)", space: "O(1)", note: "single pass" },
    ],
    commonMistakes: [
      "Forgetting to sort first when the technique requires sorted input",
      "Not skipping duplicates in 3Sum, producing repeated triplets",
      "Moving the wrong pointer, missing valid pairs",
      "Infinite loops from failing to advance a pointer on equality",
      "Off-by-one when pointers cross (use while i < j vs i <= j deliberately)",
      "Using opposite-ends logic on unsorted data",
    ],
    template: {
      language: "python",
      code: "def two_sum_sorted(nums, target):\n    # nums is sorted ascending\n    i, j = 0, len(nums) - 1\n    while i < j:\n        s = nums[i] + nums[j]\n        if s == target:\n            return [i, j]\n        elif s < target:\n            i += 1      # need a larger sum\n        else:\n            j -= 1      # need a smaller sum\n    return []\n\n\ndef three_sum(nums):\n    nums.sort()\n    res = []\n    for k in range(len(nums) - 2):\n        if k > 0 and nums[k] == nums[k - 1]:\n            continue                      # skip duplicate anchor\n        i, j = k + 1, len(nums) - 1\n        while i < j:\n            s = nums[k] + nums[i] + nums[j]\n            if s < 0:\n                i += 1\n            elif s > 0:\n                j -= 1\n            else:\n                res.append([nums[k], nums[i], nums[j]])\n                i += 1\n                j -= 1\n                while i < j and nums[i] == nums[i - 1]:\n                    i += 1                # skip duplicate\n    return res",
    },
    observations: [
      "Sorting first (O(n log n)) is often worth it to unlock an O(n) two-pointer pass",
      "Each pointer moves monotonically, so the total moves are bounded by n — that is the linear-time argument",
      "Merging two sorted arrays in place is easiest filling from the back to avoid overwrites",
      "3Sum = fix one element, then two-pointer the rest; generalizes to kSum by recursion",
      "Skip-duplicates logic is what makes results unique without a set",
    ],
    videos: [
      { title: "NeetCode Roadmap - Two Pointers", url: "https://neetcode.io/roadmap", source: "NeetCode" },
    ],
    articles: [
      { title: "Two Pointers Technique", url: "https://www.geeksforgeeks.org/two-pointers-technique/", source: "GeeksforGeeks" },
    ],
  },

  "sliding-window": {
    id: "sliding-window",
    name: "Sliding Window",
    summary: "A moving sub-range over a sequence whose two ends expand and shrink to maintain a property.",
    description:
      "Sliding window maintains a contiguous range [left, right] over an array or string and adjusts its boundaries to satisfy some constraint, computing answers for all valid windows in O(n) instead of O(n^2).\n\nThere are two patterns. Fixed-size windows slide one step at a time, adding the new element and removing the one that fell off. Variable-size (dynamic) windows expand the right edge to include more, then shrink the left edge while the window is invalid (e.g. too many distinct characters, sum too large), tracking the best valid window seen.\n\nThe efficiency comes from each index entering and leaving the window at most once, so even with the inner shrink loop the total work is linear.",
    recognition: [
      "You need the best/longest/shortest contiguous subarray or substring meeting a condition",
      "The phrase 'contiguous' plus a constraint (sum, distinct count, at most k)",
      "Fixed-length window statistics (max sum of size k, averages)",
      "Counting substrings with a monotonic property",
      "A brute force tries every subarray and is O(n^2)",
    ],
    whenToUse: [
      "Longest/shortest substring with a constraint (distinct chars, no repeats)",
      "Maximum/minimum sum of a fixed-size window",
      "Smallest window covering a target (minimum window substring)",
      "Counting windows where a condition holds",
    ],
    whenNotToUse: [
      "The subarray need not be contiguous (consider DP or hashing)",
      "The constraint is not monotonic, so shrinking does not cleanly restore validity",
      "Negative numbers break the 'shrink to reduce sum' assumption (use prefix sum + map)",
    ],
    complexity: [
      { operation: "Fixed-size window", time: "O(n)", space: "O(1)", note: "slide, add new, drop old" },
      { operation: "Variable-size window", time: "O(n)", space: "O(k)", note: "each index enters/exits once" },
      { operation: "Window with char counts", time: "O(n)", space: "O(alphabet)", note: "hash map of counts" },
    ],
    commonMistakes: [
      "Recomputing the whole window each step instead of incremental update (makes it O(n*k))",
      "Shrinking with a wrong loop condition, exiting too early or too late",
      "Using sliding window with negative numbers for sum constraints (it breaks monotonicity)",
      "Forgetting to update the answer at the right moment (before vs after shrinking)",
      "Not removing counts that drop to zero, corrupting the distinct-count logic",
      "Confusing 'at most k' vs 'exactly k' (exactly k = atMost(k) - atMost(k-1))",
    ],
    template: {
      language: "python",
      code: "def longest_no_repeat(s):\n    # Longest substring without repeating characters\n    last = {}              # char -> last index seen\n    left = 0\n    best = 0\n    for right, c in enumerate(s):\n        if c in last and last[c] >= left:\n            left = last[c] + 1     # jump left past the duplicate\n        last[c] = right\n        best = max(best, right - left + 1)\n    return best\n\n\ndef min_window_sum(nums, target):\n    # Shortest subarray with sum >= target (nums non-negative)\n    left = 0\n    cur = 0\n    best = float('inf')\n    for right, x in enumerate(nums):\n        cur += x\n        while cur >= target:\n            best = min(best, right - left + 1)\n            cur -= nums[left]\n            left += 1\n    return best if best != float('inf') else 0",
    },
    observations: [
      "Each element is added once and removed once, so the inner while-loop does not break linear time",
      "'Exactly k' problems often equal atMost(k) minus atMost(k-1)",
      "Update the answer after expanding for 'longest', and inside the shrink loop for 'shortest'",
      "A counts hash map plus a 'distinct' counter handles character-constraint windows cleanly",
      "Sliding window assumes non-negative contributions; negatives usually need prefix sum + hashing",
    ],
    videos: [
      { title: "NeetCode Roadmap - Sliding Window", url: "https://neetcode.io/roadmap", source: "NeetCode" },
    ],
    articles: [
      { title: "Window Sliding Technique", url: "https://www.geeksforgeeks.org/window-sliding-technique/", source: "GeeksforGeeks" },
    ],
  },

  "prefix-sum": {
    id: "prefix-sum",
    name: "Prefix Sum",
    summary: "Precompute cumulative totals so any range query becomes a single O(1) subtraction.",
    description:
      "A prefix sum array P stores P[i] = sum of the first i elements, so the sum of any range [l, r) is P[r] - P[l] in O(1) after an O(n) precompute. This trades O(n) space for instant range queries and is the backbone of many subarray problems.\n\nThe most powerful variant combines prefix sums with a hash map: while scanning, you store seen prefix sums and look up whether a needed prefix exists, letting you count subarrays with a target sum (including with negatives) in O(n). This is the standard answer to 'subarray sum equals k'.\n\nThe idea generalizes: prefix XOR, prefix products (careful with zeros), prefix counts, and 2D prefix sums for submatrix queries.",
    recognition: [
      "Many range-sum or range-aggregate queries over a static array",
      "Counting subarrays with a given sum, especially with negatives",
      "Submatrix sum queries in a grid (2D prefix)",
      "You need running totals or differences between positions",
      "Difference-array style range updates then a final scan",
    ],
    whenToUse: [
      "Answering repeated range-sum queries in O(1)",
      "Counting subarrays summing to k via prefix sum + hash map",
      "2D region sums on an immutable matrix",
      "Range increment updates with a difference array",
    ],
    whenNotToUse: [
      "The array changes frequently between queries (use a Fenwick/segment tree)",
      "You only need one range sum (a direct loop is simpler)",
      "Products with zeros or overflow concerns make prefix products fragile",
    ],
    complexity: [
      { operation: "Build prefix array", time: "O(n)", space: "O(n)", note: "one pass" },
      { operation: "Range sum query", time: "O(1)", space: "O(1)", note: "P[r] - P[l]" },
      { operation: "Count subarrays = k", time: "O(n)", space: "O(n)", note: "prefix sum + hash map" },
      { operation: "2D submatrix sum", time: "O(1) query", space: "O(m*n)", note: "after O(m*n) build" },
    ],
    commonMistakes: [
      "Off-by-one in inclusive vs exclusive range conventions",
      "Forgetting to seed the map with prefix 0 having count 1 in subarray-sum counting",
      "Using sliding window for subarray-sum-equals-k with negatives (it fails)",
      "Mismatched indices between the prefix array (size n+1) and the original array",
      "Integer overflow in languages without big ints (not Python, but note it)",
      "2D prefix inclusion-exclusion sign errors",
    ],
    template: {
      language: "python",
      code: "def build_prefix(nums):\n    # P has length n+1; P[i] = sum(nums[:i])\n    P = [0] * (len(nums) + 1)\n    for i, x in enumerate(nums):\n        P[i + 1] = P[i] + x\n    return P\n\n# range sum of nums[l:r] (r exclusive) = P[r] - P[l]\n\n\nfrom collections import defaultdict\n\ndef subarrays_sum_k(nums, k):\n    # Count subarrays whose sum == k (works with negatives)\n    count = 0\n    cur = 0\n    seen = defaultdict(int)\n    seen[0] = 1                  # empty prefix\n    for x in nums:\n        cur += x\n        count += seen[cur - k]   # prefixes that complete a sum of k\n        seen[cur] += 1\n    return count",
    },
    observations: [
      "Seeding seen[0] = 1 accounts for subarrays starting at index 0",
      "Prefix sum + hash map beats sliding window whenever values can be negative",
      "Prefix XOR answers 'subarray with XOR = k' the same way as prefix sum",
      "A difference array turns many range-add updates into one final prefix pass",
      "2D prefix uses P[i][j] = a[i][j] + P[i-1][j] + P[i][j-1] - P[i-1][j-1]",
    ],
    videos: [
      { title: "Prefix Sums - NeetCode", url: "https://www.youtube.com/@NeetCode", source: "NeetCode" },
    ],
    articles: [
      { title: "Prefix Sum Array", url: "https://www.geeksforgeeks.org/prefix-sum-array-implementation-applications-competitive-programming/", source: "GeeksforGeeks" },
    ],
  },

  "binary-search": {
    id: "binary-search",
    name: "Binary Search",
    summary: "Halve a sorted or monotonic search space each step to find an answer in O(log n).",
    description:
      "Binary search repeatedly halves a range, discarding the half that cannot contain the answer, achieving O(log n). It works on any sorted array, but its real power is 'binary search on the answer': when a yes/no predicate is monotonic over a numeric range, you can binary search for the boundary even without an explicit sorted array.\n\nThe two skills are getting the boundary logic right (lo/hi inclusive vs exclusive, when to use mid+1 vs mid) and finding the leftmost/rightmost position. The bisect module handles the common cases, but interviews often want the predicate version.\n\nThe classic trap is the mid overflow (mid = lo + (hi - lo) // 2 in fixed-width languages) and infinite loops from not shrinking the range correctly.",
    recognition: [
      "The array is sorted, or you can search on a sorted derived value",
      "You can phrase the goal as 'find the smallest/largest x such that predicate(x) is true'",
      "The feasibility predicate is monotonic (false...false, true...true)",
      "You need a position: first/last occurrence, insertion point, boundary",
      "Constraints are large (10^9) but the answer lies in a searchable range",
    ],
    whenToUse: [
      "Searching a sorted array for a value or boundary",
      "Binary search on the answer (min capacity, min days, smallest feasible value)",
      "Finding rotation point or peak in specific monotonic-ish arrays",
      "First/last position of a target (lower/upper bound)",
    ],
    whenNotToUse: [
      "Data is unsorted and the predicate is not monotonic",
      "The cost to sort first outweighs a single linear scan",
      "There is no monotonic structure to exploit",
    ],
    complexity: [
      { operation: "Search sorted array", time: "O(log n)", space: "O(1)", note: "iterative" },
      { operation: "Lower/upper bound", time: "O(log n)", space: "O(1)", note: "leftmost/rightmost" },
      { operation: "Binary search on answer", time: "O(log(range) * check)", space: "O(1)", note: "check is the predicate cost" },
    ],
    commonMistakes: [
      "Infinite loop from using mid (not mid+1) when lo can equal mid",
      "Mixing inclusive and exclusive bounds inconsistently",
      "Returning the wrong side for leftmost vs rightmost searches",
      "Forgetting the predicate must be monotonic for answer-search",
      "Overflow with (lo + hi) // 2 in fixed-width integer languages",
      "Searching an unsorted array",
    ],
    template: {
      language: "python",
      code: "def lower_bound(nums, target):\n    # Smallest index i with nums[i] >= target (insertion point)\n    lo, hi = 0, len(nums)          # hi exclusive\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid\n    return lo\n\n\ndef min_feasible(lo, hi, ok):\n    # Smallest x in [lo, hi] with ok(x) True; ok must be monotonic\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if ok(mid):\n            hi = mid\n        else:\n            lo = mid + 1\n    return lo",
    },
    observations: [
      "Think in terms of an invariant: the answer is always in [lo, hi)",
      "Use hi = len(nums) (exclusive) for the half-open template to avoid off-by-one bugs",
      "'Binary search on the answer' is the highest-leverage variant in hard problems",
      "leftmost: move hi to mid on success; rightmost: move lo to mid+1 and track",
      "Python's bisect_left / bisect_right implement lower/upper bound directly",
    ],
    videos: [
      { title: "NeetCode Roadmap - Binary Search", url: "https://neetcode.io/roadmap", source: "NeetCode" },
    ],
    articles: [
      { title: "Binary Search", url: "https://www.geeksforgeeks.org/binary-search/", source: "GeeksforGeeks" },
    ],
  },

  "sorting": {
    id: "sorting",
    name: "Sorting",
    summary: "Ordering data to unlock two pointers, binary search, greedy, and dedup — O(n log n) is the baseline.",
    description:
      "Sorting arranges elements by a key and is often a preprocessing step that makes the real algorithm trivial. Comparison sorts (merge, heap, quicksort, and the hybrids most languages ship) run in O(n log n), which is the lower bound for comparison-based sorting. Non-comparison sorts (counting, radix, bucket) can hit O(n) when keys are small integers.\n\nKnow the trade-offs: merge sort is stable and O(n log n) worst case but uses O(n) space; quicksort is in-place and fast in practice but O(n^2) worst case; heap sort is in-place O(n log n) but not stable. Stability matters when you sort by multiple keys.\n\nIn interviews you rarely implement a sort, but you choose a custom comparator/key, decide whether you need stability, and reason about whether sorting is affordable given the constraints.",
    recognition: [
      "A problem becomes easy if the data is ordered (pairs, intervals, greedy choices)",
      "You need to group equal or adjacent-by-key elements",
      "Custom ordering by one or more keys is required",
      "Deduplication or finding the k-th element",
      "Intervals or events need to be processed in order",
    ],
    whenToUse: [
      "Preprocessing for two pointers, binary search, or greedy",
      "Sorting intervals/events before a sweep",
      "Custom multi-key ordering via a comparator/key function",
      "Counting/radix sort when keys are small bounded integers",
    ],
    whenNotToUse: [
      "You only need the top-k or min/max (a heap or selection is cheaper)",
      "Data is already ordered or nearly so and a single scan suffices",
      "You need stable order but pick an unstable sort by mistake",
    ],
    complexity: [
      { operation: "Merge sort", time: "O(n log n)", space: "O(n)", note: "stable, worst-case guaranteed" },
      { operation: "Quicksort", time: "O(n log n) avg", space: "O(log n)", note: "O(n^2) worst, in-place" },
      { operation: "Heap sort", time: "O(n log n)", space: "O(1)", note: "in-place, not stable" },
      { operation: "Counting / radix sort", time: "O(n + k)", space: "O(n + k)", note: "small integer keys only" },
    ],
    commonMistakes: [
      "Assuming the language's sort is stable when it is not (varies by language)",
      "Writing a comparator that is not a strict weak ordering (crashes or wrong order)",
      "Sorting when a heap/partial selection would be cheaper for top-k",
      "Forgetting sort mutates the list in place (sorted() vs .sort())",
      "Sorting strings/numbers with the wrong key type (lexicographic vs numeric)",
      "Ignoring O(n log n) cost under tight constraints where O(n) was needed",
    ],
    template: {
      language: "python",
      code: "# Sort by a custom key, then by a tiebreaker\nintervals.sort(key=lambda iv: (iv[0], iv[1]))\n\n# Sort descending by value, ascending by name as tiebreak\nitems.sort(key=lambda it: (-it.value, it.name))\n\n# Counting sort for small non-negative integer keys (0..k)\ndef counting_sort(nums, k):\n    count = [0] * (k + 1)\n    for x in nums:\n        count[x] += 1\n    out = []\n    for v in range(k + 1):\n        out.extend([v] * count[v])\n    return out",
    },
    observations: [
      "O(n log n) is the proven lower bound for comparison sorts; beat it only with integer-key sorts",
      "Sort by tuple keys for multi-level ordering; negate a numeric key to reverse just that field",
      "Stability lets you sort by a secondary key first, then a primary key",
      "Sorting often converts an O(n^2) problem into O(n log n) plus a linear pass",
      "Python's sort (Timsort) is stable and adaptive to partially sorted data",
    ],
    videos: [
      { title: "Sorting Algorithms - NeetCode", url: "https://www.youtube.com/@NeetCode", source: "NeetCode" },
    ],
    articles: [
      { title: "Sorting Algorithms", url: "https://www.geeksforgeeks.org/sorting-algorithms/", source: "GeeksforGeeks" },
    ],
  },

  "stack": {
    id: "stack",
    name: "Stack",
    summary: "Last-in-first-out structure for nesting, matching, and undo-style backtracking in O(1) per op.",
    description:
      "A stack supports push, pop, and peek in O(1) and enforces LIFO order. It is the natural model for anything nested or that must be processed in reverse order of arrival: matching brackets, evaluating expressions, parsing, and simulating recursion iteratively.\n\nIn arrays it is usually implemented with a dynamic list (append/pop). The mental cue is 'the most recent unmatched thing': when you see a closing bracket you want the latest opener, when you backtrack you undo the latest choice.\n\nMany seemingly different problems — valid parentheses, decode strings, simplify paths, evaluate RPN — are all the same push-on-open, pop-on-close pattern.",
    recognition: [
      "Nested or balanced structures (brackets, tags, expressions)",
      "You repeatedly need the most recently seen unmatched item",
      "Evaluating or converting expressions (infix/postfix, RPN)",
      "Simulating recursion or DFS iteratively",
      "Undo/redo or backtracking-style state",
    ],
    whenToUse: [
      "Matching/validating nested delimiters",
      "Expression evaluation and parsing",
      "Iterative DFS to avoid recursion limits",
      "Building monotonic stacks for next-greater problems",
    ],
    whenNotToUse: [
      "You need FIFO order (use a queue)",
      "You need random access by index (use an array)",
      "You need the min/max overall quickly (use a heap or augmented stack)",
    ],
    complexity: [
      { operation: "Push / pop / peek", time: "O(1)", space: "O(1)", note: "amortized for dynamic array" },
      { operation: "Search for element", time: "O(n)", space: "O(1)", note: "stacks are not for search" },
      { operation: "Process nested input", time: "O(n)", space: "O(n)", note: "stack depth up to n" },
    ],
    commonMistakes: [
      "Popping from an empty stack (forgetting the empty check)",
      "Pushing the wrong half of a pair (push openers, match on closers)",
      "Forgetting to verify the stack is empty at the end of a matching problem",
      "Using a list's pop(0) (O(n)) instead of pop() for LIFO",
      "Mismatched bracket-type checking (only counting, not type)",
      "Not handling leftover unmatched items after the loop",
    ],
    template: {
      language: "python",
      code: "def is_valid(s):\n    pairs = {')': '(', ']': '[', '}': '{'}\n    stack = []\n    for c in s:\n        if c in '([{':\n            stack.append(c)\n        else:\n            # closing bracket: must match the latest opener\n            if not stack or stack[-1] != pairs[c]:\n                return False\n            stack.pop()\n    return not stack            # all openers matched\n\n\ndef eval_rpn(tokens):\n    stack = []\n    ops = {'+', '-', '*', '/'}\n    for t in tokens:\n        if t in ops:\n            b = stack.pop()\n            a = stack.pop()\n            if t == '+': stack.append(a + b)\n            elif t == '-': stack.append(a - b)\n            elif t == '*': stack.append(a * b)\n            else: stack.append(int(a / b))   # truncate toward zero\n        else:\n            stack.append(int(t))\n    return stack[0]",
    },
    observations: [
      "Always check for an empty stack before pop/peek to avoid crashes",
      "A matching problem is only valid if the stack ends empty",
      "Iterative DFS with an explicit stack avoids hitting recursion limits on deep inputs",
      "Storing (value, count) or (char, index) pairs on the stack handles richer parsing",
      "Python lists are stacks: append() and pop() are both amortized O(1)",
    ],
    videos: [
      { title: "NeetCode Roadmap - Stack", url: "https://neetcode.io/roadmap", source: "NeetCode" },
    ],
    articles: [
      { title: "Stack Data Structure", url: "https://www.geeksforgeeks.org/stack-data-structure/", source: "GeeksforGeeks" },
    ],
  },

  "monotonic-stack": {
    id: "monotonic-stack",
    name: "Monotonic Stack",
    summary: "A stack kept sorted (increasing or decreasing) to answer next/previous-greater queries in O(n).",
    description:
      "A monotonic stack maintains its elements in sorted order by popping any element that violates the order before pushing a new one. It answers 'next greater/smaller element' and 'previous greater/smaller element' for every position in O(n) total, because each index is pushed and popped at most once.\n\nThe pattern: iterate once, and while the top of the stack is smaller (or larger) than the current element, pop it — the current element is its answer. Then push the current index. Whether you keep it increasing or decreasing depends on whether you want next-greater or next-smaller.\n\nThis is the core of histogram largest-rectangle, daily temperatures, stock span, and many range problems that look like they need O(n^2).",
    recognition: [
      "You need the next or previous greater/smaller element for every index",
      "'Daily temperatures', 'stock span', 'next warmer day' style problems",
      "Largest rectangle in a histogram or maximal rectangle",
      "A brute force compares each element to others on one side, giving O(n^2)",
      "You must find spans bounded by a larger/smaller neighbor",
    ],
    whenToUse: [
      "Next/previous greater or smaller element for all positions",
      "Histogram largest rectangle and trapping rain water (one variant)",
      "Computing spans until a strictly larger/smaller value",
      "Removing elements to keep a sequence monotonic (build smallest number)",
    ],
    whenNotToUse: [
      "You need a global min/max or k-th element (use a heap)",
      "The relation you need is not 'nearest greater/smaller on one side'",
      "Order of processing does not let each element resolve exactly once",
    ],
    complexity: [
      { operation: "Next greater element (all)", time: "O(n)", space: "O(n)", note: "each index pushed/popped once" },
      { operation: "Largest rectangle in histogram", time: "O(n)", space: "O(n)", note: "monotonic increasing stack" },
      { operation: "Daily temperatures", time: "O(n)", space: "O(n)", note: "store indices on stack" },
    ],
    commonMistakes: [
      "Storing values when you need indices (you usually need indices for distances)",
      "Choosing the wrong monotonic direction for the query (greater vs smaller)",
      "Strict vs non-strict comparison errors (handling equal elements)",
      "Forgetting to flush the remaining stack after the loop",
      "Confusing 'next' (scan forward) with 'previous' (state already in stack)",
      "Not appending a sentinel for histogram problems, leaving bars unprocessed",
    ],
    template: {
      language: "python",
      code: "def daily_temperatures(temps):\n    # answer[i] = days until a warmer temperature (0 if none)\n    n = len(temps)\n    answer = [0] * n\n    stack = []                 # indices, temps decreasing from bottom\n    for i, t in enumerate(temps):\n        while stack and temps[stack[-1]] < t:\n            j = stack.pop()\n            answer[j] = i - j  # current i is the next warmer day for j\n        stack.append(i)\n    return answer\n\n\ndef largest_rectangle(heights):\n    stack = []                 # indices, heights increasing\n    best = 0\n    for i, h in enumerate(heights + [0]):  # sentinel flushes the stack\n        start = i\n        while stack and stack[-1][1] > h:\n            idx, ht = stack.pop()\n            best = max(best, ht * (i - idx))\n            start = idx\n        stack.append((start, h))\n    return best",
    },
    observations: [
      "Each index enters and leaves the stack once, so the total work is O(n) despite the inner loop",
      "Store indices, not values, when the answer is a distance or width",
      "Increasing stack -> answers about smaller neighbors; decreasing stack -> larger neighbors",
      "A sentinel (0 height or +/- infinity) at the end forces the stack to fully resolve",
      "The popped element's answer is the element that caused the pop",
    ],
    videos: [
      { title: "Monotonic Stack - NeetCode", url: "https://www.youtube.com/@NeetCode", source: "NeetCode" },
    ],
    articles: [
      { title: "Introduction to Monotonic Stack", url: "https://www.geeksforgeeks.org/introduction-to-monotonic-stack-2/", source: "GeeksforGeeks" },
    ],
  },

  "queue": {
    id: "queue",
    name: "Queue",
    summary: "First-in-first-out structure for level-order processing and buffering, O(1) per operation.",
    description:
      "A queue supports enqueue at the back and dequeue from the front in O(1), enforcing FIFO order. It is the engine behind breadth-first search, level-order tree traversal, and any 'process in arrival order' simulation.\n\nIn Python use collections.deque, which gives O(1) appends and pops at both ends; a plain list's pop(0) is O(n) and a classic source of TLE. A deque also doubles as a double-ended queue and as the container for monotonic-queue techniques.\n\nThe mental cue is 'process oldest first' or 'expand outward layer by layer' — whenever you need shortest path in an unweighted graph or to handle items in the order they appeared, reach for a queue.",
    recognition: [
      "BFS or level-order traversal",
      "Shortest path in an unweighted graph/grid",
      "Processing items strictly in arrival order (scheduling, buffering)",
      "Simulating rounds/turns where order is preserved",
      "You need O(1) push to back and pop from front",
    ],
    whenToUse: [
      "Breadth-first search over graphs, trees, or grids",
      "Level-by-level processing where you need each layer",
      "Producer/consumer or streaming buffers",
      "Multi-source BFS (seed multiple starts at once)",
    ],
    whenNotToUse: [
      "You need LIFO/backtracking (use a stack)",
      "You need priority ordering, not arrival order (use a heap)",
      "Random access by index is required (use an array)",
    ],
    complexity: [
      { operation: "Enqueue / dequeue", time: "O(1)", space: "O(1)", note: "use deque, not list.pop(0)" },
      { operation: "BFS over graph", time: "O(V + E)", space: "O(V)", note: "visited set + queue" },
      { operation: "Level-order traversal", time: "O(n)", space: "O(width)", note: "queue holds one level" },
    ],
    commonMistakes: [
      "Using list.pop(0) (O(n)) instead of deque.popleft() (O(1)), causing TLE",
      "Forgetting a visited set in BFS, revisiting nodes and looping",
      "Marking visited when dequeuing instead of when enqueuing, allowing duplicates in the queue",
      "Losing track of level boundaries when level grouping is needed",
      "Mixing up which end is front vs back",
      "Not handling an empty queue before dequeue",
    ],
    template: {
      language: "python",
      code: "from collections import deque\n\ndef bfs_levels(root):\n    # Level-order traversal of a tree\n    if not root:\n        return []\n    q = deque([root])\n    levels = []\n    while q:\n        size = len(q)                 # fix this level's count\n        level = []\n        for _ in range(size):\n            node = q.popleft()\n            level.append(node.val)\n            if node.left:\n                q.append(node.left)\n            if node.right:\n                q.append(node.right)\n        levels.append(level)\n    return levels",
    },
    observations: [
      "deque.popleft() is O(1); list.pop(0) is O(n) and a frequent hidden TLE",
      "Mark nodes visited when you enqueue them, not when you dequeue, to avoid duplicates",
      "Capturing len(queue) at the start of a level isolates each BFS layer",
      "BFS on an unweighted graph gives shortest path in edges, since it expands by distance",
      "Multi-source BFS seeds several starts at distance 0 for problems like rotting oranges",
    ],
    videos: [
      { title: "NeetCode Roadmap - Queues & BFS", url: "https://neetcode.io/roadmap", source: "NeetCode" },
    ],
    articles: [
      { title: "Queue Data Structure", url: "https://www.geeksforgeeks.org/queue-data-structure/", source: "GeeksforGeeks" },
    ],
  },

  "monotonic-queue": {
    id: "monotonic-queue",
    name: "Monotonic Queue",
    summary: "A deque kept monotonic to report the max/min of a sliding window in amortized O(1).",
    description:
      "A monotonic queue (usually a deque of indices) keeps its elements in sorted order so the window's maximum or minimum sits at the front. Before pushing a new element you pop smaller elements from the back (for a max-queue), and you pop the front when it slides out of the window.\n\nThis solves the sliding-window-maximum problem in O(n) instead of the O(n log n) heap approach or O(n*k) brute force. Each index is added and removed exactly once, so the work is linear.\n\nIt also underlies certain DP optimizations where you need the best value in a moving range. The trick is always: maintain monotonicity, store indices so you can check the window bound, and read the answer from the front.",
    recognition: [
      "Sliding window maximum or minimum over a fixed-size window",
      "You need the best value within a moving range in O(1)",
      "A heap solution is O(n log n) and you want O(n)",
      "DP transitions where the optimum comes from a bounded recent window",
      "Constraints make O(n*k) brute force too slow",
    ],
    whenToUse: [
      "Maximum/minimum of every window of size k",
      "Shortest subarray with sum at least k (deque on prefix sums)",
      "DP where each state depends on the max/min of a recent window",
      "Streaming max/min where elements expire by position",
    ],
    whenNotToUse: [
      "The window is not contiguous or has no fixed/monotone bound",
      "You need arbitrary k-th order statistics (use a heap or balanced BST)",
      "You need the max/min of the whole data, not a window (a single variable suffices)",
    ],
    complexity: [
      { operation: "Sliding window max/min", time: "O(n)", space: "O(k)", note: "each index pushed/popped once" },
      { operation: "Push element", time: "O(1) amortized", space: "O(1)", note: "pops happen across the whole run" },
      { operation: "Query window extreme", time: "O(1)", space: "O(1)", note: "front of the deque" },
    ],
    commonMistakes: [
      "Storing values instead of indices, so you cannot tell when the front expires",
      "Forgetting to pop the front when it leaves the window",
      "Using the wrong comparison direction (max-queue pops smaller from back)",
      "Reading the answer before the window has reached size k",
      "Strict vs non-strict pops causing duplicates to mishandle",
      "Reaching for a heap when O(n) is required by the constraints",
    ],
    template: {
      language: "python",
      code: "from collections import deque\n\ndef max_sliding_window(nums, k):\n    # Maximum of every window of size k, in O(n)\n    dq = deque()        # indices; values decreasing from front to back\n    res = []\n    for i, x in enumerate(nums):\n        # drop indices that fell out of the window\n        if dq and dq[0] <= i - k:\n            dq.popleft()\n        # maintain decreasing order: pop smaller from the back\n        while dq and nums[dq[-1]] <= x:\n            dq.pop()\n        dq.append(i)\n        if i >= k - 1:\n            res.append(nums[dq[0]])   # front is the window max\n    return res",
    },
    observations: [
      "The front of a decreasing deque is always the current window maximum",
      "Storing indices (not values) is what lets you expire elements by position",
      "Amortized O(1): every index is pushed once and popped at most once",
      "Flip the comparison (pop larger from back) to track the window minimum",
      "It beats a heap because expired elements are removed eagerly, not lazily",
    ],
    videos: [
      { title: "Sliding Window Maximum - NeetCode", url: "https://www.youtube.com/@NeetCode", source: "NeetCode" },
    ],
    articles: [
      { title: "Sliding Window Maximum (Monotonic Deque)", url: "https://www.geeksforgeeks.org/sliding-window-maximum-maximum-of-all-subarrays-of-size-k/", source: "GeeksforGeeks" },
    ],
  },

  "linked-list": {
    id: "linked-list",
    name: "Linked List",
    summary: "Nodes linked by pointers — O(1) insert/delete at a known position, but no random access.",
    description:
      "A linked list chains nodes that each hold a value and a pointer to the next (and for doubly linked, the previous). Inserting or deleting at a known node is O(1) because you just relink pointers, but accessing the k-th element is O(n) since you must walk from the head.\n\nMost interview problems are about careful pointer manipulation: reversing a list, merging sorted lists, detecting cycles, removing the n-th node, or reordering. The recurring tools are a dummy head node (to simplify edge cases at the front) and prev/cur pointers walked in lockstep.\n\nThe danger is always the pointers: losing the rest of the list by overwriting next before saving it, or mishandling the head/tail. Draw the nodes; track exactly which links you change and in what order.",
    recognition: [
      "Input is a linked list (head pointer) rather than an array",
      "Frequent insert/delete at the front or at a known node",
      "Reversal, merging, or reordering of nodes",
      "You must operate in O(1) extra space on the list itself",
      "Cycle detection or finding a midpoint",
    ],
    whenToUse: [
      "O(1) insertion/deletion at head or a known node",
      "Reversing or reordering nodes in place",
      "Merging sorted lists",
      "Implementing LRU cache (doubly linked list + hash map)",
    ],
    whenNotToUse: [
      "You need random access by index (use an array)",
      "You need to sort or binary search by position",
      "Cache locality matters (arrays are far more cache-friendly)",
    ],
    complexity: [
      { operation: "Access k-th node", time: "O(n)", space: "O(1)", note: "must traverse from head" },
      { operation: "Insert / delete at known node", time: "O(1)", space: "O(1)", note: "relink pointers" },
      { operation: "Search by value", time: "O(n)", space: "O(1)", note: "linear scan" },
      { operation: "Reverse the list", time: "O(n)", space: "O(1)", note: "iterative pointer flip" },
    ],
    commonMistakes: [
      "Overwriting node.next before saving the next node, losing the rest of the list",
      "Not using a dummy head, leading to messy special cases for the first node",
      "Off-by-one when finding the n-th node from the end",
      "Forgetting to set the tail's next to None, creating accidental cycles",
      "Null-pointer dereference at the end of the list",
      "Returning the old head after reversing instead of the new head",
    ],
    template: {
      language: "python",
      code: "class ListNode:\n    def __init__(self, val=0, nxt=None):\n        self.val = val\n        self.next = nxt\n\n\ndef reverse_list(head):\n    prev = None\n    cur = head\n    while cur:\n        nxt = cur.next     # save before overwriting\n        cur.next = prev    # flip the link\n        prev = cur\n        cur = nxt\n    return prev            # new head\n\n\ndef merge_sorted(a, b):\n    dummy = ListNode()\n    tail = dummy\n    while a and b:\n        if a.val <= b.val:\n            tail.next, a = a, a.next\n        else:\n            tail.next, b = b, b.next\n        tail = tail.next\n    tail.next = a or b     # attach the remainder\n    return dummy.next",
    },
    observations: [
      "A dummy head node removes almost all front-of-list special cases",
      "Always save node.next before you reassign it",
      "Reversal is three pointers (prev, cur, next) walked once",
      "Two pointers spaced n apart find the n-th node from the end in one pass",
      "LRU cache = hash map for O(1) lookup + doubly linked list for O(1) recency updates",
    ],
    videos: [
      { title: "NeetCode Roadmap - Linked List", url: "https://neetcode.io/roadmap", source: "NeetCode" },
    ],
    articles: [
      { title: "Linked List Data Structure", url: "https://www.geeksforgeeks.org/linked-list-data-structure/", source: "GeeksforGeeks" },
    ],
  },

  "fast-slow-pointers": {
    id: "fast-slow-pointers",
    name: "Fast & Slow Pointers",
    summary: "Two pointers at different speeds (tortoise and hare) to find cycles and midpoints in O(1) space.",
    description:
      "The fast-slow (Floyd's tortoise and hare) technique moves one pointer one step and another two steps per iteration. If there is a cycle, the fast pointer eventually laps and meets the slow one; if not, fast reaches the end. This detects cycles in linked lists and in functional graphs in O(1) extra space.\n\nThe same idea finds the middle of a list (when fast reaches the end, slow is at the middle) and the start of a cycle (after they meet, reset one pointer to the head and advance both one step at a time until they meet again).\n\nBeyond linked lists, it applies to sequences defined by a 'next' function — e.g. detecting the duplicate number where indices form an implicit linked list (Find the Duplicate Number).",
    recognition: [
      "Detect whether a linked list (or functional sequence) has a cycle",
      "Find the middle node of a linked list in one pass",
      "Find the entry point of a cycle",
      "Detect a duplicate via an implicit next-pointer mapping",
      "O(1) extra space is required and you cannot use a visited set",
    ],
    whenToUse: [
      "Cycle detection in a linked list with O(1) space",
      "Finding the midpoint of a list in a single pass",
      "Locating the start of a cycle",
      "Happy-number / sequence-cycle detection",
      "Find the Duplicate Number (indices as pointers)",
    ],
    whenNotToUse: [
      "A hash set of visited nodes is acceptable and clearer",
      "You need the full cycle length or all nodes (set-based may be simpler)",
      "The structure is not a single-successor sequence",
    ],
    complexity: [
      { operation: "Cycle detection", time: "O(n)", space: "O(1)", note: "Floyd's algorithm" },
      { operation: "Find middle node", time: "O(n)", space: "O(1)", note: "fast moves 2x" },
      { operation: "Find cycle start", time: "O(n)", space: "O(1)", note: "reset one pointer to head" },
    ],
    commonMistakes: [
      "Null-dereferencing fast.next.next without checking fast and fast.next first",
      "Returning the wrong middle for even-length lists (depends on loop condition)",
      "Forgetting that after meeting, you must reset to head to find the cycle start",
      "Advancing both pointers the same speed (then they never meet inside a cycle)",
      "Assuming a meeting point implies anything about length without the second phase",
      "Off-by-one in the start position of fast vs slow",
    ],
    template: {
      language: "python",
      code: "def has_cycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow is fast:\n            return True\n    return False\n\n\ndef cycle_start(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow is fast:                 # meeting point\n            ptr = head\n            while ptr is not slow:\n                ptr = ptr.next\n                slow = slow.next\n            return ptr                   # start of the cycle\n    return None\n\n\ndef middle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n    return slow                          # second middle on even length",
    },
    observations: [
      "After the pointers meet, the distance from head to the cycle start equals the distance from the meeting point to the start",
      "Check 'fast and fast.next' before stepping twice to avoid null dereferences",
      "When fast hits the end, slow is at the (second) middle for even lengths",
      "Find the Duplicate Number maps value->index to form an implicit linked list with a cycle",
      "It uses O(1) space, the key advantage over a visited hash set",
    ],
    videos: [
      { title: "Linked List Cycle - NeetCode", url: "https://www.youtube.com/@NeetCode", source: "NeetCode" },
    ],
    articles: [
      { title: "Floyd's Cycle Detection Algorithm", url: "https://www.geeksforgeeks.org/floyds-cycle-finding-algorithm/", source: "GeeksforGeeks" },
    ],
  },

  "recursion": {
    id: "recursion",
    name: "Recursion",
    summary: "Solving a problem by reducing it to smaller instances of itself, with a base case to stop.",
    description:
      "Recursion expresses a solution in terms of the same function applied to smaller inputs. Every recursion needs a base case that returns without recursing, and a recursive case that makes progress toward it. The call stack implicitly stores the state of each pending call.\n\nThe trick to reasoning about recursion is to trust the recursive call: assume it correctly solves the smaller subproblem, then focus only on combining its result with the current step. This 'leap of faith' is what makes tree and divide-and-conquer code so concise.\n\nBe mindful of depth: each call consumes stack space, so deep recursion (n up to 10^5+) can overflow; convert to iteration or increase limits. When the same subproblem recurs, add memoization to avoid exponential blowup (that is the gateway to DP).",
    recognition: [
      "The problem has a natural self-similar / nested structure (trees, intervals, grids)",
      "You can define the answer in terms of smaller subproblems",
      "Divide-and-conquer: split, solve halves, combine",
      "Generating combinations/permutations or exploring choices",
      "There is an obvious base case (empty, single element, leaf)",
    ],
    whenToUse: [
      "Traversing recursive structures (trees, nested lists)",
      "Divide and conquer (merge sort, quickselect, binary tree DP)",
      "Backtracking over choices",
      "Problems naturally defined by a recurrence",
    ],
    whenNotToUse: [
      "Recursion depth could exceed the stack limit (deep linked lists/chains)",
      "A simple loop is clearer and avoids call overhead",
      "Overlapping subproblems without memoization (exponential blowup)",
    ],
    complexity: [
      { operation: "Single recursion over n", time: "O(n)", space: "O(n)", note: "stack depth n" },
      { operation: "Two-way split + combine", time: "O(n log n)", space: "O(log n)", note: "divide and conquer" },
      { operation: "Branching without memo", time: "O(2^n)", space: "O(n)", note: "e.g. naive Fibonacci" },
      { operation: "With memoization", time: "O(states)", space: "O(states)", note: "becomes top-down DP" },
    ],
    commonMistakes: [
      "Missing or wrong base case, causing infinite recursion",
      "Not making progress toward the base case",
      "Recomputing overlapping subproblems instead of memoizing (exponential time)",
      "Mutating shared state across branches without undoing it",
      "Stack overflow on deep inputs where iteration was needed",
      "Confusing what the recursive call returns vs what you must combine",
    ],
    template: {
      language: "python",
      code: "from functools import lru_cache\n\ndef factorial(n):\n    if n <= 1:            # base case\n        return 1\n    return n * factorial(n - 1)   # trust the smaller call\n\n\n@lru_cache(maxsize=None)\ndef fib(n):\n    # memoization turns O(2^n) into O(n)\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)\n\n\ndef tree_height(node):\n    if not node:\n        return 0\n    return 1 + max(tree_height(node.left), tree_height(node.right))",
    },
    observations: [
      "Trust the recursion: assume the subcall is correct and only handle the combine step",
      "Adding @lru_cache or a memo dict is the single line that turns brute force into DP",
      "Each recursive call costs stack space; depth, not just total calls, can overflow",
      "Tail-recursive shapes can be rewritten as loops (Python does not optimize tail calls)",
      "Define the base case first; it is where most recursion bugs live",
    ],
    videos: [
      { title: "Recursion - NeetCode", url: "https://www.youtube.com/@NeetCode", source: "NeetCode" },
    ],
    articles: [
      { title: "Introduction to Recursion", url: "https://www.geeksforgeeks.org/introduction-to-recursion-data-structure-and-algorithm-tutorials/", source: "GeeksforGeeks" },
    ],
  },

  "trees": {
    id: "trees",
    name: "Trees",
    summary: "Hierarchical nodes with one root and no cycles; most operations are clean recursion.",
    description:
      "A tree is a connected acyclic structure where each node has children and (except the root) one parent. Binary trees, where each node has at most two children, dominate interviews. Many tree problems are solved by recursion: compute something for the subtrees, then combine for the current node.\n\nThe key decisions are the traversal order (pre/in/post for DFS, level-order for BFS) and what each node returns to its parent (a height, a sum, a boolean, a rebuilt subtree). Postorder is natural when the parent needs results from both children first.\n\nWatch the base case (usually a null node) and global vs returned state. Balanced trees give O(log n) height; degenerate trees become O(n) chains, which matters for both time and recursion depth.",
    recognition: [
      "Input is a tree (root node) and you must aggregate or search over it",
      "The answer for a node depends on its subtrees",
      "Height, depth, diameter, path sums, or subtree properties",
      "Level-order grouping or shortest depth questions (BFS)",
      "Lowest common ancestor or structural comparison of trees",
    ],
    whenToUse: [
      "Aggregating subtree information bottom-up (postorder DFS)",
      "Level-order or shortest-depth queries (BFS)",
      "Validating structure (balanced, symmetric, same tree)",
      "Path-based problems (root-to-leaf sums, max path sum)",
    ],
    whenNotToUse: [
      "Data is flat or has no hierarchy",
      "There are cycles or multiple parents (that is a general graph)",
      "You need fast value lookup without ordering (use a hash map)",
    ],
    complexity: [
      { operation: "Traverse all nodes (DFS/BFS)", time: "O(n)", space: "O(h)", note: "h = height; O(n) worst" },
      { operation: "Search in balanced BST", time: "O(log n)", space: "O(log n)", note: "O(n) if unbalanced" },
      { operation: "Compute height / diameter", time: "O(n)", space: "O(h)", note: "single postorder pass" },
      { operation: "Level-order (BFS)", time: "O(n)", space: "O(width)", note: "queue holds one level" },
    ],
    commonMistakes: [
      "Forgetting the null/None base case in recursion",
      "Confusing height (edges down) with depth (edges from root)",
      "Updating a global answer but returning the wrong value to the parent",
      "Stack overflow on a degenerate (linked-list-shaped) tree",
      "Mixing up left/right children in the recursion",
      "Counting nodes vs edges inconsistently in path length",
    ],
    template: {
      language: "python",
      code: "class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\n\ndef max_depth(root):\n    if not root:\n        return 0\n    return 1 + max(max_depth(root.left), max_depth(root.right))\n\n\ndef diameter(root):\n    best = 0\n    def height(node):\n        nonlocal best\n        if not node:\n            return 0\n        l = height(node.left)\n        r = height(node.right)\n        best = max(best, l + r)      # path through this node (edges)\n        return 1 + max(l, r)\n    height(root)\n    return best",
    },
    observations: [
      "Decide what each node returns to its parent before writing the recursion",
      "Postorder (children first) is the default when a node aggregates its subtrees",
      "Diameter = max over nodes of (left height + right height), measured in edges",
      "A global/nonlocal accumulator plus a clean returned value handles 'answer here, recurse there' problems",
      "Recursion depth equals tree height, so degenerate trees risk stack overflow",
    ],
    videos: [
      { title: "NeetCode Roadmap - Trees", url: "https://neetcode.io/roadmap", source: "NeetCode" },
    ],
    articles: [
      { title: "Binary Tree Data Structure", url: "https://www.geeksforgeeks.org/binary-tree-data-structure/", source: "GeeksforGeeks" },
    ],
  },

  "bst": {
    id: "bst",
    name: "Binary Search Trees",
    summary: "A binary tree ordered so left < node < right, giving O(h) search, insert, and delete.",
    description:
      "A binary search tree keeps the invariant that every node's left subtree holds smaller keys and its right subtree holds larger keys. This lets you search, insert, and delete in O(h) time, where h is the height — O(log n) when balanced, O(n) when degenerate.\n\nThe defining property is that an in-order traversal yields keys in sorted order, which is the source of many tricks: validating a BST, finding the k-th smallest, computing successor/predecessor, and range queries all lean on in-order order.\n\nVanilla BSTs can degrade to a linked list under sorted insertions; self-balancing variants (AVL, red-black) keep O(log n) guaranteed. In interviews you usually use the unbalanced version but should know the balanced guarantee exists.",
    recognition: [
      "The tree is stated to be a BST (ordered keys)",
      "You need sorted order, k-th smallest/largest, or successor/predecessor",
      "Range queries: count or list keys within [lo, hi]",
      "Insert/delete while maintaining sorted structure",
      "Validating that a tree obeys the BST property",
    ],
    whenToUse: [
      "Ordered lookups with O(log n) on balanced trees",
      "K-th smallest/largest via in-order traversal",
      "Range queries and successor/predecessor",
      "Maintaining a dynamic sorted set with inserts and deletes",
    ],
    whenNotToUse: [
      "Keys arrive sorted and you cannot balance (degrades to O(n))",
      "You only need membership without order (a hash set is O(1))",
      "Static data where a sorted array + binary search is simpler",
    ],
    complexity: [
      { operation: "Search", time: "O(h)", space: "O(h)", note: "O(log n) balanced, O(n) worst" },
      { operation: "Insert / delete", time: "O(h)", space: "O(h)", note: "delete must handle two-child case" },
      { operation: "In-order traversal", time: "O(n)", space: "O(h)", note: "yields sorted keys" },
      { operation: "K-th smallest", time: "O(h + k)", space: "O(h)", note: "in-order until k-th" },
    ],
    commonMistakes: [
      "Validating a BST by only comparing a node to its immediate children, not a value range",
      "Forgetting the two-children deletion case (replace with in-order successor)",
      "Assuming O(log n) without a balancing guarantee",
      "Comparing values with the wrong strict/non-strict inequality (duplicates)",
      "Losing subtrees during delete by mis-relinking pointers",
      "Stack overflow on a degenerate sorted-insert tree",
    ],
    template: {
      language: "python",
      code: "def search_bst(root, key):\n    while root:\n        if key == root.val:\n            return root\n        root = root.left if key < root.val else root.right\n    return None\n\n\ndef is_valid_bst(root):\n    # Each node must lie within an inherited (lo, hi) range\n    def ok(node, lo, hi):\n        if not node:\n            return True\n        if not (lo < node.val < hi):\n            return False\n        return ok(node.left, lo, node.val) and ok(node.right, node.val, hi)\n    return ok(root, float('-inf'), float('inf'))\n\n\ndef insert(root, key):\n    if not root:\n        return TreeNode(key)\n    if key < root.val:\n        root.left = insert(root.left, key)\n    else:\n        root.right = insert(root.right, key)\n    return root",
    },
    observations: [
      "In-order traversal of a BST is sorted — the basis for validation and k-th-smallest",
      "Validate with an inherited (lo, hi) range, not local parent-child comparisons",
      "Deleting a two-child node: swap with its in-order successor (leftmost of right subtree), then delete that",
      "Unbalanced BSTs degrade to O(n); balanced variants (AVL/red-black) guarantee O(log n)",
      "Successor of a node = leftmost node of its right subtree (if it exists)",
    ],
    videos: [
      { title: "NeetCode Roadmap - Trees / BST", url: "https://neetcode.io/roadmap", source: "NeetCode" },
    ],
    articles: [
      { title: "Binary Search Tree", url: "https://www.geeksforgeeks.org/binary-search-tree-data-structure/", source: "GeeksforGeeks" },
    ],
  },

  "tree-traversals": {
    id: "tree-traversals",
    name: "Tree Traversals",
    summary: "The orders for visiting nodes — preorder, inorder, postorder (DFS) and level-order (BFS).",
    description:
      "Tree traversal is the order in which you visit nodes. Depth-first traversals come in three flavors by when you process the current node relative to its children: preorder (node, left, right), inorder (left, node, right), and postorder (left, right, node). Breadth-first (level-order) visits nodes level by level using a queue.\n\nThe order you choose encodes the problem: inorder gives sorted output on a BST; preorder is natural for copying/serializing a tree top-down; postorder is needed when a node depends on results from both children (deletion, subtree sums, heights). Level-order answers depth and width questions.\n\nAll four are O(n) time. Recursion is the cleanest implementation, but each has an iterative form using an explicit stack (DFS) or queue (BFS), which you want when recursion depth is a risk.",
    recognition: [
      "You must visit every node in a specific order",
      "Sorted output from a BST (inorder)",
      "Serialize/deserialize or copy a tree (preorder)",
      "Aggregate from children before the parent (postorder)",
      "Group nodes by depth or find shortest depth (level-order)",
    ],
    whenToUse: [
      "Inorder: sorted traversal of a BST, k-th smallest",
      "Preorder: serialization, top-down copying, path building",
      "Postorder: subtree aggregation, deletion, height/diameter",
      "Level-order: per-level grouping, min depth, right-side view",
    ],
    whenNotToUse: [
      "You only need a single lookup (no full traversal needed)",
      "The structure is a general graph with cycles (need a visited set)",
      "Recursion depth would overflow and you have not switched to iterative",
    ],
    complexity: [
      { operation: "Any DFS traversal", time: "O(n)", space: "O(h)", note: "recursion/stack depth = height" },
      { operation: "Level-order (BFS)", time: "O(n)", space: "O(width)", note: "queue holds widest level" },
      { operation: "Iterative inorder", time: "O(n)", space: "O(h)", note: "explicit stack" },
      { operation: "Morris traversal", time: "O(n)", space: "O(1)", note: "threaded, mutates then restores" },
    ],
    commonMistakes: [
      "Mixing up the three DFS orders (where the node is processed)",
      "Using recursion on a deep/degenerate tree and overflowing the stack",
      "Forgetting to push children in the right order for iterative DFS (reverse for preorder)",
      "Not capturing level size in BFS when per-level grouping is required",
      "Processing a node before its children in postorder problems",
      "Assuming inorder gives sorted order on a non-BST",
    ],
    template: {
      language: "python",
      code: "def inorder(root):\n    # left, node, right (sorted for a BST)\n    res = []\n    def dfs(node):\n        if not node:\n            return\n        dfs(node.left)\n        res.append(node.val)\n        dfs(node.right)\n    dfs(root)\n    return res\n\n\ndef inorder_iterative(root):\n    res, stack, cur = [], [], root\n    while cur or stack:\n        while cur:\n            stack.append(cur)\n            cur = cur.left\n        cur = stack.pop()\n        res.append(cur.val)\n        cur = cur.right\n    return res\n\n\nfrom collections import deque\n\ndef level_order(root):\n    if not root:\n        return []\n    q, res = deque([root]), []\n    while q:\n        level = []\n        for _ in range(len(q)):\n            n = q.popleft()\n            level.append(n.val)\n            if n.left: q.append(n.left)\n            if n.right: q.append(n.right)\n        res.append(level)\n    return res",
    },
    observations: [
      "Inorder on a BST yields keys in sorted order — memorize this",
      "Postorder is the order to use when a parent needs both children's results first",
      "Preorder (node first) reconstructs/serializes a tree top-down",
      "For iterative preorder, push right child before left so left is processed first",
      "Morris traversal achieves O(1) space by temporarily threading leaves back to ancestors",
    ],
    videos: [
      { title: "Binary Tree Traversals - NeetCode", url: "https://www.youtube.com/@NeetCode", source: "NeetCode" },
    ],
    articles: [
      { title: "Tree Traversals (Inorder, Preorder, Postorder)", url: "https://www.geeksforgeeks.org/tree-traversals-inorder-preorder-and-postorder/", source: "GeeksforGeeks" },
    ],
  },

  "heap": {
    id: "heap",
    name: "Heap / Priority Queue",
    summary: "A tree-shaped array giving O(log n) insert and O(1) peek at the min (or max) element.",
    description:
      "A binary heap is a complete binary tree stored in an array where each parent is smaller (min-heap) or larger (max-heap) than its children. The extreme element sits at the root, so peek is O(1), while push and pop are O(log n). It is the go-to structure whenever you repeatedly need the current best element.\n\nClassic uses: top-k problems (keep a heap of size k), merging k sorted lists, scheduling by priority, and as the priority queue inside Dijkstra and Prim. Python's heapq is a min-heap; push negatives (or tuples with negated keys) to simulate a max-heap.\n\nBuilding a heap from n items is O(n) via heapify, faster than n separate pushes. A heap does not support efficient arbitrary search or ordered iteration — only the extreme is cheap.",
    recognition: [
      "You repeatedly need the smallest/largest element as data changes",
      "Top-k or k-th largest/smallest problems",
      "Merging k sorted lists/streams",
      "Scheduling or simulation by priority/time",
      "The priority queue inside Dijkstra/Prim",
    ],
    whenToUse: [
      "Maintaining the k best elements with a size-k heap",
      "Repeated extract-min/extract-max in graph algorithms",
      "Merging multiple sorted sequences",
      "Median of a stream (two heaps)",
    ],
    whenNotToUse: [
      "You need full sorted order (just sort once, O(n log n))",
      "You need fast arbitrary search or deletion of a specific element",
      "k is close to n (sorting may be simpler and comparable)",
    ],
    complexity: [
      { operation: "Peek min/max", time: "O(1)", space: "O(1)", note: "root of the heap" },
      { operation: "Push / pop", time: "O(log n)", space: "O(1)", note: "sift up/down" },
      { operation: "Build heap (heapify)", time: "O(n)", space: "O(1)", note: "faster than n pushes" },
      { operation: "Top-k via size-k heap", time: "O(n log k)", space: "O(k)", note: "scan with bounded heap" },
    ],
    commonMistakes: [
      "Forgetting Python's heapq is a min-heap; negate values for a max-heap",
      "Pushing all n then popping k (O(n log n)) instead of a size-k heap (O(n log k))",
      "Comparing complex objects without a tuple key, causing comparison errors on ties",
      "Trying to search or update an arbitrary element efficiently (not supported)",
      "Building with n pushes (O(n log n)) instead of heapify (O(n))",
      "Mixing up which heap holds which half in the two-heap median trick",
    ],
    template: {
      language: "python",
      code: "import heapq\n\ndef k_largest(nums, k):\n    # Keep a min-heap of size k; its root is the k-th largest\n    heap = []\n    for x in nums:\n        heapq.heappush(heap, x)\n        if len(heap) > k:\n            heapq.heappop(heap)      # drop the smallest\n    return heap[0]                   # k-th largest\n\n\ndef merge_k_lists(lists):\n    heap = []\n    for i, node in enumerate(lists):\n        if node:\n            heapq.heappush(heap, (node.val, i, node))\n    dummy = tail = ListNode()\n    while heap:\n        val, i, node = heapq.heappop(heap)\n        tail.next = node\n        tail = node\n        if node.next:\n            heapq.heappush(heap, (node.next.val, i, node.next))\n    return dummy.next",
    },
    observations: [
      "For k-th largest, keep a min-heap of size k; its root is the answer",
      "heapq is a min-heap; push -x or (-key, item) to act as a max-heap",
      "heapify is O(n), strictly better than n separate O(log n) pushes",
      "Add a tiebreaker index to the tuple so heapq never compares unorderable payloads",
      "Streaming median = a max-heap of the lower half + a min-heap of the upper half",
    ],
    videos: [
      { title: "NeetCode Roadmap - Heap / Priority Queue", url: "https://neetcode.io/roadmap", source: "NeetCode" },
    ],
    articles: [
      { title: "Heap Data Structure", url: "https://www.geeksforgeeks.org/heap-data-structure/", source: "GeeksforGeeks" },
    ],
  },

  "trie": {
    id: "trie",
    name: "Trie",
    summary: "A prefix tree storing strings by shared prefixes for fast insert and prefix lookup.",
    description:
      "A trie (prefix tree) stores a set of strings as a tree of characters, where each path from the root spells a prefix and shared prefixes share nodes. Insert and search for a word of length L are O(L), independent of how many words are stored, which makes it ideal for prefix queries and autocomplete.\n\nEach node has child links (a map or fixed array over the alphabet) and a flag marking the end of a word. Tries excel at 'starts with' queries, word dictionaries with wildcard search, and as the structure behind word-search-on-a-grid and maximum-XOR (a binary trie over bits).\n\nThe trade-off is memory: many nodes with sparse children. Using a dict of children per node keeps it flexible; a fixed 26-slot array is faster for lowercase-only alphabets.",
    recognition: [
      "Many words with shared prefixes and prefix/'startsWith' queries",
      "Autocomplete or dictionary lookups",
      "Wildcard or pattern search within a set of words",
      "Word search on a grid against a dictionary",
      "Maximum XOR pair (binary trie over bits)",
    ],
    whenToUse: [
      "Prefix queries and autocomplete",
      "Storing a dictionary for repeated membership/prefix checks",
      "Wildcard matching (e.g. '.' matches any char) over a word set",
      "Maximum/minimum XOR using a bit trie",
    ],
    whenNotToUse: [
      "You only need exact membership (a hash set is simpler and lighter)",
      "Strings are few or very long with little shared prefix (memory waste)",
      "No prefix or structured-key queries are needed",
    ],
    complexity: [
      { operation: "Insert word", time: "O(L)", space: "O(L)", note: "L = word length, new nodes" },
      { operation: "Search word / prefix", time: "O(L)", space: "O(1)", note: "walk down L nodes" },
      { operation: "Space for all words", time: "—", space: "O(total chars)", note: "shared prefixes save space" },
    ],
    commonMistakes: [
      "Forgetting the is_end flag, so prefixes get mistaken for complete words",
      "Confusing 'search whole word' with 'startsWith prefix' logic",
      "Not handling the empty string or missing-child case",
      "Using a 26-array when the alphabet is larger than assumed",
      "Wildcard search without recursing over all children on a '.'",
      "Memory blowup from storing long, non-overlapping strings in a trie",
    ],
    template: {
      language: "python",
      code: "class TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.is_end = False\n\n\nclass Trie:\n    def __init__(self):\n        self.root = TrieNode()\n\n    def insert(self, word):\n        node = self.root\n        for c in word:\n            node = node.children.setdefault(c, TrieNode())\n        node.is_end = True\n\n    def search(self, word):\n        node = self._find(word)\n        return node is not None and node.is_end\n\n    def starts_with(self, prefix):\n        return self._find(prefix) is not None\n\n    def _find(self, s):\n        node = self.root\n        for c in s:\n            if c not in node.children:\n                return None\n            node = node.children[c]\n        return node",
    },
    observations: [
      "Insert/search cost depends on word length L, not on the number of stored words",
      "The is_end flag is what distinguishes a stored word from a mere prefix",
      "setdefault (or defaultdict) keeps insertion concise",
      "For wildcard '.', recurse into every child at that position",
      "A binary trie over the bits of numbers solves maximum-XOR-pair in O(n * bits)",
    ],
    videos: [
      { title: "NeetCode Roadmap - Tries", url: "https://neetcode.io/roadmap", source: "NeetCode" },
    ],
    articles: [
      { title: "Trie Data Structure", url: "https://www.geeksforgeeks.org/trie-insert-and-search/", source: "GeeksforGeeks" },
    ],
  },

  "backtracking": {
    id: "backtracking",
    name: "Backtracking",
    summary: "Systematic DFS over choices that builds candidates incrementally and undoes them to explore alternatives.",
    description:
      "Backtracking explores all candidate solutions by making a choice, recursing, and then undoing the choice ('backtrack') to try the next option. It is depth-first search over a decision tree and is the standard way to generate permutations, combinations, subsets, and to solve constraint puzzles like N-Queens or Sudoku.\n\nThe skeleton is always the same: a base case that records a complete candidate, a loop over the available choices, and a make-choice / recurse / undo-choice sequence. Pruning — cutting off branches that cannot lead to a valid solution — is what turns an exponential search into something that finishes in time.\n\nBecause the search space is often exponential, backtracking is for small n or for problems where strong pruning keeps the explored tree manageable.",
    recognition: [
      "You must enumerate all subsets, permutations, or combinations",
      "Constraint-satisfaction puzzles (N-Queens, Sudoku, word search)",
      "'Find all solutions' or 'count all ways' with a feasibility constraint",
      "Small n (often <= ~20) so exponential search is acceptable",
      "Each step is a choice from a set, and bad choices can be pruned",
    ],
    whenToUse: [
      "Generating all subsets/permutations/combinations",
      "Solving puzzles with constraints and pruning",
      "Partitioning problems (palindrome partitioning, k-equal-sum subsets)",
      "Path-finding that must explore all routes",
    ],
    whenNotToUse: [
      "n is large and there is overlapping structure (use DP instead)",
      "Only one optimal value is needed and a greedy/DP exists",
      "The decision tree has no effective pruning (pure brute force is too slow)",
    ],
    complexity: [
      { operation: "All subsets", time: "O(n * 2^n)", space: "O(n)", note: "2^n subsets, O(n) to copy each" },
      { operation: "All permutations", time: "O(n * n!)", space: "O(n)", note: "n! orderings" },
      { operation: "Combinations C(n,k)", time: "O(k * C(n,k))", space: "O(k)", note: "prune by start index" },
      { operation: "N-Queens", time: "O(n!)", space: "O(n)", note: "heavy pruning by column/diagonal" },
    ],
    commonMistakes: [
      "Forgetting to undo the choice after recursing, corrupting later branches",
      "Appending a reference to the running path instead of a copy at the base case",
      "Not advancing a start index, producing duplicate combinations",
      "Missing duplicate-skipping on sorted input, yielding repeated results",
      "Weak or missing pruning, leading to timeouts",
      "Mutating shared state that is not restored on backtrack",
    ],
    template: {
      language: "python",
      code: "def subsets(nums):\n    res = []\n    path = []\n    def backtrack(start):\n        res.append(path[:])            # record a copy of the current subset\n        for i in range(start, len(nums)):\n            path.append(nums[i])       # choose\n            backtrack(i + 1)           # explore\n            path.pop()                 # un-choose (backtrack)\n    backtrack(0)\n    return res\n\n\ndef permutations(nums):\n    res = []\n    used = [False] * len(nums)\n    path = []\n    def backtrack():\n        if len(path) == len(nums):\n            res.append(path[:])\n            return\n        for i in range(len(nums)):\n            if used[i]:\n                continue\n            used[i] = True\n            path.append(nums[i])\n            backtrack()\n            path.pop()\n            used[i] = False\n    backtrack()\n    return res",
    },
    observations: [
      "Always append a copy (path[:]) at the base case; the path list keeps mutating",
      "A start index prevents reusing earlier elements and avoids duplicate combinations",
      "Sort first, then skip nums[i] == nums[i-1] at the same depth to dedupe results",
      "Pruning (rejecting impossible branches early) is what makes backtracking fast enough",
      "Choose / recurse / un-choose is the invariant skeleton of every backtracking solution",
    ],
    videos: [
      { title: "NeetCode Roadmap - Backtracking", url: "https://neetcode.io/roadmap", source: "NeetCode" },
    ],
    articles: [
      { title: "Introduction to Backtracking", url: "https://www.geeksforgeeks.org/introduction-to-backtracking-2/", source: "GeeksforGeeks" },
    ],
  },

  "graph-representation": {
    id: "graph-representation",
    name: "Graph Representation",
    summary: "How you store vertices and edges — adjacency list, matrix, or edge list — drives every graph algorithm.",
    description:
      "Before running any graph algorithm you must store the graph. The adjacency list (a map or array of neighbor lists) is the default: it uses O(V + E) space and lets you iterate a vertex's neighbors efficiently. An adjacency matrix is a V-by-V grid giving O(1) edge lookups but O(V^2) space — good for dense graphs or constant-time edge tests. An edge list is just a list of (u, v, w) triples, handy for Kruskal and Bellman-Ford.\n\nYou also decide directed vs undirected (add both directions for undirected), weighted vs unweighted, and whether to track in-degrees (needed for topological sort). Many grid problems are graphs in disguise where neighbors are the 4 or 8 adjacent cells.\n\nChoosing the right representation up front avoids both TLE (matrix scans on sparse graphs) and MLE (matrix space on huge V).",
    recognition: [
      "The problem describes nodes and connections (roads, prerequisites, friendships)",
      "A grid where cells connect to adjacent cells",
      "You will run DFS/BFS/Dijkstra/topological sort and must store edges first",
      "Inputs given as edge pairs or an adjacency description",
      "You need neighbor iteration or fast edge-existence checks",
    ],
    whenToUse: [
      "Adjacency list for sparse graphs and neighbor iteration (the usual choice)",
      "Adjacency matrix for dense graphs or O(1) edge lookups",
      "Edge list for Kruskal's MST or Bellman-Ford",
      "Grid-as-graph with directional deltas for neighbors",
    ],
    whenNotToUse: [
      "Adjacency matrix when V is large and the graph is sparse (O(V^2) memory)",
      "Adjacency list when you constantly test arbitrary edge existence (matrix is O(1))",
      "Building a heavy structure for a one-off traversal you could do on the fly",
    ],
    complexity: [
      { operation: "Adjacency list build", time: "O(V + E)", space: "O(V + E)", note: "default representation" },
      { operation: "Adjacency matrix build", time: "O(V^2)", space: "O(V^2)", note: "dense / fast edge test" },
      { operation: "Edge existence check (list)", time: "O(deg)", space: "O(1)", note: "scan neighbors" },
      { operation: "Edge existence check (matrix)", time: "O(1)", space: "O(1)", note: "direct index" },
    ],
    commonMistakes: [
      "Adding only one direction for an undirected edge",
      "Using an adjacency matrix for a huge sparse graph (memory blowup)",
      "Forgetting to track in-degrees when topological sort needs them",
      "Off-by-one with 1-indexed vs 0-indexed vertices",
      "Not handling self-loops or duplicate/parallel edges",
      "Wrong neighbor deltas (4- vs 8-directional) in grid problems",
    ],
    template: {
      language: "python",
      code: "from collections import defaultdict\n\ndef build_adjacency_list(n, edges, directed=False):\n    adj = defaultdict(list)\n    for u, v in edges:\n        adj[u].append(v)\n        if not directed:\n            adj[v].append(u)     # undirected: both directions\n    return adj\n\n\n# Grid as a graph: neighbors of (r, c)\nDIRS = [(-1, 0), (1, 0), (0, -1), (0, 1)]   # 4-directional\n\ndef neighbors(r, c, rows, cols):\n    for dr, dc in DIRS:\n        nr, nc = r + dr, c + dc\n        if 0 <= nr < rows and 0 <= nc < cols:\n            yield nr, nc",
    },
    observations: [
      "Adjacency list (O(V+E)) is the right default; reach for a matrix only when dense or you need O(1) edge tests",
      "Undirected edges must be added in both directions",
      "Grids are implicit graphs; a DIRS list of deltas cleanly generates neighbors",
      "Edge lists pair naturally with Kruskal (sort edges) and Bellman-Ford (relax edges)",
      "Track in-degree while building if you plan to topologically sort",
    ],
    videos: [
      { title: "NeetCode Roadmap - Graphs", url: "https://neetcode.io/roadmap", source: "NeetCode" },
    ],
    articles: [
      { title: "Graph and its Representations", url: "https://www.geeksforgeeks.org/graph-and-its-representations/", source: "GeeksforGeeks" },
    ],
  },

  "dfs": {
    id: "dfs",
    name: "DFS",
    summary: "Depth-first search dives as deep as possible before backtracking — the workhorse for connectivity and structure.",
    description:
      "Depth-first search explores a graph by going as deep as possible along each branch before backtracking, using either recursion (implicit stack) or an explicit stack. A visited set prevents revisiting nodes and infinite loops on cyclic graphs. Total cost is O(V + E).\n\nDFS is the natural tool for connectivity questions: counting connected components, flood fill, detecting cycles, and exploring every reachable cell in a grid. Its recursive form makes tree and grid problems extremely concise. Postorder DFS underlies topological sort and many 'process children first' tasks.\n\nThe main risks are forgetting the visited set (infinite loops), and recursion depth overflowing the stack on large or path-like graphs, where an iterative DFS or BFS is safer.",
    recognition: [
      "Explore all nodes reachable from a start; connectivity questions",
      "Counting connected components / islands",
      "Flood fill or region coloring on a grid",
      "Cycle detection in directed or undirected graphs",
      "Path existence or enumerating paths",
    ],
    whenToUse: [
      "Counting components or flood-filling regions",
      "Cycle detection (with recursion-stack/color marking for directed graphs)",
      "Exploring or marking entire reachable areas",
      "Postorder needs, e.g. building a topological order",
    ],
    whenNotToUse: [
      "You need the shortest path in an unweighted graph (use BFS)",
      "Recursion depth could overflow and you have not switched to iterative",
      "You need level-by-level processing",
    ],
    complexity: [
      { operation: "Traverse graph", time: "O(V + E)", space: "O(V)", note: "visited set + stack" },
      { operation: "Grid flood fill", time: "O(rows*cols)", space: "O(rows*cols)", note: "each cell once" },
      { operation: "Cycle detection (directed)", time: "O(V + E)", space: "O(V)", note: "recursion-stack coloring" },
    ],
    commonMistakes: [
      "Forgetting the visited set, causing infinite loops on cycles",
      "Marking visited too late, allowing a node to be queued/recursed multiple times",
      "Stack overflow on deep recursion (large grids or path graphs)",
      "For directed cycle detection, not distinguishing 'in current path' from 'fully done'",
      "Mutating the grid as a visited marker but failing to restore it when needed",
      "Wrong neighbor deltas or missing bounds checks on grids",
    ],
    template: {
      language: "python",
      code: "def count_islands(grid):\n    if not grid:\n        return 0\n    rows, cols = len(grid), len(grid[0])\n    seen = set()\n    def dfs(r, c):\n        if (r < 0 or r >= rows or c < 0 or c >= cols\n                or grid[r][c] == '0' or (r, c) in seen):\n            return\n        seen.add((r, c))\n        dfs(r + 1, c); dfs(r - 1, c)\n        dfs(r, c + 1); dfs(r, c - 1)\n    count = 0\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == '1' and (r, c) not in seen:\n                dfs(r, c)\n                count += 1\n    return count\n\n\ndef dfs_iterative(adj, start):\n    seen, stack = set(), [start]\n    while stack:\n        node = stack.pop()\n        if node in seen:\n            continue\n        seen.add(node)\n        for nxt in adj[node]:\n            if nxt not in seen:\n                stack.append(nxt)\n    return seen",
    },
    observations: [
      "A visited set is mandatory on graphs with cycles; trees can skip it",
      "Each connected component is found by one DFS launched from an unvisited node",
      "Directed cycle detection uses three states (unvisited / in-stack / done), not a plain visited set",
      "Switch to iterative DFS or BFS when recursion depth could exceed the stack limit",
      "DFS gives reachability, not shortest distance — use BFS for the latter",
    ],
    videos: [
      { title: "NeetCode Roadmap - Graphs / DFS", url: "https://neetcode.io/roadmap", source: "NeetCode" },
    ],
    articles: [
      { title: "Depth First Search (DFS)", url: "https://www.geeksforgeeks.org/depth-first-search-or-dfs-for-a-graph/", source: "GeeksforGeeks" },
    ],
  },

  "bfs": {
    id: "bfs",
    name: "BFS",
    summary: "Breadth-first search expands outward layer by layer — the shortest path tool for unweighted graphs.",
    description:
      "Breadth-first search visits nodes in order of distance from the start, using a FIFO queue: it fully explores all nodes at distance d before any at distance d+1. On an unweighted graph this means the first time you reach a node, you have reached it by a shortest path. Cost is O(V + E).\n\nBFS is the answer for shortest path / minimum steps in unweighted graphs and grids, level-order processing, and problems framed as 'minimum number of moves'. Multi-source BFS seeds several starts at distance 0 (rotting oranges, nearest exit). A 0-1 BFS with a deque handles edges of weight 0 or 1.\n\nThe critical correctness point is marking nodes visited when you enqueue them, not when you dequeue, so the same node is never queued twice — otherwise the queue and the runtime blow up.",
    recognition: [
      "Shortest path or minimum number of steps in an unweighted graph/grid",
      "'Fewest moves' / 'minimum transformations' phrasing",
      "Level-by-level processing or distance layers",
      "Multiple simultaneous starting points (multi-source)",
      "Spreading/infection simulations over a grid",
    ],
    whenToUse: [
      "Shortest path in unweighted graphs and grids",
      "Minimum steps / word ladder / open-the-lock style problems",
      "Multi-source spreading (rotting oranges, nearest gate)",
      "Level-order traversal needing distance from the source",
    ],
    whenNotToUse: [
      "Edges have varied positive weights (use Dijkstra)",
      "You only need reachability and depth is fine (DFS is lighter to write)",
      "The graph is huge and you need memory beyond the frontier",
    ],
    complexity: [
      { operation: "Shortest path (unweighted)", time: "O(V + E)", space: "O(V)", note: "queue + visited" },
      { operation: "Grid BFS", time: "O(rows*cols)", space: "O(rows*cols)", note: "each cell once" },
      { operation: "Multi-source BFS", time: "O(V + E)", space: "O(V)", note: "seed all sources at dist 0" },
      { operation: "0-1 BFS (deque)", time: "O(V + E)", space: "O(V)", note: "weight-0 to front, weight-1 to back" },
    ],
    commonMistakes: [
      "Marking visited on dequeue instead of enqueue, queuing nodes multiple times",
      "Using a list as a queue with pop(0) (O(n)) instead of deque.popleft()",
      "Tracking distance incorrectly (increment per level, not per node)",
      "Applying BFS to a weighted graph expecting shortest path (it is wrong)",
      "Forgetting bounds/visited checks on grid neighbors",
      "Not handling the start == goal case",
    ],
    template: {
      language: "python",
      code: "from collections import deque\n\ndef shortest_path(adj, start, goal):\n    if start == goal:\n        return 0\n    seen = {start}\n    q = deque([(start, 0)])\n    while q:\n        node, dist = q.popleft()\n        for nxt in adj[node]:\n            if nxt == goal:\n                return dist + 1\n            if nxt not in seen:\n                seen.add(nxt)            # mark on enqueue\n                q.append((nxt, dist + 1))\n    return -1\n\n\ndef grid_bfs(grid, sources):\n    rows, cols = len(grid), len(grid[0])\n    q = deque((r, c, 0) for r, c in sources)\n    seen = set(sources)\n    dist = 0\n    while q:\n        r, c, d = q.popleft()\n        dist = max(dist, d)\n        for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):\n            nr, nc = r + dr, c + dc\n            if 0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in seen:\n                seen.add((nr, nc))\n                q.append((nr, nc, d + 1))\n    return dist",
    },
    observations: [
      "First arrival at a node in BFS is along a shortest unweighted path",
      "Mark visited on enqueue, never on dequeue, to avoid duplicate queue entries",
      "Multi-source BFS = push all sources at distance 0; the frontier expands uniformly",
      "0-1 BFS uses a deque (push front for weight 0, back for weight 1) to stay O(V+E)",
      "Use deque.popleft(), not list.pop(0), or you silently get O(n) per dequeue",
    ],
    videos: [
      { title: "NeetCode Roadmap - Graphs / BFS", url: "https://neetcode.io/roadmap", source: "NeetCode" },
    ],
    articles: [
      { title: "Breadth First Search (BFS)", url: "https://www.geeksforgeeks.org/breadth-first-search-or-bfs-for-a-graph/", source: "GeeksforGeeks" },
    ],
  },

  "topological-sort": {
    id: "topological-sort",
    name: "Topological Sort",
    summary: "A linear ordering of a DAG's vertices so every edge points forward — the tool for dependency ordering.",
    description:
      "Topological sort orders the vertices of a directed acyclic graph (DAG) so that for every edge u -> v, u comes before v. It answers 'in what order can I do tasks given prerequisites?' and only exists when the graph has no cycle.\n\nTwo standard methods: Kahn's algorithm (BFS) repeatedly removes vertices with in-degree 0 and decrements their neighbors; if it cannot remove all vertices, a cycle exists. The DFS method pushes each vertex onto a stack after fully exploring its descendants (postorder), then reverses. Both run in O(V + E).\n\nKahn's algorithm doubles as cycle detection (course schedule feasibility) and naturally yields the lexicographically controllable order if you use a heap for the zero-in-degree set.",
    recognition: [
      "Tasks with prerequisites / dependencies (course schedule, build order)",
      "You must order items so all dependencies come first",
      "The graph is directed and you need to detect whether it is acyclic",
      "'Is it possible to finish all?' feasibility questions",
      "Compiling/scheduling where edges mean 'must come before'",
    ],
    whenToUse: [
      "Ordering tasks by dependency",
      "Detecting cycles in a directed graph (if no full order, there is a cycle)",
      "Computing DP over a DAG in dependency order",
      "Resolving build/compile or course prerequisites",
    ],
    whenNotToUse: [
      "The graph is undirected or has cycles (no valid topological order)",
      "Order does not matter, only reachability (use plain DFS/BFS)",
      "Edges have weights you must minimize (that is shortest path, not topo sort)",
    ],
    complexity: [
      { operation: "Kahn's algorithm (BFS)", time: "O(V + E)", space: "O(V)", note: "in-degree queue" },
      { operation: "DFS-based topo sort", time: "O(V + E)", space: "O(V)", note: "postorder + reverse" },
      { operation: "Cycle detection via topo", time: "O(V + E)", space: "O(V)", note: "fewer than V ordered => cycle" },
    ],
    commonMistakes: [
      "Running it on a graph with a cycle and not detecting the failure",
      "Building in-degrees incorrectly (wrong edge direction)",
      "Forgetting to reverse the postorder in the DFS method",
      "Decrementing in-degree but not enqueuing when it hits zero",
      "Confusing prerequisite direction (edge a->b means a before b)",
      "Assuming a unique ordering when many valid orders exist",
    ],
    template: {
      language: "python",
      code: "from collections import deque, defaultdict\n\ndef topo_sort(n, edges):\n    # edges: list of (u, v) meaning u must come before v\n    adj = defaultdict(list)\n    indeg = [0] * n\n    for u, v in edges:\n        adj[u].append(v)\n        indeg[v] += 1\n\n    q = deque(i for i in range(n) if indeg[i] == 0)\n    order = []\n    while q:\n        u = q.popleft()\n        order.append(u)\n        for v in adj[u]:\n            indeg[v] -= 1\n            if indeg[v] == 0:\n                q.append(v)\n\n    if len(order) != n:\n        return []          # a cycle exists; no valid ordering\n    return order",
    },
    observations: [
      "If Kahn's algorithm orders fewer than V vertices, the graph has a cycle",
      "Edge u->v means u is a prerequisite of v; v's in-degree counts its dependencies",
      "Use a heap instead of a queue to get the lexicographically smallest valid order",
      "DFS topo sort is just reversed postorder finishing times",
      "A DAG can have many valid topological orders; the algorithm returns one",
    ],
    videos: [
      { title: "Course Schedule / Topological Sort - NeetCode", url: "https://www.youtube.com/@NeetCode", source: "NeetCode" },
    ],
    articles: [
      { title: "Topological Sorting", url: "https://www.geeksforgeeks.org/topological-sorting/", source: "GeeksforGeeks" },
    ],
  },

  "union-find": {
    id: "union-find",
    name: "Union Find (Disjoint Set)",
    summary: "A structure that tracks element groupings with near-O(1) union and find via path compression and union by rank.",
    description:
      "Union-Find (Disjoint Set Union) maintains a partition of elements into disjoint sets, supporting two operations: find (which set is x in?) and union (merge the sets of x and y). With path compression and union by rank/size, both run in near-constant amortized time, formally the inverse Ackermann function alpha(n).\n\nIt is the cleanest tool for dynamic connectivity: determining whether two nodes are connected, counting connected components as edges are added, detecting cycles in an undirected graph, and as the engine of Kruskal's MST. Unlike DFS/BFS, it handles edges arriving online and answers connectivity queries incrementally.\n\nThe two optimizations are essential: path compression flattens the tree during find, and union by rank/size keeps trees shallow. Without them, find can degrade to O(n).",
    recognition: [
      "Dynamic connectivity: are x and y in the same group as edges are added?",
      "Counting connected components incrementally",
      "Detecting a cycle in an undirected graph (union of an already-connected pair)",
      "Kruskal's minimum spanning tree",
      "Grouping/merging equivalences (accounts merge, friend circles)",
    ],
    whenToUse: [
      "Online connectivity queries as unions happen",
      "Counting components after a series of merges",
      "Cycle detection in undirected graphs",
      "Kruskal's MST edge selection",
      "Equivalence-class problems (string/email merging)",
    ],
    whenNotToUse: [
      "You need to split/disconnect sets (union-find does not support deletion well)",
      "Shortest paths or weighted distances (use graph search)",
      "A single static traversal where DFS/BFS components suffice",
    ],
    complexity: [
      { operation: "Find (with compression)", time: "O(alpha(n))", space: "O(n)", note: "near O(1) amortized" },
      { operation: "Union (by rank/size)", time: "O(alpha(n))", space: "O(1)", note: "near O(1) amortized" },
      { operation: "m operations on n elements", time: "O(m * alpha(n))", space: "O(n)", note: "effectively linear" },
    ],
    commonMistakes: [
      "Skipping path compression or union by rank, letting find degrade toward O(n)",
      "Unioning roots without comparing rank/size, building tall trees",
      "Forgetting to update the component count on a successful union",
      "Comparing parents directly instead of comparing find(x) and find(y) (roots)",
      "Off-by-one when mapping problem entities to integer ids",
      "Assuming it supports efficient un-union / deletion",
    ],
    template: {
      language: "python",
      code: "class DSU:\n    def __init__(self, n):\n        self.parent = list(range(n))\n        self.rank = [0] * n\n        self.count = n            # number of disjoint sets\n\n    def find(self, x):\n        while self.parent[x] != x:\n            self.parent[x] = self.parent[self.parent[x]]   # path compression\n            x = self.parent[x]\n        return x\n\n    def union(self, a, b):\n        ra, rb = self.find(a), self.find(b)\n        if ra == rb:\n            return False          # already connected (cycle if undirected)\n        if self.rank[ra] < self.rank[rb]:\n            ra, rb = rb, ra\n        self.parent[rb] = ra\n        if self.rank[ra] == self.rank[rb]:\n            self.rank[ra] += 1\n        self.count -= 1\n        return True",
    },
    observations: [
      "Path compression plus union by rank/size gives the near-constant alpha(n) bound",
      "A union returning False means the two were already connected — a cycle in an undirected graph",
      "Track a count field and decrement on each successful union to get live component counts",
      "Always compare roots via find(x) and find(y), never raw parent pointers",
      "Kruskal's MST is just sort edges + union the endpoints if they are in different sets",
    ],
    videos: [
      { title: "Union Find / Disjoint Set - NeetCode", url: "https://www.youtube.com/@NeetCode", source: "NeetCode" },
    ],
    articles: [
      { title: "Disjoint Set (Union-Find)", url: "https://cp-algorithms.com/data_structures/disjoint_set_union.html", source: "CP-Algorithms" },
    ],
  },

  "shortest-path": {
    id: "shortest-path",
    name: "Shortest Path",
    summary: "Finding minimum-cost routes — BFS for unweighted, Dijkstra for non-negative weights, Bellman-Ford for negatives.",
    description:
      "Shortest-path algorithms find minimum-cost routes between vertices, and the right one depends on the edge weights. For unweighted graphs, BFS gives shortest paths in O(V + E). For non-negative weights, Dijkstra's algorithm with a min-heap runs in O((V + E) log V), greedily settling the closest unsettled vertex. For graphs with negative edges, Bellman-Ford relaxes all edges V-1 times in O(V*E) and can also detect negative cycles. Floyd-Warshall computes all-pairs shortest paths in O(V^3).\n\nDijkstra's correctness relies on non-negative weights: once a vertex is popped with its final distance, no later path can improve it. Negative edges break that guarantee, which is why you switch to Bellman-Ford.\n\nThe common pattern is relaxation: if dist[u] + w(u,v) < dist[v], update dist[v]. Where the algorithms differ is the order in which they relax edges.",
    recognition: [
      "Minimum cost / time / distance between nodes with weighted edges",
      "Non-negative weights -> Dijkstra; unweighted -> BFS",
      "Possible negative edges or negative-cycle detection -> Bellman-Ford",
      "All-pairs shortest distances on a small graph -> Floyd-Warshall",
      "Grid with movement costs (e.g. effort/time per step)",
    ],
    whenToUse: [
      "Dijkstra for single-source shortest path with non-negative weights",
      "BFS when all edges have equal (unit) weight",
      "Bellman-Ford when edges may be negative or to detect negative cycles",
      "Floyd-Warshall for all-pairs on small (V <= ~400) graphs",
    ],
    whenNotToUse: [
      "Dijkstra on graphs with negative edges (it can produce wrong answers)",
      "Floyd-Warshall on large V (O(V^3) is too slow)",
      "Bellman-Ford when Dijkstra applies (much slower for non-negative weights)",
    ],
    complexity: [
      { operation: "BFS (unweighted)", time: "O(V + E)", space: "O(V)", note: "unit weights only" },
      { operation: "Dijkstra (binary heap)", time: "O((V + E) log V)", space: "O(V)", note: "non-negative weights" },
      { operation: "Bellman-Ford", time: "O(V*E)", space: "O(V)", note: "handles negatives, detects neg cycle" },
      { operation: "Floyd-Warshall", time: "O(V^3)", space: "O(V^2)", note: "all-pairs, small graphs" },
    ],
    commonMistakes: [
      "Running Dijkstra on a graph with negative edges",
      "Not skipping stale heap entries (process only if popped dist == best dist)",
      "Forgetting Dijkstra needs lazy deletion or a settled set, not re-relaxing finalized nodes",
      "Initializing distances wrong (source 0, others infinity)",
      "Using Floyd-Warshall when V is large (O(V^3) TLE)",
      "Bellman-Ford with too few relaxation rounds (need V-1)",
    ],
    template: {
      language: "python",
      code: "import heapq\n\ndef dijkstra(adj, src, n):\n    # adj[u] = list of (v, weight); non-negative weights\n    dist = [float('inf')] * n\n    dist[src] = 0\n    pq = [(0, src)]                    # (distance, node)\n    while pq:\n        d, u = heapq.heappop(pq)\n        if d > dist[u]:\n            continue                   # stale entry, skip\n        for v, w in adj[u]:\n            nd = d + w\n            if nd < dist[v]:           # relaxation\n                dist[v] = nd\n                heapq.heappush(pq, (nd, v))\n    return dist\n\n\ndef bellman_ford(edges, src, n):\n    dist = [float('inf')] * n\n    dist[src] = 0\n    for _ in range(n - 1):\n        for u, v, w in edges:\n            if dist[u] + w < dist[v]:\n                dist[v] = dist[u] + w\n    # extra pass detects a negative cycle\n    for u, v, w in edges:\n        if dist[u] + w < dist[v]:\n            return None                # negative cycle reachable\n    return dist",
    },
    observations: [
      "Skip stale heap entries with 'if d > dist[u]: continue' to keep Dijkstra correct and fast",
      "Dijkstra is greedy and correct only because non-negative weights make settled distances final",
      "Bellman-Ford's V-th relaxation pass detecting an update means a negative cycle exists",
      "BFS is just Dijkstra when every edge has weight 1 — prefer it for unit weights",
      "Floyd-Warshall is three nested loops with k (the intermediate vertex) as the outermost",
    ],
    videos: [
      { title: "Dijkstra's Shortest Path - NeetCode", url: "https://www.youtube.com/@NeetCode", source: "NeetCode" },
    ],
    articles: [
      { title: "Dijkstra's Algorithm", url: "https://cp-algorithms.com/graph/dijkstra.html", source: "CP-Algorithms" },
    ],
  },

  "mst": {
    id: "mst",
    name: "Minimum Spanning Tree",
    summary: "The cheapest set of edges connecting all vertices with no cycle — built by Kruskal's or Prim's algorithm.",
    description:
      "A minimum spanning tree (MST) of a connected, weighted, undirected graph is a subset of edges that connects every vertex with the minimum possible total weight and no cycles (exactly V-1 edges). Two greedy algorithms build it.\n\nKruskal's algorithm sorts all edges by weight and adds each edge if it joins two different components, using Union-Find to detect cycles; it runs in O(E log E). Prim's algorithm grows the tree from a start vertex, repeatedly adding the cheapest edge leaving the current tree via a min-heap, in O((V + E) log V). Kruskal's suits sparse, edge-list graphs; Prim's suits denser graphs or adjacency lists.\n\nBoth rely on the cut property: the lightest edge crossing any partition of vertices is safe to include in some MST.",
    recognition: [
      "Connect all nodes at minimum total edge cost",
      "'Minimum cost to connect all points/cities/computers'",
      "Undirected weighted graph where you need a spanning structure, not paths",
      "You can phrase it as choosing V-1 edges to minimize weight without cycles",
      "Network design / clustering by removing the largest MST edges",
    ],
    whenToUse: [
      "Kruskal's for sparse graphs given as an edge list",
      "Prim's for dense graphs or adjacency-list input",
      "Minimum cost to connect all components",
      "Clustering by cutting the heaviest MST edges",
    ],
    whenNotToUse: [
      "You need shortest paths between specific nodes (MST is not shortest paths)",
      "The graph is directed (MST is defined for undirected graphs)",
      "Only a subset of vertices must be connected (that is a Steiner tree, NP-hard)",
    ],
    complexity: [
      { operation: "Kruskal's (sort + DSU)", time: "O(E log E)", space: "O(V)", note: "edge list + union-find" },
      { operation: "Prim's (binary heap)", time: "O((V + E) log V)", space: "O(V)", note: "adjacency list" },
      { operation: "Prim's (dense, array)", time: "O(V^2)", space: "O(V)", note: "good when E ~ V^2" },
    ],
    commonMistakes: [
      "Forgetting MST is only for undirected graphs",
      "In Kruskal's, adding an edge without the union-find cycle check",
      "Stopping before V-1 edges or adding too many",
      "In Prim's, not skipping vertices already in the tree (stale heap entries)",
      "Confusing MST with shortest-path trees (they differ)",
      "Assuming a unique MST when equal weights allow several",
    ],
    template: {
      language: "python",
      code: "def kruskal(n, edges):\n    # edges: list of (weight, u, v); returns total MST weight\n    edges.sort()                      # by weight ascending\n    dsu = DSU(n)                      # see Union-Find template\n    total = 0\n    used = 0\n    for w, u, v in edges:\n        if dsu.union(u, v):           # joins two components -> safe edge\n            total += w\n            used += 1\n            if used == n - 1:\n                break\n    return total if used == n - 1 else -1   # -1 if not connected\n\n\nimport heapq\n\ndef prim(adj, n):\n    # adj[u] = list of (weight, v)\n    visited = [False] * n\n    pq = [(0, 0)]                     # (weight, start vertex)\n    total = 0\n    while pq:\n        w, u = heapq.heappop(pq)\n        if visited[u]:\n            continue\n        visited[u] = True\n        total += w\n        for nw, v in adj[u]:\n            if not visited[v]:\n                heapq.heappush(pq, (nw, v))\n    return total",
    },
    observations: [
      "An MST always has exactly V-1 edges; if you cannot reach that, the graph is disconnected",
      "Cut property: the minimum-weight edge crossing any cut is in some MST — the basis of both algorithms",
      "Kruskal's = sort edges + union-find; Prim's = grow a tree with a min-heap",
      "Choose Kruskal's for sparse/edge-list graphs, Prim's for dense/adjacency-list graphs",
      "Maximum spanning tree uses the same algorithms with reversed comparison",
    ],
    videos: [
      { title: "Min Cost to Connect Points (MST) - NeetCode", url: "https://www.youtube.com/@NeetCode", source: "NeetCode" },
    ],
    articles: [
      { title: "Minimum Spanning Tree (Kruskal & Prim)", url: "https://cp-algorithms.com/graph/mst_kruskal.html", source: "CP-Algorithms" },
    ],
  },

  "greedy": {
    id: "greedy",
    name: "Greedy",
    summary: "Make the locally optimal choice at each step, trusting it leads to a global optimum — when provably valid.",
    description:
      "A greedy algorithm builds a solution by always taking the choice that looks best right now, never reconsidering. When the problem has the greedy-choice property and optimal substructure, this local optimum is also the global optimum, and the solution is often a simple sort plus a single pass.\n\nThe hard part is not coding it but proving it is correct. Common proof techniques are the exchange argument (show any optimal solution can be transformed into the greedy one without getting worse) and the cut/stays-ahead argument. Classic correct greedies include interval scheduling (sort by end time), Huffman coding, and Dijkstra/Prim/Kruskal.\n\nGreedy fails when a locally optimal choice can paint you into a corner — for example, coin change with arbitrary denominations needs DP, not greedy. Always sanity-check with a small counterexample.",
    recognition: [
      "You can sort by some key and then make one sweeping decision per element",
      "Interval scheduling / activity selection (maximize non-overlapping)",
      "Choosing to maximize or minimize with an obvious 'best next' rule",
      "Problems with a clear exchange argument for local-to-global optimality",
      "Assigning resources to greedily satisfy as many constraints as possible",
    ],
    whenToUse: [
      "Interval scheduling: sort by end time, pick compatible intervals",
      "Jump-game reachability and similar furthest-reach problems",
      "Huffman coding and merge-cost minimization (heap-greedy)",
      "When you can prove the greedy-choice property holds",
    ],
    whenNotToUse: [
      "Local choices can block a better global solution (coin change with odd denominations)",
      "The problem needs to weigh future consequences (use DP)",
      "You cannot prove correctness and counterexamples exist",
    ],
    complexity: [
      { operation: "Sort then single pass", time: "O(n log n)", space: "O(1)", note: "sorting dominates" },
      { operation: "Heap-based greedy", time: "O(n log n)", space: "O(n)", note: "repeated extract-min" },
      { operation: "Linear greedy (no sort)", time: "O(n)", space: "O(1)", note: "one sweep with running state" },
    ],
    commonMistakes: [
      "Assuming greedy works without proving the greedy-choice property",
      "Sorting by the wrong key (e.g. start time instead of end time in scheduling)",
      "Not testing a small counterexample where greedy fails",
      "Confusing a greedy-solvable problem with one that needs DP",
      "Reconsidering past choices, which breaks the greedy structure or correctness",
      "Tie-breaking incorrectly when multiple choices look equally good",
    ],
    template: {
      language: "python",
      code: "def max_non_overlapping(intervals):\n    # Activity selection: maximize count of compatible intervals\n    intervals.sort(key=lambda iv: iv[1])   # sort by END time\n    count = 0\n    last_end = float('-inf')\n    for start, end in intervals:\n        if start >= last_end:              # compatible with chosen so far\n            count += 1\n            last_end = end\n    return count\n\n\ndef can_jump(nums):\n    # Greedy furthest-reach for jump game\n    reach = 0\n    for i, step in enumerate(nums):\n        if i > reach:\n            return False                   # cannot even arrive here\n        reach = max(reach, i + step)\n    return True",
    },
    observations: [
      "Interval scheduling: sorting by earliest END time (not start) is what makes greedy optimal",
      "Prove correctness with an exchange argument before trusting a greedy",
      "If a small counterexample breaks it, the problem likely needs DP",
      "Many greedies are 'sort, then one linear pass with running state'",
      "Greedy is often DP with the realization that you never need to look back",
    ],
    videos: [
      { title: "NeetCode Roadmap - Greedy", url: "https://neetcode.io/roadmap", source: "NeetCode" },
    ],
    articles: [
      { title: "Greedy Algorithms", url: "https://www.geeksforgeeks.org/greedy-algorithms/", source: "GeeksforGeeks" },
    ],
  },

  "intervals": {
    id: "intervals",
    name: "Intervals",
    summary: "Problems over [start, end] ranges, almost always solved by sorting then sweeping.",
    description:
      "Interval problems involve ranges with a start and end, and the unifying technique is to sort (by start or by end depending on the goal) and then sweep through them maintaining a small amount of state. Merging overlapping intervals, inserting an interval, counting overlaps, and finding the minimum meeting rooms are all variations of this.\n\nTo merge, sort by start and extend the current interval's end whenever the next interval overlaps. To find maximum concurrent overlaps (e.g. rooms needed), use a sweep line: process all start (+1) and end (-1) events in time order and track the running count, or use a min-heap of end times.\n\nThe recurring subtlety is the overlap condition and whether endpoints are inclusive or exclusive — get that boundary right and most interval problems fall out.",
    recognition: [
      "Input is a list of [start, end] pairs",
      "Merge overlapping ranges or insert a new range",
      "Count maximum simultaneous overlaps (meeting rooms, CPU intervals)",
      "Find free gaps or total covered length",
      "Detect whether any two intervals overlap",
    ],
    whenToUse: [
      "Merging or inserting intervals (sort by start)",
      "Counting maximum concurrency via a sweep line or min-heap of end times",
      "Removing the fewest intervals to make the rest non-overlapping (sort by end, greedy)",
      "Computing union length or finding gaps",
    ],
    whenNotToUse: [
      "Ranges are not comparable by a single ordering key",
      "The data is better modeled as a graph or set",
      "You need per-point updates over time (consider a difference array / segment tree)",
    ],
    complexity: [
      { operation: "Sort intervals", time: "O(n log n)", space: "O(n)", note: "dominant cost" },
      { operation: "Merge after sort", time: "O(n)", space: "O(n)", note: "single sweep" },
      { operation: "Meeting rooms (min-heap)", time: "O(n log n)", space: "O(n)", note: "heap of end times" },
      { operation: "Sweep line events", time: "O(n log n)", space: "O(n)", note: "sort 2n start/end events" },
    ],
    commonMistakes: [
      "Sorting by the wrong endpoint for the task (start vs end)",
      "Getting the overlap condition wrong (a.start <= b.end vs <)",
      "Inclusive vs exclusive endpoint confusion",
      "Forgetting to add the final in-progress interval when merging",
      "Not handling intervals that are fully contained in another",
      "Mishandling ties when a start and end coincide in a sweep line",
    ],
    template: {
      language: "python",
      code: "def merge(intervals):\n    intervals.sort(key=lambda iv: iv[0])    # sort by start\n    merged = []\n    for start, end in intervals:\n        if merged and start <= merged[-1][1]:\n            merged[-1][1] = max(merged[-1][1], end)   # overlap: extend\n        else:\n            merged.append([start, end])\n    return merged\n\n\nimport heapq\n\ndef min_meeting_rooms(intervals):\n    intervals.sort(key=lambda iv: iv[0])    # by start time\n    ends = []                               # min-heap of end times\n    for start, end in intervals:\n        if ends and ends[0] <= start:\n            heapq.heappop(ends)             # a room freed up\n        heapq.heappush(ends, end)\n    return len(ends)                        # peak concurrency",
    },
    observations: [
      "Sort by start to merge; sort by end for greedy non-overlap selection",
      "Meeting-rooms count = peak number of intervals overlapping at any instant",
      "A min-heap of end times tracks how many rooms are simultaneously in use",
      "Sweep line: +1 at each start, -1 at each end, in time order; the running max is the answer",
      "Always extend with max(end, next.end) — the next interval may end earlier",
    ],
    videos: [
      { title: "NeetCode Roadmap - Intervals", url: "https://neetcode.io/roadmap", source: "NeetCode" },
    ],
    articles: [
      { title: "Merge Overlapping Intervals", url: "https://www.geeksforgeeks.org/merging-intervals/", source: "GeeksforGeeks" },
    ],
  },

  "bit-manipulation": {
    id: "bit-manipulation",
    name: "Bit Manipulation",
    summary: "Operating on individual bits with AND, OR, XOR, and shifts for O(1) tricks and compact state.",
    description:
      "Bit manipulation treats integers as fixed arrays of bits and uses bitwise operators to test, set, clear, and toggle them in O(1). It enables elegant solutions: XOR cancels equal pairs (find the unique element), AND with (x-1) clears the lowest set bit (count bits), and a single integer can serve as a subset/bitmask for up to ~20-30 elements.\n\nKey identities worth memorizing: x & (x - 1) removes the lowest set bit; x & -x isolates it; x ^ x == 0 and x ^ 0 == x make XOR a parity/toggle tool; (x >> i) & 1 reads bit i. Bitmasks compress states for DP over subsets.\n\nThe main pitfalls are language-specific: signed shifts and fixed widths matter in C/Java, while Python integers are arbitrary precision (no overflow) but negative numbers behave as if infinitely sign-extended.",
    recognition: [
      "Find the element appearing an odd number of times (XOR everything)",
      "Counting set bits or manipulating individual bits",
      "Representing a subset of a small set as an integer bitmask",
      "Powers of two / single-bit checks",
      "Subset-enumeration DP where n <= ~20",
    ],
    whenToUse: [
      "XOR tricks: single number, missing number, swap without temp",
      "Bitmask to represent and iterate subsets (DP over subsets)",
      "Fast checks: power of two, parity, bit at position i",
      "Counting set bits (popcount) for distance/Hamming problems",
    ],
    whenNotToUse: [
      "The logic is clearer with plain arithmetic or a set",
      "Values exceed the bit width you can safely use (in fixed-width languages)",
      "n is too large for a 2^n bitmask",
    ],
    complexity: [
      { operation: "Single bitwise op", time: "O(1)", space: "O(1)", note: "AND/OR/XOR/shift" },
      { operation: "Count set bits", time: "O(set bits)", space: "O(1)", note: "x &= x-1 loop" },
      { operation: "Iterate all subsets of n", time: "O(2^n)", space: "O(1)", note: "mask from 0 to 2^n - 1" },
      { operation: "Iterate submasks of a mask", time: "O(3^n) total", space: "O(1)", note: "sub = (sub-1) & mask" },
    ],
    commonMistakes: [
      "Operator precedence: & and | bind looser than ==, so parenthesize",
      "Forgetting Python ints are unbounded and negatives sign-extend infinitely",
      "Off-by-one in bit positions (bit 0 is the least significant)",
      "Using arithmetic shift where logical was intended (matters in C/Java)",
      "Confusing 'set bit' (OR) with 'clear bit' (AND with complement)",
      "Mask overflow / wrong width assumptions in fixed-width languages",
    ],
    template: {
      language: "python",
      code: "def single_number(nums):\n    # Every element appears twice except one; XOR cancels pairs\n    result = 0\n    for x in nums:\n        result ^= x\n    return result\n\n\ndef count_bits(x):\n    # Brian Kernighan: clear lowest set bit each step\n    count = 0\n    while x:\n        x &= x - 1\n        count += 1\n    return count\n\n\n# Common one-liners (bit i is the least significant when i == 0)\n# test bit i:    (x >> i) & 1\n# set bit i:     x | (1 << i)\n# clear bit i:   x & ~(1 << i)\n# toggle bit i:  x ^ (1 << i)\n# lowest set bit: x & -x\n# is power of two: x > 0 and (x & (x - 1)) == 0",
    },
    observations: [
      "XOR of a value with itself is 0, which cancels duplicate pairs and isolates the unique element",
      "x & (x - 1) clears the lowest set bit; loop count gives popcount in O(set bits)",
      "x & -x isolates the lowest set bit (two's complement trick)",
      "A bitmask integer is a compact subset; iterate submasks with sub = (sub - 1) & mask",
      "Always parenthesize bitwise ops vs comparisons due to precedence",
    ],
    videos: [
      { title: "NeetCode Roadmap - Bit Manipulation", url: "https://neetcode.io/roadmap", source: "NeetCode" },
    ],
    articles: [
      { title: "Bitwise Algorithms", url: "https://www.geeksforgeeks.org/bitwise-algorithms/", source: "GeeksforGeeks" },
    ],
  },

  "dp": {
    id: "dp",
    name: "Dynamic Programming",
    summary: "Solve problems with overlapping subproblems by storing each subproblem's answer once.",
    description:
      "Dynamic programming solves problems that have optimal substructure (the answer is built from answers to subproblems) and overlapping subproblems (the same subproblem recurs). By caching each subproblem's result, DP turns exponential recursion into polynomial time.\n\nThere are two styles. Top-down (memoization) writes the natural recursion and adds a cache keyed by the state. Bottom-up (tabulation) fills a table from base cases upward, often allowing space reduction to one or two rows. The hardest and most important step is defining the state (what variables uniquely identify a subproblem) and the transition (how a state's answer combines smaller states).\n\nClassic templates: 1D DP (climbing stairs, house robber), grid DP (unique paths), knapsack (subset choices), and sequence DP (LIS, LCS, edit distance). Identify the state, write the recurrence, pin the base cases, then decide top-down vs bottom-up.",
    recognition: [
      "'Count the number of ways' or 'find the min/max cost' over choices",
      "A recursion exists but recomputes the same subproblems (overlap)",
      "Optimal substructure: the answer combines answers of smaller inputs",
      "Decisions at each step (take/skip, move right/down) with future consequences",
      "Brute force is exponential but the number of distinct states is polynomial",
    ],
    whenToUse: [
      "Optimization (min/max) or counting over sequential/structured choices",
      "Overlapping subproblems where memoization removes recomputation",
      "Knapsack, LIS, LCS, edit distance, partitioning, grid paths",
      "When greedy fails because choices have future trade-offs",
    ],
    whenNotToUse: [
      "Subproblems do not overlap (plain divide-and-conquer is enough)",
      "A provably correct greedy exists (simpler and faster)",
      "The state space is exponential and cannot be bounded",
    ],
    complexity: [
      { operation: "1D DP (e.g. house robber)", time: "O(n)", space: "O(1)", note: "keep last one or two states" },
      { operation: "2D DP (grid / LCS)", time: "O(n*m)", space: "O(min(n,m))", note: "rolling row reduces space" },
      { operation: "0/1 Knapsack", time: "O(n*W)", space: "O(W)", note: "pseudo-polynomial in capacity" },
      { operation: "Top-down memoization", time: "O(states * transition)", space: "O(states)", note: "recursion + cache" },
    ],
    commonMistakes: [
      "Choosing a state that does not capture all the information needed for the transition",
      "Wrong or missing base cases",
      "Iterating the table in an order where a needed subproblem is not yet computed",
      "In 0/1 knapsack, looping capacity ascending (allows reusing an item) instead of descending",
      "Off-by-one between sequence length and table indices",
      "Forgetting to memoize, leaving it exponential",
    ],
    template: {
      language: "python",
      code: "from functools import lru_cache\n\ndef rob(nums):\n    # House robber: cannot take adjacent houses\n    take, skip = 0, 0\n    for x in nums:\n        take, skip = skip + x, max(skip, take)\n    return max(take, skip)\n\n\ndef knapsack_01(weights, values, W):\n    # Max value with capacity W; each item used at most once\n    dp = [0] * (W + 1)\n    for i in range(len(weights)):\n        for c in range(W, weights[i] - 1, -1):   # descending = 0/1\n            dp[c] = max(dp[c], dp[c - weights[i]] + values[i])\n    return dp[W]\n\n\n@lru_cache(maxsize=None)\ndef lcs(i, j, a, b):\n    if i == len(a) or j == len(b):\n        return 0\n    if a[i] == b[j]:\n        return 1 + lcs(i + 1, j + 1, a, b)\n    return max(lcs(i + 1, j, a, b), lcs(i, j + 1, a, b))",
    },
    observations: [
      "Define the state precisely first; the recurrence and base cases follow from it",
      "Top-down memoization is the fastest way to prototype; convert to bottom-up to reduce space",
      "0/1 knapsack loops capacity descending so each item is used at most once",
      "Many 1D DPs need only the last one or two values, collapsing O(n) space to O(1)",
      "If a correct greedy exists, prefer it; DP is the fallback when choices have future cost",
    ],
    videos: [
      { title: "NeetCode Roadmap - 1-D / 2-D DP", url: "https://neetcode.io/roadmap", source: "NeetCode" },
    ],
    articles: [
      { title: "Dynamic Programming", url: "https://www.geeksforgeeks.org/dynamic-programming/", source: "GeeksforGeeks" },
    ],
  },

  "advanced-dp": {
    id: "advanced-dp",
    name: "Advanced DP",
    summary: "Harder DP states and optimizations: bitmask DP, digit DP, interval DP, and DP on trees/DAGs.",
    description:
      "Advanced DP covers patterns where the state itself is non-trivial or the transition needs optimization. Bitmask DP encodes a subset of up to ~20 elements as an integer state (traveling salesman, assignment, partition into groups). Interval DP fills the answer for ranges [i, j] from smaller ranges (matrix chain multiplication, burst balloons, palindrome partitioning). Digit DP counts numbers up to N with digit constraints by processing digits with a 'tight' flag. DP on trees aggregates child results into parents.\n\nBeyond new state shapes, there are transition optimizations: monotonic-queue DP, convex hull trick, and divide-and-conquer optimization can cut a factor of n off certain recurrences. These appear in harder competitive problems.\n\nThe approach is the same as basic DP — define state and transition — but the state is multidimensional or compressed, and you must watch the exponential factors (2^n for bitmask, n^3 for many interval DPs).",
    recognition: [
      "n is small (<= ~20) and you must consider every subset (bitmask DP)",
      "The answer for a range depends on splitting it into subranges (interval DP)",
      "Counting numbers <= N satisfying digit constraints (digit DP)",
      "Optimizing/aggregating over a tree where each node combines children (tree DP)",
      "A standard DP recurrence is too slow and has special structure to optimize",
    ],
    whenToUse: [
      "Bitmask DP for TSP, assignment, and 'partition into groups' with small n",
      "Interval DP for matrix-chain, burst balloons, optimal BST, palindrome cuts",
      "Digit DP for counting constrained numbers in a range",
      "Tree DP for subtree aggregates and rerooting problems",
    ],
    whenNotToUse: [
      "A simpler 1D/2D DP already fits the constraints",
      "n is too large for the exponential factor (2^n with n > ~22)",
      "There is no overlapping subproblem structure to exploit",
    ],
    complexity: [
      { operation: "Bitmask DP (TSP)", time: "O(2^n * n^2)", space: "O(2^n * n)", note: "n <= ~20" },
      { operation: "Interval DP", time: "O(n^3)", space: "O(n^2)", note: "range [i,j] + split point" },
      { operation: "Digit DP", time: "O(digits * states)", space: "O(digits * states)", note: "tight/leading-zero flags" },
      { operation: "Tree DP", time: "O(n)", space: "O(h)", note: "one postorder pass" },
    ],
    commonMistakes: [
      "Exceeding the bitmask limit (2^n explodes past n ~= 22)",
      "Wrong iteration order in interval DP (must go by increasing range length)",
      "Forgetting the 'tight' / leading-zero flags in digit DP",
      "Mismanaging the split point loop bounds in interval DP",
      "Not memoizing on the full multidimensional state, causing recomputation",
      "Confusing which subtrees a tree-DP transition should include (off-by-one on the node itself)",
    ],
    template: {
      language: "python",
      code: "from functools import lru_cache\n\ndef tsp(dist):\n    # Shortest tour visiting all n cities, returning to 0 (bitmask DP)\n    n = len(dist)\n    FULL = (1 << n) - 1\n\n    @lru_cache(maxsize=None)\n    def best(mask, u):\n        if mask == FULL:\n            return dist[u][0]            # return to start\n        res = float('inf')\n        for v in range(n):\n            if not (mask >> v) & 1:      # city v not yet visited\n                res = min(res, dist[u][v] + best(mask | (1 << v), v))\n        return res\n\n    return best(1, 0)                    # start at city 0, only it visited\n\n\ndef interval_dp(n, cost):\n    # Template: fill by increasing length, try every split point\n    dp = [[0] * n for _ in range(n)]\n    for length in range(2, n + 1):\n        for i in range(n - length + 1):\n            j = i + length - 1\n            dp[i][j] = min(dp[i][k] + dp[k + 1][j] + cost(i, k, j)\n                           for k in range(i, j))\n    return dp[0][n - 1]",
    },
    observations: [
      "Bitmask DP is only feasible for n up to about 20-22 because of the 2^n factor",
      "Interval DP must iterate by increasing range length so subranges are ready",
      "Digit DP state is (position, tight, started/leading-zero, plus any constraint accumulator)",
      "Tree DP is a postorder traversal returning each node's contribution to its parent",
      "Transition optimizations (monotonic queue, convex hull trick) cut a factor of n off special recurrences",
    ],
    videos: [
      { title: "Advanced DP - NeetCode", url: "https://www.youtube.com/@NeetCode", source: "NeetCode" },
    ],
    articles: [
      { title: "Bitmasking and Dynamic Programming", url: "https://www.geeksforgeeks.org/bitmasking-and-dynamic-programming-set-1-count-ways-to-assign-unique-cap-to-every-person/", source: "GeeksforGeeks" },
    ],
  },

  "segment-tree": {
    id: "segment-tree",
    name: "Segment Tree",
    summary: "A binary tree over array ranges giving O(log n) range queries and point updates.",
    description:
      "A segment tree is a binary tree where each node stores an aggregate (sum, min, max, gcd) over a contiguous range of the array. Leaves hold single elements and internal nodes combine their children. It answers range queries and applies updates in O(log n), with O(n) build and O(n) space (typically a 2n or 4n array).\n\nIt is more general than a Fenwick tree: any associative operation works, and with lazy propagation it also supports range updates (add v to all elements in [l, r]) in O(log n). This makes it the standard structure when the array changes between many range queries.\n\nThe build is recursive (or iterative with an offset), queries split a range into O(log n) canonical segments, and updates walk a single root-to-leaf path recomputing aggregates. Lazy propagation defers child updates until a node is actually visited.",
    recognition: [
      "Many range queries (sum/min/max/gcd) interleaved with updates",
      "The array is mutable and a static prefix sum will not do",
      "Range update plus range query (needs lazy propagation)",
      "Querying aggregates over arbitrary subranges efficiently",
      "Online queries where the data changes over time",
    ],
    whenToUse: [
      "Mixed point updates and range aggregate queries",
      "Range updates with range queries via lazy propagation",
      "Aggregates beyond sum (min, max, gcd) that Fenwick handles awkwardly",
      "Problems framed as dynamic range statistics",
    ],
    whenNotToUse: [
      "Only prefix sums on a static array (use a plain prefix-sum array)",
      "Only point updates + prefix sums (a Fenwick tree is simpler/lighter)",
      "No range queries at all (overkill)",
    ],
    complexity: [
      { operation: "Build", time: "O(n)", space: "O(n)", note: "2n or 4n storage" },
      { operation: "Range query", time: "O(log n)", space: "O(1)", note: "splits into O(log n) segments" },
      { operation: "Point update", time: "O(log n)", space: "O(1)", note: "single root-to-leaf path" },
      { operation: "Range update (lazy)", time: "O(log n)", space: "O(n)", note: "deferred propagation" },
    ],
    commonMistakes: [
      "Allocating too small an array (use 4n to be safe with recursive builds)",
      "Mismatched inclusive/exclusive range conventions between query and node ranges",
      "Forgetting to push down lazy values before descending into children",
      "Combining children with the wrong operation (sum vs min mix-up)",
      "Off-by-one in mid split (mid = (lo + hi) // 2 and the two child ranges)",
      "Not rebuilding/recomputing the parent after a child update",
    ],
    template: {
      language: "python",
      code: "class SegmentTree:\n    # Range sum with point updates (1-indexed internal tree)\n    def __init__(self, data):\n        self.n = len(data)\n        self.tree = [0] * (2 * self.n)\n        for i, v in enumerate(data):          # leaves\n            self.tree[self.n + i] = v\n        for i in range(self.n - 1, 0, -1):    # internal nodes\n            self.tree[i] = self.tree[2 * i] + self.tree[2 * i + 1]\n\n    def update(self, i, value):\n        i += self.n\n        self.tree[i] = value\n        i //= 2\n        while i:\n            self.tree[i] = self.tree[2 * i] + self.tree[2 * i + 1]\n            i //= 2\n\n    def query(self, l, r):\n        # sum over [l, r)\n        res = 0\n        l += self.n\n        r += self.n\n        while l < r:\n            if l & 1:\n                res += self.tree[l]; l += 1\n            if r & 1:\n                r -= 1; res += self.tree[r]\n            l //= 2; r //= 2\n        return res",
    },
    observations: [
      "Any associative operation works (sum, min, max, gcd) by changing the combine step",
      "Lazy propagation is what enables O(log n) range updates, not just point updates",
      "The iterative bottom-up version uses a 2n array; the recursive version is easier with 4n",
      "A query decomposes any range into O(log n) precomputed canonical segments",
      "Choose Fenwick over segment tree when you only need prefix sums with point updates",
    ],
    videos: [
      { title: "Segment Tree - NeetCode", url: "https://www.youtube.com/@NeetCode", source: "NeetCode" },
    ],
    articles: [
      { title: "Segment Tree", url: "https://cp-algorithms.com/data_structures/segment_tree.html", source: "CP-Algorithms" },
    ],
  },

  "fenwick-tree": {
    id: "fenwick-tree",
    name: "Fenwick Tree",
    summary: "A compact array (Binary Indexed Tree) giving O(log n) prefix sums and point updates.",
    description:
      "A Fenwick tree, or Binary Indexed Tree (BIT), supports prefix-sum queries and point updates in O(log n) using a single array and clever indexing based on the lowest set bit. It is essentially a leaner alternative to a segment tree for the common case of point-update + prefix-sum (and therefore range-sum via subtraction).\n\nThe magic is in the index arithmetic: i & (-i) isolates the lowest set bit, which tells you the range of indices a node is responsible for. Update walks upward by adding that bit; query walks downward by subtracting it. It is 1-indexed by convention to make this arithmetic clean.\n\nFenwick trees use less memory and have smaller constants than segment trees, but they are specialized: they shine for sums/counts and invertible operations, and they do not naturally support range-min or arbitrary range updates without extra tricks.",
    recognition: [
      "Point updates plus prefix-sum or range-sum queries on a mutable array",
      "Counting inversions or 'how many smaller elements to the right'",
      "Order statistics / rank queries over compressed coordinates",
      "You want a segment tree's effect for sums with less code and memory",
      "Online cumulative-frequency queries",
    ],
    whenToUse: [
      "Mutable prefix/range sums with point updates",
      "Counting inversions during a sweep",
      "Frequency/rank structures over coordinate-compressed values",
      "When you need a lighter alternative to a sum segment tree",
    ],
    whenNotToUse: [
      "Range min/max or non-invertible aggregates (use a segment tree)",
      "Heavy range updates with range queries (segment tree with lazy is cleaner)",
      "Static arrays where a plain prefix-sum array suffices",
    ],
    complexity: [
      { operation: "Point update", time: "O(log n)", space: "O(1)", note: "walk up via i += i & -i" },
      { operation: "Prefix-sum query", time: "O(log n)", space: "O(1)", note: "walk down via i -= i & -i" },
      { operation: "Range sum [l, r]", time: "O(log n)", space: "O(1)", note: "prefix(r) - prefix(l-1)" },
      { operation: "Build", time: "O(n)", space: "O(n)", note: "or O(n log n) by repeated update" },
    ],
    commonMistakes: [
      "Using 0-based indexing where the BIT arithmetic assumes 1-based",
      "Off-by-one in range sum (prefix(r) - prefix(l-1))",
      "Trying to support range-min with a Fenwick tree (it does not generalize)",
      "Confusing update (add a delta) with set (assign), forgetting to subtract the old value",
      "Wrong lowbit step (i & -i) direction for update vs query",
      "Forgetting coordinate compression when values are large/sparse",
    ],
    template: {
      language: "python",
      code: "class Fenwick:\n    # 1-indexed Binary Indexed Tree for prefix sums\n    def __init__(self, n):\n        self.n = n\n        self.tree = [0] * (n + 1)\n\n    def update(self, i, delta):\n        # add delta at position i (1-indexed)\n        while i <= self.n:\n            self.tree[i] += delta\n            i += i & (-i)            # move to parent: add lowest set bit\n\n    def prefix_sum(self, i):\n        # sum of [1, i]\n        s = 0\n        while i > 0:\n            s += self.tree[i]\n            i -= i & (-i)            # strip lowest set bit\n        return s\n\n    def range_sum(self, l, r):\n        return self.prefix_sum(r) - self.prefix_sum(l - 1)",
    },
    observations: [
      "i & (-i) isolates the lowest set bit, the core of all BIT navigation",
      "Update walks up by adding the lowbit; query walks down by stripping it",
      "Keep it 1-indexed so the lowbit arithmetic stays clean",
      "Range sum = prefix(r) - prefix(l-1); the operation must be invertible",
      "Inversion counting: sweep and query how many already-inserted values are smaller/larger",
    ],
    videos: [
      { title: "Binary Indexed Tree - NeetCode", url: "https://www.youtube.com/@NeetCode", source: "NeetCode" },
    ],
    articles: [
      { title: "Fenwick Tree (Binary Indexed Tree)", url: "https://cp-algorithms.com/data_structures/fenwick.html", source: "CP-Algorithms" },
    ],
  },

  "advanced-graph": {
    id: "advanced-graph",
    name: "Advanced Graph Algorithms",
    summary: "Beyond DFS/BFS: SCCs, bridges/articulation points, Eulerian paths, and max-flow.",
    description:
      "Advanced graph algorithms handle structural and flow questions that basic traversals cannot. Tarjan's and Kosaraju's algorithms find strongly connected components (SCCs) of a directed graph in O(V + E) — maximal groups where every vertex reaches every other. Tarjan's low-link idea also finds bridges (edges whose removal disconnects the graph) and articulation points. Eulerian path/circuit algorithms (Hierholzer's) traverse every edge exactly once. Maximum-flow / minimum-cut (Edmonds-Karp, Dinic's) models capacity and matching problems.\n\nThe unifying theme is DFS augmented with extra bookkeeping: discovery times and low-link values capture back edges and component structure. Many seemingly unrelated problems (2-SAT, scheduling, bipartite matching) reduce to one of these.\n\nThese are the most specialized topics; in interviews they appear less often than the core, but knowing which classical algorithm a problem reduces to is the key skill.",
    recognition: [
      "Group a directed graph into mutually reachable clusters (SCC)",
      "Find critical edges (bridges) or vertices (articulation points)",
      "Traverse every edge exactly once (Eulerian path/circuit)",
      "Capacity/throughput, bipartite matching, or min-cut problems (max flow)",
      "Problems that reduce to 2-SAT or implication graphs (uses SCC)",
    ],
    whenToUse: [
      "Tarjan's/Kosaraju's for strongly connected components and condensation",
      "Tarjan's low-link for bridges and articulation points",
      "Hierholzer's for Eulerian path/circuit (reconstruct itinerary)",
      "Max-flow/min-cut (Dinic's, Edmonds-Karp) for matching and capacity",
    ],
    whenNotToUse: [
      "Plain reachability or shortest path (basic DFS/BFS/Dijkstra suffice)",
      "Undirected connectivity that union-find handles more simply",
      "Small inputs where a direct/brute approach is clear and fast enough",
    ],
    complexity: [
      { operation: "SCC (Tarjan / Kosaraju)", time: "O(V + E)", space: "O(V)", note: "two passes or one with stack" },
      { operation: "Bridges / articulation points", time: "O(V + E)", space: "O(V)", note: "DFS low-link values" },
      { operation: "Eulerian path (Hierholzer)", time: "O(E)", space: "O(E)", note: "needs degree conditions" },
      { operation: "Max flow (Dinic's)", time: "O(V^2 * E)", space: "O(V + E)", note: "O(E*sqrt(V)) on unit-capacity" },
    ],
    commonMistakes: [
      "Confusing strongly connected (directed) with connected (undirected) components",
      "Mishandling the low-link update for back edges vs tree edges in Tarjan's",
      "Treating a parent edge as a back edge in undirected bridge-finding",
      "Ignoring Eulerian existence conditions (degree parity / in-out degree balance)",
      "Forgetting residual/back edges when building a max-flow network",
      "Reaching for max flow when a simpler matching/greedy works",
    ],
    template: {
      language: "python",
      code: "import sys\n\ndef tarjan_scc(n, adj):\n    # Strongly connected components via Tarjan's low-link, O(V + E)\n    index = [0]\n    ids = [-1] * n          # discovery index\n    low = [0] * n\n    on_stack = [False] * n\n    stack = []\n    sccs = []\n\n    sys.setrecursionlimit(1 << 20)\n\n    def dfs(u):\n        ids[u] = low[u] = index[0]\n        index[0] += 1\n        stack.append(u)\n        on_stack[u] = True\n        for v in adj[u]:\n            if ids[v] == -1:            # tree edge\n                dfs(v)\n                low[u] = min(low[u], low[v])\n            elif on_stack[v]:           # back edge to active node\n                low[u] = min(low[u], ids[v])\n        if low[u] == ids[u]:            # u is an SCC root\n            comp = []\n            while True:\n                w = stack.pop()\n                on_stack[w] = False\n                comp.append(w)\n                if w == u:\n                    break\n            sccs.append(comp)\n\n    for u in range(n):\n        if ids[u] == -1:\n            dfs(u)\n    return sccs",
    },
    observations: [
      "Discovery time + low-link is the shared engine of SCC, bridge, and articulation-point algorithms",
      "A node is an SCC root when low[u] == ids[u]; pop the stack to extract that component",
      "An edge (u, v) is a bridge when low[v] > ids[u] (no back edge bypasses it)",
      "Condensing SCCs yields a DAG, which is how 2-SAT and many reductions are solved",
      "Max-flow min-cut equivalence models bipartite matching, vertex covers, and partitioning",
    ],
    videos: [
      { title: "NeetCode - Advanced Graphs", url: "https://www.youtube.com/@NeetCode", source: "NeetCode" },
    ],
    articles: [
      { title: "Strongly Connected Components (Tarjan / Kosaraju)", url: "https://cp-algorithms.com/graph/strongly-connected-components.html", source: "CP-Algorithms" },
    ],
  },
};
