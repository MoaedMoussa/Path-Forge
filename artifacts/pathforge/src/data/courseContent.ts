import type { LucideIcon } from 'lucide-react';
import {
  GalleryHorizontal,
  Binary,
  Boxes,
  Brackets,
  Layers3,
  GitBranch,
  ListTree,
  Network,
  Search,
  Workflow,
  Cpu
} from 'lucide-react';

export type CourseCategory = 'Linear structures' | 'Algorithms' | 'Trees & graphs' | 'Advanced techniques';
export type CourseId =
  | 'arrays'
  | 'linked-lists'
  | 'stacks-queues'
  | 'hash-tables'
  | 'searching'
  | 'sorting'
  | 'sliding-window'
  | 'greedy'
  | 'trees'
  | 'graphs'
  | 'heaps'
  | 'tries'
  | 'union-find'
  | 'dynamic-programming'
  | 'backtracking'
  | 'bit-manipulation';

export interface LessonStep {
  title: string;
  detail: string;
}

export interface QuizQuestion {
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface PuzzleStep {
  id: string;
  label: string;
}

export interface PuzzleChallenge {
  title: string;
  prompt: string;
  steps: PuzzleStep[];
  solutionOrder: string[];
  successMessage: string;
  hint: string;
}

export interface CourseLesson {
  id: CourseId;
  title: string;
  shortTitle: string;
  category: CourseCategory;
  description: string;
  goal: string;
  complexity: string;
  icon: LucideIcon;
  accent: 'cyan' | 'amber' | 'violet' | 'green';
  concepts: string[];
  whyItMatters: string;
  steps: LessonStep[];
  interviewPrompt: string;
}

export const COURSE_LESSONS: CourseLesson[] = [
  {
    id: 'arrays',
    title: 'Arrays & array lists',
    shortTitle: 'Arrays',
    category: 'Linear structures',
    description: 'Explore indexed storage, dynamic resizing, and the cost of shifting elements.',
    goal: 'Understand why fast lookup does not always mean fast insertion.',
    complexity: 'Access O(1) · Search O(n) · Insert O(n)',
    icon: GalleryHorizontal,
    accent: 'cyan',
    concepts: ['Contiguous memory', 'Index arithmetic', 'Dynamic resizing', 'Amortized analysis'],
    whyItMatters: 'Arrays are the baseline data structure behind vectors, tables, buffers, and many higher-level collections.',
    steps: [
      { title: 'Index directly', detail: 'An array calculates the address of an item from its index, so reading arr[i] is constant time.' },
      { title: 'Insert carefully', detail: 'Adding in the middle shifts every later element one position to the right.' },
      { title: 'Grow strategically', detail: 'Array lists occasionally copy into a larger block; this is expensive once, but cheap on average.' },
    ],
    interviewPrompt: 'Why is appending to a dynamic array amortized O(1), even though a resize can be O(n)?',
  },
  {
    id: 'linked-lists',
    title: 'Linked lists',
    shortTitle: 'Linked lists',
    category: 'Linear structures',
    description: 'Manipulate node references and see how pointer changes replace array shifting.',
    goal: 'Learn the insertion-versus-access trade-off of linked storage.',
    complexity: 'Access O(n) · Head insert O(1) · Known-node delete O(1)',
    icon: Network,
    accent: 'violet',
    concepts: ['Nodes and pointers', 'Head & tail', 'Singly linked lists', 'Traversal'],
    whyItMatters: 'Linked structures power adjacency lists, LRU caches, queues, and systems where cheap local insertion matters.',
    steps: [
      { title: 'Follow links', detail: 'Each node stores a value and a reference to the next node instead of relying on neighboring memory.' },
      { title: 'Insert by rewiring', detail: 'To insert after a node, point the new node at its successor, then point the current node at the new node.' },
      { title: 'Pay for traversal', detail: 'Because there is no index-to-address calculation, reaching the kth item requires walking node by node.' },
    ],
    interviewPrompt: 'When would you choose a linked list over an array list in a real system?',
  },
  {
    id: 'stacks-queues',
    title: 'Stacks & queues',
    shortTitle: 'Stacks / queues',
    category: 'Linear structures',
    description: 'Use LIFO and FIFO policies to model undo flows, scheduling, parsing, and graph traversal.',
    goal: 'Recognize when the order of removal is the algorithm.',
    complexity: 'Push / enqueue O(1) · Pop / dequeue O(1)',
    icon: Layers3,
    accent: 'amber',
    concepts: ['LIFO', 'FIFO', 'Call stacks', 'Task scheduling'],
    whyItMatters: 'A stack powers function calls and expression parsing; a queue powers breadth-first search, job systems, and request handling.',
    steps: [
      { title: 'Choose a policy', detail: 'A stack removes the newest item first. A queue removes the oldest item first.' },
      { title: 'Observe the frontier', detail: 'Changing the collection changes the order an algorithm discovers work.' },
      { title: 'Apply the pattern', detail: 'Use a stack for backtracking and a queue for fair, level-by-level work.' },
    ],
    interviewPrompt: 'Why does BFS use a queue while DFS naturally uses a stack?',
  },
  {
    id: 'hash-tables',
    title: 'Hash tables & Maps',
    shortTitle: 'Hash tables',
    category: 'Linear structures',
    description: 'Map keys to values instantly using hashing functions and array indexing.',
    goal: 'Understand O(1) lookups and the reality of hash collisions.',
    complexity: 'Access O(1) · Insert O(1) · Delete O(1)',
    icon: Network, // Reuse or import Hash if available
    accent: 'cyan',
    concepts: ['Hash functions', 'Collisions', 'Chaining', 'Probing'],
    whyItMatters: 'Hash tables are the engine behind databases, caches, objects in JavaScript, and dictionaries in Python.',
    steps: [
      { title: 'Hash the key', detail: 'Convert a string or object into an integer to use as an array index.' },
      { title: 'Handle collisions', detail: 'When two keys hash to the same index, store them in a list (chaining) or find the next open slot (probing).' },
      { title: 'Rehash when full', detail: 'Like dynamic arrays, hash tables must resize and recompute hashes when they get too crowded.' },
    ],
    interviewPrompt: 'What happens to performance when a hash table has too many collisions?',
  },
  {
    id: 'searching',
    title: 'Searching',
    shortTitle: 'Searching',
    category: 'Algorithms',
    description: 'Compare linear search with binary search and watch the search window collapse.',
    goal: 'Learn when sorted data turns a scan into logarithmic search.',
    complexity: 'Linear O(n) · Binary O(log n)',
    icon: Search,
    accent: 'green',
    concepts: ['Sorted invariant', 'Midpoint', 'Search window', 'Logarithms'],
    whyItMatters: 'Binary search appears in databases, package managers, game engines, and any system that searches sorted boundaries.',
    steps: [
      { title: 'Keep data sorted', detail: 'Binary search only works because every value left of the midpoint is smaller and every value right is larger.' },
      { title: 'Probe the middle', detail: 'Compare once, then discard half of the remaining candidates.' },
      { title: 'Repeat logarithmically', detail: 'Each comparison halves the work, making millions of values manageable in about twenty checks.' },
    ],
    interviewPrompt: 'What is the loop invariant in binary search, and what common off-by-one bug breaks it?',
  },
  {
    id: 'sorting',
    title: 'Sorting lab',
    shortTitle: 'Sorting',
    category: 'Algorithms',
    description: 'Animate Bubble Sort and Merge Sort to compare local swaps with divide-and-conquer.',
    goal: 'See why algorithmic complexity dominates as input size grows.',
    complexity: 'Bubble O(n²) · Merge O(n log n)',
    icon: Workflow,
    accent: 'cyan',
    concepts: ['Comparisons', 'Swaps', 'Divide and conquer', 'Stability'],
    whyItMatters: 'Sorting is a practical gateway to complexity analysis, benchmarking, and choosing the right standard-library operation.',
    steps: [
      { title: 'Compare neighbors', detail: 'Bubble Sort repeatedly exchanges adjacent out-of-order values, slowly moving large values to the end.' },
      { title: 'Divide the input', detail: 'Merge Sort breaks a list into halves until each piece is trivially sorted.' },
      { title: 'Merge with intent', detail: 'The merge phase combines sorted halves in linear time, producing a much better total complexity.' },
    ],
    interviewPrompt: 'Why is Merge Sort O(n log n), and what trade-off does it make compared with in-place sorting?',
  },
  {
    id: 'sliding-window',
    title: 'Sliding window & Two pointers',
    shortTitle: 'Two pointers',
    category: 'Algorithms',
    description: 'Optimize nested loops by maintaining a flexible window or moving pointers.',
    goal: 'Learn how to reduce O(n²) string and array problems to O(n).',
    complexity: 'Time O(n) · Space O(1)',
    icon: Search,
    accent: 'violet',
    concepts: ['Subarrays', 'Flexible windows', 'Pointer movement', 'State tracking'],
    whyItMatters: 'Essential for processing streams, finding optimal subsequences, and parsing text.',
    steps: [
      { title: 'Initialize pointers', detail: 'Start both pointers at the beginning, or one at each end depending on the goal.' },
      { title: 'Expand and shrink', detail: 'Move the right pointer to include elements, and the left pointer to remove elements when constraints are broken.' },
      { title: 'Track the best', detail: 'Update your maximum, minimum, or target metric during the window adjustments.' },
    ],
    interviewPrompt: 'How do you know when to shrink the window in a dynamic sliding window problem?',
  },
  {
    id: 'greedy',
    title: 'Greedy algorithms',
    shortTitle: 'Greedy',
    category: 'Algorithms',
    description: 'Make the locally optimal choice at each step to find a global optimum.',
    goal: 'Identify when picking the immediate best option leads to the best overall result.',
    complexity: 'Varies, often O(n log n) with sorting',
    icon: Workflow,
    accent: 'amber',
    concepts: ['Local optimum', 'Global optimum', 'Sorting heuristics', 'Proof of correctness'],
    whyItMatters: 'Used in data compression (Huffman coding), routing (Dijkstra), and scheduling.',
    steps: [
      { title: 'Sort or prioritize', detail: 'Greedy algorithms usually require looking at the "best" remaining item first, meaning data must be sorted.' },
      { title: 'Take the best', detail: 'Make the choice that looks best right now without worrying about the future.' },
      { title: 'Never look back', detail: 'Once a choice is made, it is permanent. If this fails, you may need dynamic programming.' },
    ],
    interviewPrompt: 'Why does a greedy approach work for the coin change problem with US currency, but fail for arbitrary coin denominations?',
  },
  {
    id: 'trees',
    title: 'Binary search trees',
    shortTitle: 'Trees',
    category: 'Trees & graphs',
    description: 'Traverse ordered nodes and see how tree shape controls search performance.',
    goal: 'Use the BST ordering invariant to reason about search and insertion.',
    complexity: 'Balanced search O(log n) · Worst case O(n)',
    icon: GitBranch,
    accent: 'violet',
    concepts: ['Root, leaves, depth', 'BST invariant', 'In-order traversal', 'Balance'],
    whyItMatters: 'Trees represent hierarchical data and form the basis for indexes, compilers, UI document models, and efficient maps.',
    steps: [
      { title: 'Respect the invariant', detail: 'Every value in the left subtree is smaller; every value in the right subtree is larger.' },
      { title: 'Choose one branch', detail: 'At each node, a comparison tells you which entire subtree can be skipped.' },
      { title: 'Watch for imbalance', detail: 'Sorted insertions can degrade a plain BST into a linked list, motivating balanced trees.' },
    ],
    interviewPrompt: 'Why does inserting already-sorted data into an unbalanced BST create a performance problem?',
  },
  {
    id: 'graphs',
    title: 'Graphs & traversal',
    shortTitle: 'Graphs',
    category: 'Trees & graphs',
    description: 'Trace BFS and DFS through a network and connect graph concepts back to PathForge.',
    goal: 'Understand how a frontier, visited set, and adjacency structure prevent repeated work.',
    complexity: 'BFS / DFS O(V + E)',
    icon: ListTree,
    accent: 'green',
    concepts: ['Vertices & edges', 'Adjacency lists', 'Visited sets', 'BFS vs DFS'],
    whyItMatters: 'Maps, social networks, build systems, dependency graphs, and PathForge’s grid are all graph problems in disguise.',
    steps: [
      { title: 'Model relationships', detail: 'A graph stores entities as vertices and their connections as edges.' },
      { title: 'Track visited nodes', detail: 'A visited set prevents cycles from turning a traversal into an infinite loop.' },
      { title: 'Select a frontier', detail: 'A queue explores by distance; a stack explores deeply before backtracking.' },
    ],
    interviewPrompt: 'How does a grid-based pathfinder become a graph traversal problem?',
  },
  {
    id: 'heaps',
    title: 'Heaps & Priority Queues',
    shortTitle: 'Heaps',
    category: 'Trees & graphs',
    description: 'Maintain a partially ordered tree to instantly retrieve the maximum or minimum element.',
    goal: 'Understand how arrays can represent trees for O(log n) insertions and O(1) peek.',
    complexity: 'Insert O(log n) · Extract O(log n) · Peek O(1)',
    icon: Layers3,
    accent: 'amber',
    concepts: ['Binary heap', 'Array representation', 'Sift up / down', 'Priority queues'],
    whyItMatters: 'Heaps power Dijkstra’s algorithm, task schedulers, and stream median calculations.',
    steps: [
      { title: 'Keep the root extreme', detail: 'In a max-heap, the root is always the largest element. In a min-heap, the smallest.' },
      { title: 'Insert and bubble up', detail: 'Add new elements to the bottom, then swap them upwards until the heap property is restored.' },
      { title: 'Extract and sift down', detail: 'Remove the root, move the last element to the top, and swap it downwards.' },
    ],
    interviewPrompt: 'How can you find the Kth largest element in a stream using a heap?',
  },
  {
    id: 'tries',
    title: 'Tries (Prefix Trees)',
    shortTitle: 'Tries',
    category: 'Trees & graphs',
    description: 'Store strings efficiently by sharing common prefixes along tree branches.',
    goal: 'Learn how to build autocomplete systems and dictionary lookups.',
    complexity: 'Insert O(L) · Search O(L) where L is string length',
    icon: GitBranch,
    accent: 'cyan',
    concepts: ['Nodes as characters', 'Prefix sharing', 'Word boundaries', 'Autocomplete'],
    whyItMatters: 'Tries are the backbone of search engine autocomplete, spell checkers, and IP routing tables.',
    steps: [
      { title: 'Branch by character', detail: 'Each node represents a single character. Paths down the tree form words.' },
      { title: 'Share the prefix', detail: 'Words with the same prefix share the same ancestor nodes, saving space.' },
      { title: 'Mark the end', detail: 'A boolean flag at a node indicates that the path so far forms a complete, valid word.' },
    ],
    interviewPrompt: 'What is the memory trade-off of a Trie compared to a Hash Set for storing strings?',
  },
  {
    id: 'union-find',
    title: 'Disjoint Sets (Union-Find)',
    shortTitle: 'Union-Find',
    category: 'Trees & graphs',
    description: 'Keep track of partitioned sets and merge them efficiently.',
    goal: 'Solve connectivity problems and detect cycles in graphs instantly.',
    complexity: 'Union/Find O(α(n)) almost O(1)',
    icon: Boxes,
    accent: 'violet',
    concepts: ['Set representatives', 'Path compression', 'Union by rank', 'Connectivity'],
    whyItMatters: 'Used in Kruskal’s Minimum Spanning Tree algorithm, image processing, and network connectivity.',
    steps: [
      { title: 'Appoint a leader', detail: 'Every element starts as its own set with itself as the representative leader.' },
      { title: 'Merge sets (Union)', detail: 'To connect two elements, point the leader of one set to the leader of the other.' },
      { title: 'Flatten paths (Compression)', detail: 'Whenever you search for a leader, point all visited nodes directly to the root to speed up future searches.' },
    ],
    interviewPrompt: 'Explain how path compression makes the time complexity of Union-Find nearly constant.',
  },
  {
    id: 'dynamic-programming',
    title: 'Dynamic Programming',
    shortTitle: 'DP',
    category: 'Advanced techniques',
    description: 'Solve complex problems by breaking them down into overlapping subproblems and remembering the answers.',
    goal: 'Trade memory for speed by memoizing results or building tables bottom-up.',
    complexity: 'Varies dramatically, often reduces O(2ⁿ) to O(n²)',
    icon: Boxes,
    accent: 'green',
    concepts: ['Memoization', 'Tabulation', 'Overlapping subproblems', 'State transitions'],
    whyItMatters: 'DP is the optimal approach for sequencing, string comparisons (Diff tools), and resource allocation.',
    steps: [
      { title: 'Find the subproblem', detail: 'Express the solution in terms of smaller, identical problems.' },
      { title: 'Cache the results', detail: 'Store the answer to each subproblem so you never compute the same thing twice (Memoization).' },
      { title: 'Build bottom-up', detail: 'Alternatively, solve the smallest problems first and use their answers to build up to the final solution (Tabulation).' },
    ],
    interviewPrompt: 'What is the difference between Top-Down (Memoization) and Bottom-Up (Tabulation) Dynamic Programming?',
  },
  {
    id: 'backtracking',
    title: 'Backtracking',
    shortTitle: 'Backtracking',
    category: 'Advanced techniques',
    description: 'Explore all possible solutions by building them step-by-step and abandoning dead ends.',
    goal: 'Write exhaustive searches that are smarter than pure brute force.',
    complexity: 'Often O(2ⁿ) or O(n!)',
    icon: Network,
    accent: 'amber',
    concepts: ['State space tree', 'Pruning', 'Recursion', 'Constraint satisfaction'],
    whyItMatters: 'Solves puzzles (Sudoku, N-Queens), generates permutations, and powers regex engines.',
    steps: [
      { title: 'Make a choice', detail: 'Pick one valid option and add it to your current state.' },
      { title: 'Explore further', detail: 'Recursively try to build a complete solution from this new state.' },
      { title: 'Undo and backtrack', detail: 'If the choice leads to a dead end, remove it (undo) and try the next option.' },
    ],
    interviewPrompt: 'How does pruning improve the performance of a backtracking algorithm?',
  },
  {
    id: 'bit-manipulation',
    title: 'Bit Manipulation',
    shortTitle: 'Bit logic',
    category: 'Advanced techniques',
    description: 'Operate directly on the binary representations of numbers.',
    goal: 'Use bitwise operators to optimize space and perform lightning-fast math.',
    complexity: 'O(1) operations',
    icon: Binary,
    accent: 'cyan',
    concepts: ['AND, OR, XOR', 'Bit shifting', 'Masking', 'Binary math'],
    whyItMatters: 'Crucial for low-level systems, cryptography, compression, and squeezing state into integers.',
    steps: [
      { title: 'Understand the operators', detail: 'Learn how AND (&), OR (|), and XOR (^) combine bits.' },
      { title: 'Shift for speed', detail: 'Left shift (<<) multiplies by 2; right shift (>>) divides by 2.' },
      { title: 'Masking', detail: 'Use bitmasks to isolate, toggle, or check the status of specific bits.' },
    ],
    interviewPrompt: 'Explain how XOR can be used to find the single non-duplicate number in an array where every other number appears twice.',
  }
];

export function getCourseLesson(id?: string): CourseLesson | undefined {
  return COURSE_LESSONS.find(lesson => lesson.id === id);
}

export const COURSE_CATEGORIES: CourseCategory[] = ['Linear structures', 'Trees & graphs', 'Algorithms', 'Advanced techniques'];

export const COURSE_CATEGORY_ICONS: Record<CourseCategory, LucideIcon> = {
  'Linear structures': Brackets,
  'Trees & graphs': ListTree,
  'Algorithms': Workflow,
  'Advanced techniques': Cpu,
};