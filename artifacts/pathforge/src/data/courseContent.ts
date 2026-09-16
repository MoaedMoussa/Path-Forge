import type { LucideIcon } from 'lucide-react';
import {
  Server,
  Database,
  BrainCircuit,
  TrendingDown,
  AppWindow,
  Zap
} from 'lucide-react';
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

export type CourseCategory = 'Linear structures' | 'Algorithms' | 'Trees & graphs' | 'Advanced techniques' | 'System Design' | 'Machine Learning' | 'Web Architecture';
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
  | 'bit-manipulation'
  | 'pathfinding-astar'
  | 'cellular-automata'
  | 'bsp-trees'
  | 'load-balancing'
  | 'microservices'
  | 'neural-networks'
  | 'gradient-descent'
  | 'react-architecture'
  | 'caching-strategies';

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
  videoId?: string;
  questions?: QuizQuestion[];
  resources?: { title: string; url: string; }[];
  matchingExercise?: { term: string; definition: string; }[];
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
    videoId: '3OamzN90kPg',
    questions: [
      {
        prompt: 'Why is accessing an array element by index an O(1) operation?',
        options: ['It searches sequentially', 'It calculates the exact memory address using math', 'Arrays are small', 'It uses a hash function'],
        answerIndex: 1,
        explanation: 'Arrays store elements in contiguous memory. The address of any element is just base_address + (index * element_size).'
      },
      {
        prompt: 'Why is inserting into the middle of an array slow?',
        options: ['Memory fragmentation', 'Garbage collection', 'Every subsequent element must be shifted right', 'Hash collision'],
        answerIndex: 2,
        explanation: 'To maintain contiguous memory, all elements after the insertion point must be moved.'
      },
      {
        prompt: 'What happens when a dynamic array (ArrayList / vector) runs out of space?',
        options: ['It throws an OutOfMemory error', 'It allocates a larger block of memory and copies elements over', 'It adds a pointer to a new small array', 'It overwrites the oldest element'],
        answerIndex: 1,
        explanation: 'Dynamic arrays typically double their size when full. They allocate a new, larger block of memory and copy the old elements into it.'
      }
    ],
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
    videoId: 'njTh_OwMljA',
    questions: [
      {
        prompt: 'What is the primary advantage of a Linked List over an Array?',
        options: ['O(1) random access', 'O(1) insertion at the head without shifting elements', 'Lower memory overhead', 'Better CPU cache locality'],
        answerIndex: 1,
        explanation: 'Linked lists do not require contiguous memory, so you can insert a new node at the head just by changing pointers in O(1) time.'
      },
      {
        prompt: 'What is the time complexity to insert a new node at the HEAD of a linked list?',
        options: ['O(1)', 'O(N)', 'O(log N)', 'O(N²)'],
        answerIndex: 0,
        explanation: 'Inserting at the head takes O(1) time because you only need to create a new node, point it to the current head, and update the head reference. No traversal is needed.'
      },
      {
        prompt: 'What is a "Doubly Linked List"?',
        options: ['A list where every node has two values', 'A list where nodes point to both their next and previous neighbors', 'A list that contains a duplicate of every node', 'Two linked lists merged into one'],
        answerIndex: 1,
        explanation: 'A doubly linked list adds a "prev" pointer to every node, allowing you to easily traverse backwards at the cost of slightly more memory.'
      }
    ],
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
    videoId: 'wjI1WNcIntg',
    questions: [
      {
        prompt: 'Which data structure would you use to implement an "Undo" feature?',
        options: ['Queue', 'Stack', 'Linked List', 'Hash Table'],
        answerIndex: 1,
        explanation: 'Undo features require Last-In-First-Out (LIFO) behavior. The most recent action is the first one undone, perfectly matching a Stack.'
      },
      {
        prompt: 'Which data structure is best for managing a printer spooler (printing jobs in the order they arrive)?',
        options: ['Stack', 'Queue', 'Array', 'Tree'],
        answerIndex: 1,
        explanation: 'A printer spooler requires First-In-First-Out (FIFO) behavior so the first job submitted is printed first, perfectly matching a Queue.'
      },
      {
        prompt: 'What happens if you try to Pop from an empty Stack?',
        options: ['Null Pointer Exception', 'Stack Overflow', 'Stack Underflow', 'Deadlock'],
        answerIndex: 2,
        explanation: 'Attempting to remove an item from an empty stack causes a "Stack Underflow" error.'
      }
    ],
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
    videoId: 'shs0KM3wKv8',
    questions: [
      {
        prompt: 'What happens when two keys in a Hash Table hash to the same index?',
        options: ['The older key is deleted', 'An exception is thrown', 'A collision occurs and is resolved via chaining or probing', 'The table immediately doubles in size'],
        answerIndex: 2,
        explanation: 'Collisions are normal. In chaining, the index stores a linked list of values. In probing, the table looks for the next empty slot.'
      }
    ],
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
    videoId: 'P3YID7liBug',
    questions: [
      {
        prompt: 'What is the prerequisite for using Binary Search?',
        options: ['The array must be perfectly balanced', 'The array must be sorted', 'The array must contain numbers only', 'The array must have an odd length'],
        answerIndex: 1,
        explanation: 'Binary search relies on the fact that if a value is smaller than the midpoint, the target MUST be in the left half. This only holds true if the array is sorted.'
      }
    ],
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
    videoId: '4VqmGXwpLqc',
    questions: [
      {
        prompt: 'What does it mean for a sorting algorithm to be "stable"?',
        options: ['It never crashes', 'It takes exactly O(N log N) time', 'Equal elements retain their original relative order', 'It uses O(1) extra space'],
        answerIndex: 2,
        explanation: 'Stability is crucial when sorting by multiple criteria. If you sort by First Name, then by Last Name, a stable sort keeps the First Names sorted within identical Last Names.'
      }
    ],
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
    videoId: 'DfljaUwZsOk',
    questions: [
      {
        prompt: 'Which type of problem is best suited for the Sliding Window technique?',
        options: ['Finding the shortest path in a graph', 'Finding the maximum sum of a contiguous subarray', 'Sorting a list of integers', 'Balancing a binary tree'],
        answerIndex: 1,
        explanation: 'Sliding window is designed for contiguous sequences (subarrays or substrings) where we need to find an optimal range.'
      }
    ],
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
    videoId: 'Yan0cv2cLy8',
    questions: [
      {
        prompt: 'What is the main danger of a Greedy Algorithm?',
        options: ['They are too slow', 'They use too much memory', 'They make locally optimal choices that might not lead to the global optimum', 'They always require floating-point math'],
        answerIndex: 2,
        explanation: 'Greedy algorithms never look back. If the best immediate choice traps you into a terrible long-term outcome, the greedy approach fails.'
      }
    ],
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
    videoId: 'oSWTXtMglKE',
    questions: [
      {
        prompt: 'In a Binary Search Tree (BST), where is the smallest element located?',
        options: ['At the root', 'The leftmost leaf', 'The rightmost leaf', 'Randomly distributed'],
        answerIndex: 1,
        explanation: 'Because every left child is smaller than its parent, traversing left as far as possible guarantees finding the absolute minimum.'
      }
    ],
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
    videoId: 'zaBhtODEL0w',
    questions: [
      {
        prompt: 'Which traversal algorithm is guaranteed to find the shortest path in an unweighted graph?',
        options: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'Topological Sort', 'Pre-order Traversal'],
        answerIndex: 1,
        explanation: 'BFS explores the graph in concentric circles (levels). The first time it reaches a node, it is guaranteed to have taken the fewest possible steps.'
      }
    ],
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
    videoId: 't0Cq6tVNRBA',
    questions: [
      {
        prompt: 'How is a Binary Heap typically represented in memory?',
        options: ['A network of Node objects with pointers', 'A flat array', 'A hash map', 'A linked list'],
        answerIndex: 1,
        explanation: 'Heaps are complete binary trees, which means they map perfectly to arrays. The left child of index i is at 2i+1, and the right child is at 2i+2.'
      }
    ],
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
    videoId: 'zIjfhVPRZCg',
    questions: [
      {
        prompt: 'Why use a Trie instead of a Hash Set for storing a dictionary of words?',
        options: ['Tries are built into JavaScript', 'Tries use less memory when many words share prefixes', 'Tries allow O(1) lookups regardless of word length', 'Tries automatically sort numbers'],
        answerIndex: 1,
        explanation: 'Words like "car", "cart", and "card" all share the "car" branch in a Trie, heavily compressing the required memory compared to storing full strings in a Hash Set.'
      }
    ],
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
    videoId: '0jNmHPfA_yE',
    questions: [
      {
        prompt: 'What optimization makes Union-Find nearly O(1)?',
        options: ['Memoization', 'Path Compression', 'Binary Search', 'Sliding Window'],
        answerIndex: 1,
        explanation: 'Path compression flattens the tree. Whenever you look up a node\'s root, you update it to point directly to the root, making all future lookups instant.'
      }
    ],
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
    videoId: 'P8Xa2BitN3I',
    questions: [
      {
        prompt: 'What two properties must a problem have to be solved with Dynamic Programming?',
        options: ['Negative edges and cycles', 'Optimal substructure and overlapping subproblems', 'Sorted input and O(1) space constraints', 'Contiguous memory and LIFO behavior'],
        answerIndex: 1,
        explanation: 'Optimal substructure means the big problem can be broken into smaller problems. Overlapping subproblems means we calculate the SAME small problem multiple times, making it worth caching.'
      }
    ],
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
    videoId: 'Zq4upTEaQyM',
    questions: [
      {
        prompt: 'What is the purpose of "pruning" in a Backtracking algorithm?',
        options: ['To delete the original input array', 'To stop exploring a path as soon as it violates constraints', 'To convert the tree into a linked list', 'To sort the results'],
        answerIndex: 1,
        explanation: 'By abandoning a path the moment it becomes invalid (pruning), backtracking avoids exploring millions of useless permutations.'
      }
    ],
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
    videoId: 'NLKQEOgBAnw',
    questions: [
      {
        prompt: 'What does the bitwise left shift operator (<<) effectively do to an integer?',
        options: ['Divides it by 2', 'Multiplies it by 2', 'Negates it', 'Converts it to a string'],
        answerIndex: 1,
        explanation: 'Shifting all bits to the left by 1 position doubles their positional value, multiplying the entire number by 2.'
      }
    ],
  },
  {
    id: 'pathfinding-astar',
    title: 'A* Pathfinding & Heuristics',
    shortTitle: 'A* Search',
    category: 'Algorithms',
    description: 'Find the shortest path efficiently by combining Dijkstra\'s actual distance with a greedy heuristic estimate.',
    goal: 'Understand how heuristics prevent exploring the wrong direction.',
    complexity: 'O(E log V) with Min-Heap',
    icon: Network,
    accent: 'cyan',
    concepts: ['Heuristics', 'Manhattan Distance', 'F = G + H', 'Priority Queue'],
    whyItMatters: 'A* is the industry standard for game AI, GPS routing, and robotics path planning because it balances speed and accuracy.',
    steps: [
      { title: 'Track actual cost (G)', detail: 'Like Dijkstra, track the exact distance from the start to the current node.' },
      { title: 'Guess remaining cost (H)', detail: 'Use a heuristic (like Manhattan distance) to estimate how far we are from the goal.' },
      { title: 'Pick the lowest F', detail: 'Always explore the node with the lowest F = G + H, pulling the search toward the target.' }
    ],
    interviewPrompt: 'What happens to A* if the heuristic overestimates the distance to the goal?',
    videoId: 'ySN5Wnu88nE',
    questions: [
      {
        prompt: 'Which heuristic is best for a grid that only allows 4-way movement (up, down, left, right)?',
        options: ['Euclidean Distance', 'Manhattan Distance', 'Chebyshev Distance', 'Zero (Dijkstra)'],
        answerIndex: 1,
        explanation: 'Manhattan distance counts the exact number of horizontal and vertical steps, perfectly matching 4-way movement constraints.'
      }
    ]
  },
  {
    id: 'cellular-automata',
    title: 'Cellular Automata',
    shortTitle: 'Automata',
    category: 'Advanced techniques',
    description: 'Use simple neighbor rules to simulate organic cave generation and Conway\'s Game of Life.',
    goal: 'Learn how complex, organic structures emerge from incredibly simple local rules.',
    complexity: 'O(W × H) per generation',
    icon: Boxes,
    accent: 'green',
    concepts: ['Cell states', 'Moore Neighborhood', 'Generations', 'Emergence'],
    whyItMatters: 'CA is used for procedural generation (like Terraria/Spelunky caves), fluid dynamics, and biological simulations.',
    steps: [
      { title: 'Randomize the grid', detail: 'Start with a completely random noise of solid and empty cells (e.g. 45% solid).' },
      { title: 'Count neighbors', detail: 'For every cell, count how many of its 8 surrounding neighbors are solid.' },
      { title: 'Apply the rule', detail: 'If a cell has >4 solid neighbors, it becomes solid. Otherwise, it becomes empty. Repeat.' }
    ],
    interviewPrompt: 'Why must you use a double buffer (read from old grid, write to new grid) when simulating a cellular automaton?',
    videoId: 'C2vgICfQawE',
    questions: [
      {
        prompt: 'What happens if you update the grid in-place (without a double buffer) during a CA step?',
        options: ['It runs faster and works fine', 'The changes cascade and corrupt the state for subsequent cells', 'The grid becomes completely solid', 'Nothing changes'],
        answerIndex: 1,
        explanation: 'Updating in-place means later cells read the "new" state of earlier cells instead of the "old" state, destroying the synchronous nature of the generation.'
      }
    ]
  },
  {
    id: 'bsp-trees',
    title: 'BSP Dungeon Generation',
    shortTitle: 'BSP Trees',
    category: 'Trees & graphs',
    description: 'Slice a 2D space into smaller and smaller rectangles to generate structured rooms and corridors.',
    goal: 'Apply binary trees to spatial partitioning for procedural generation.',
    complexity: 'O(N log N) space partitioning',
    icon: GitBranch,
    accent: 'amber',
    concepts: ['Spatial Partitioning', 'Recursion', 'Binary Trees', 'Corridor routing'],
    whyItMatters: 'BSP trees were famously used in Doom for rendering, and are the gold standard for generating structured, connected dungeon layouts.',
    steps: [
      { title: 'Split the space', detail: 'Take the main rectangular area and slice it randomly either horizontally or vertically.' },
      { title: 'Recurse', detail: 'Treat both new halves as their own areas and split them again until they are small enough.' },
      { title: 'Carve rooms', detail: 'Create a room inside the bounds of the "leaf" nodes (the final, smallest splits).' }
    ],
    interviewPrompt: 'How do you guarantee that all rooms in a BSP dungeon are connected?',
    videoId: 'TlLIOgWYVpI',
    questions: [
      {
        prompt: 'In a BSP dungeon, how do you easily connect rooms?',
        options: ['Pick random rooms and draw lines', 'Connect sibling nodes in the tree, then connect parent nodes', 'Run A* between every single room', 'Let them overlap'],
        answerIndex: 1,
        explanation: 'Because a parent node was split into two sibling nodes, you know exactly where they touch. Connecting siblings recursively guarantees the whole dungeon is connected.'
      }
    ]

  },

  {
    id: 'load-balancing',
    title: 'Load Balancing & Scale',
    shortTitle: 'Load Balancers',
    category: 'System Design',
    description: 'Learn how massive systems distribute traffic across multiple servers to ensure high availability and reliability.',
    goal: 'Understand consistent hashing, round-robin, and failover.',
    complexity: 'Availability: 99.999% · Latency: Low',
    icon: Server,
    accent: 'amber',
    concepts: ['Horizontal Scaling', 'Consistent Hashing', 'Health Checks', 'L4 vs L7 Load Balancing'],
    whyItMatters: 'Without load balancers, a single server failure would take down an entire application.',
    steps: [
      { title: 'The Bottleneck', detail: 'A single server can only handle so many concurrent connections before crashing.' },
      { title: 'Distributing Traffic', detail: 'A load balancer acts as a reverse proxy, routing incoming requests to healthy instances.' },
      { title: 'Consistent Hashing', detail: 'Ensures that adding or removing a server minimalizes the re-mapping of existing sessions.' }
    ],
    interviewPrompt: 'Design a system that handles 10 million concurrent WebSocket connections. Where do you put the load balancer?',
    videoId: 'K0Ta65OqQkY',
    questions: [
      {
        prompt: 'Which load balancing strategy sends requests to servers in sequential order?',
        options: ['Least Connections', 'Round Robin', 'IP Hash', 'Random'],
        answerIndex: 1,
        explanation: 'Round Robin loops through the list of servers sequentially.'
      }
    ]
  },
  {
    id: 'microservices',
    title: 'Microservices Architecture',
    shortTitle: 'Microservices',
    category: 'System Design',
    description: 'Deconstruct monolithic applications into small, independent, and loosely coupled services.',
    goal: 'Learn event-driven architectures, service discovery, and the API gateway pattern.',
    complexity: 'Coupling: Low · Overhead: High',
    icon: Database,
    accent: 'violet',
    concepts: ['API Gateways', 'Service Discovery', 'Saga Pattern', 'Event Sourcing'],
    whyItMatters: 'Microservices allow large engineering teams to scale development by decoupling deployment cycles.',
    steps: [
      { title: 'The Monolith', detail: 'All logic is compiled into a single executable. Simple to deploy, hard to scale.' },
      { title: 'Decomposition', detail: 'Splitting by business domain (e.g. Auth Service, Billing Service).' },
      { title: 'Communication', detail: 'Services communicate via synchronous REST/gRPC or asynchronous message queues (Kafka, RabbitMQ).' }
    ],
    interviewPrompt: 'How would you handle a distributed transaction across three different microservices if the second one fails?',
    videoId: '1xo-0gCVhWE',
    questions: [
      {
        prompt: 'What pattern is commonly used to manage distributed transactions in microservices?',
        options: ['Two-Phase Commit (2PC)', 'Saga Pattern', 'Circuit Breaker', 'Bulkhead'],
        answerIndex: 1,
        explanation: 'The Saga Pattern breaks a transaction into a series of local transactions with compensating actions if one fails.'
      }
    ]
  },
  {
    id: 'neural-networks',
    title: 'Neural Networks Basics',
    shortTitle: 'Neural Nets',
    category: 'Machine Learning',
    description: 'An introduction to artificial neurons, layers, and how they combine to approximate complex functions.',
    goal: 'Understand weights, biases, and activation functions.',
    complexity: 'Inference: Fast · Training: Slow',
    icon: BrainCircuit,
    accent: 'cyan',
    concepts: ['Perceptrons', 'Activation Functions', 'Hidden Layers', 'Forward Propagation'],
    whyItMatters: 'Neural networks are the foundational building blocks for modern AI, from LLMs to computer vision.',
    steps: [
      { title: 'The Neuron', detail: 'Takes multiple inputs, multiplies them by weights, adds a bias, and passes the sum through an activation function.' },
      { title: 'Stacking Layers', detail: 'Hidden layers allow the network to learn non-linear representations of the data.' },
      { title: 'Forward Pass', detail: 'Data flows from the input layer to the output layer to generate a prediction.' }
    ],
    interviewPrompt: 'Write a simple Python script to perform a forward pass of a 2-layer neural network using NumPy.',
    videoId: 'aircAruvnKk',
    questions: [
      {
        prompt: 'Which activation function outputs a value between 0 and 1?',
        options: ['ReLU', 'Sigmoid', 'Tanh', 'Linear'],
        answerIndex: 1,
        explanation: 'Sigmoid squeezes all real numbers into the range (0, 1), often used for binary classification.'
      }
    ]
  },
  {
    id: 'gradient-descent',
    title: 'Gradient Descent',
    shortTitle: 'Gradient Descent',
    category: 'Machine Learning',
    description: 'The optimization algorithm that trains neural networks by minimizing the loss function.',
    goal: 'Learn about loss surfaces, learning rates, and backpropagation.',
    complexity: 'Optimization: Iterative',
    icon: TrendingDown,
    accent: 'green',
    concepts: ['Loss Function', 'Learning Rate', 'Backpropagation', 'Stochastic Gradient Descent'],
    whyItMatters: 'Without gradient descent, neural networks would be unable to learn from data.',
    steps: [
      { title: 'Calculate Error', detail: 'Measure how far off the prediction was from the actual target using a Loss Function.' },
      { title: 'Find the Gradient', detail: 'Use calculus (backpropagation) to determine which direction to adjust the weights to reduce the error.' },
      { title: 'Step Down', detail: 'Update the weights by taking a small step (determined by the learning rate) in the opposite direction of the gradient.' }
    ],
    interviewPrompt: 'Explain the difference between Batch Gradient Descent and Stochastic Gradient Descent (SGD).',
    videoId: 'IHZwWFHWa-w',
    questions: [
      {
        prompt: 'What happens if the learning rate is set too high?',
        options: ['The model trains faster and perfectly converges.', 'The model learns nothing because gradients are 0.', 'The optimization may diverge, jumping over the minimum.', 'The loss becomes exactly 0 immediately.'],
        answerIndex: 2,
        explanation: 'A very large learning rate causes the weight updates to overshoot the minimum, often leading to divergence.'
      }
    ]
  },
  {
    id: 'react-architecture',
    title: 'React Architecture & VDOM',
    shortTitle: 'React VDOM',
    category: 'Web Architecture',
    description: 'Dive deep into how modern frontend frameworks render UIs efficiently using Virtual DOM and Reconciliation.',
    goal: 'Understand the rendering lifecycle and why mutating state directly is bad.',
    complexity: 'Diffing: O(n) via heuristics',
    icon: AppWindow,
    accent: 'cyan',
    concepts: ['Virtual DOM', 'Reconciliation', 'Fiber Architecture', 'Hooks'],
    whyItMatters: 'Mastering the VDOM allows you to write highly performant web applications and avoid unnecessary re-renders.',
    steps: [
      { title: 'The Virtual DOM', detail: 'An in-memory representation of the actual DOM. It is cheap to create and update.' },
      { title: 'Diffing Algorithm', detail: 'React compares the new VDOM with the old one to find the minimum set of changes required.' },
      { title: 'Commit Phase', detail: 'The actual DOM is updated only with the necessary changes, maximizing performance.' }
    ],
    interviewPrompt: 'Implement a basic custom hook in React that tracks the previous value of a state variable.',
    videoId: '7YhdqIR2Yzo',
    questions: [
      {
        prompt: 'Why does React require a "key" prop when rendering a list of items?',
        options: ['To style the items correctly.', 'To help the reconciler identify which items have changed, are added, or are removed.', 'To prevent XSS attacks.', 'To sort the items.'],
        answerIndex: 1,
        explanation: 'Keys give React a stable identity for elements, allowing the diffing algorithm to efficiently update lists without re-rendering everything.'
      }
    ]
  },
  {
    id: 'caching-strategies',
    title: 'Caching Strategies',
    shortTitle: 'Caching',
    category: 'System Design',
    description: 'Techniques to temporarily store copies of data to serve future requests faster.',
    goal: 'Master Read-Through, Write-Through, and Cache Invalidation.',
    complexity: 'Access: O(1) · Cache Miss: Expensive',
    icon: Zap,
    accent: 'amber',
    concepts: ['LRU Cache', 'Write-Around', 'Cache Invalidation', 'Redis/Memcached'],
    whyItMatters: 'Caching is the single most effective way to improve the latency and throughput of read-heavy applications.',
    steps: [
      { title: 'The Cache Hit', detail: 'If the data is in the cache (e.g. Redis), return it immediately.' },
      { title: 'The Cache Miss', detail: 'If the data is missing, fetch it from the primary database, store it in the cache, and return it.' },
      { title: 'Invalidation', detail: 'The hardest problem in computer science: knowing when to delete stale data from the cache.' }
    ],
    interviewPrompt: 'Design a Least Recently Used (LRU) Cache in your language of choice. What data structures would you use?',
    videoId: 'dCGvNq2sDkk',
    questions: [
      {
        prompt: 'Which strategy involves writing data to the cache AND the database simultaneously?',
        options: ['Write-Behind', 'Write-Through', 'Read-Through', 'Write-Around'],
        answerIndex: 1,
        explanation: 'Write-Through caching ensures data consistency between cache and DB, but adds latency to write operations.'
      }
    ]
  }
];


export function getCourseLesson(id?: string): CourseLesson | undefined {
  return COURSE_LESSONS.find(lesson => lesson.id === id);
}

export const COURSE_CATEGORIES: CourseCategory[] = ['Linear structures', 'Trees & graphs', 'Algorithms', 'System Design', 'Machine Learning', 'Web Architecture', 'Advanced techniques'];

export const COURSE_CATEGORY_ICONS: Record<CourseCategory, LucideIcon> = {
  'System Design': Server,
  'Machine Learning': BrainCircuit,
  'Web Architecture': AppWindow,
  'Linear structures': Brackets,
  'Trees & graphs': ListTree,
  'Algorithms': Workflow,
  'Advanced techniques': Cpu,
};

COURSE_LESSONS.forEach(lesson => {
  const customResources = ({"arrays":[{"title":"Arrays - GeeksforGeeks","url":"https://www.geeksforgeeks.org/array-data-structure/"},{"title":"Dynamic Array - Wikipedia","url":"https://en.wikipedia.org/wiki/Dynamic_array"}],"linked-lists":[{"title":"Linked List - GeeksforGeeks","url":"https://www.geeksforgeeks.org/data-structures/linked-list/"},{"title":"Linked List - Wikipedia","url":"https://en.wikipedia.org/wiki/Linked_list"}],"stacks-queues":[{"title":"Stack Data Structure","url":"https://www.geeksforgeeks.org/stack-data-structure/"},{"title":"Queue Data Structure","url":"https://www.geeksforgeeks.org/queue-data-structure/"}],"hash-tables":[{"title":"Hash Table - Wikipedia","url":"https://en.wikipedia.org/wiki/Hash_table"},{"title":"Hashing Data Structure","url":"https://www.geeksforgeeks.org/hashing-data-structure/"}],"trees":[{"title":"Tree Data Structure","url":"https://www.geeksforgeeks.org/tree-data-structure/"},{"title":"Binary Tree - Wikipedia","url":"https://en.wikipedia.org/wiki/Binary_tree"}],"graphs":[{"title":"Graph Data Structure","url":"https://www.geeksforgeeks.org/graph-data-structure-and-algorithm/"},{"title":"Graph Theory - Wikipedia","url":"https://en.wikipedia.org/wiki/Graph_theory"}],"load-balancing":[{"title":"Load Balancing - NGINX","url":"https://www.nginx.com/resources/glossary/load-balancing/"},{"title":"What is Load Balancing?","url":"https://aws.amazon.com/what-is/load-balancing/"}],"microservices":[{"title":"Microservices - Martin Fowler","url":"https://martinfowler.com/articles/microservices.html"},{"title":"Microservices Architecture","url":"https://microservices.io/"}],"neural-networks":[{"title":"Neural Networks - IBM","url":"https://www.ibm.com/topics/neural-networks"},{"title":"Artificial Neural Network - Wikipedia","url":"https://en.wikipedia.org/wiki/Artificial_neural_network"}],"gradient-descent":[{"title":"Gradient Descent - Wikipedia","url":"https://en.wikipedia.org/wiki/Gradient_descent"},{"title":"Understanding Gradient Descent","url":"https://towardsdatascience.com/understanding-the-mathematics-behind-gradient-descent-dde5dc9be06e"}],"react-architecture":[{"title":"React Reconciliation","url":"https://react.dev/learn/preserving-and-resetting-state"},{"title":"Virtual DOM - React Docs","url":"https://legacy.reactjs.org/docs/faq-internals.html"}],"caching-strategies":[{"title":"Caching Strategies","url":"https://docs.aws.amazon.com/AmazonElastiCache/latest/mem-ug/Strategies.html"},{"title":"All about caching","url":"https://hazelcast.com/glossary/caching/"}]} as Record<string, any>)[lesson.id] || [];
  lesson.resources = [
    ...customResources,
    { title: lesson.title + ' on freeCodeCamp', url: 'https://www.freecodecamp.org/news/search/?q=' + encodeURIComponent(lesson.title) }
  ];
});


COURSE_LESSONS.forEach(lesson => {
  if (lesson.id === 'arrays') {
    lesson.matchingExercise = [
      { term: 'O(1)', definition: 'Time complexity to access an element by index.' },
      { term: 'O(n)', definition: 'Time complexity to insert at the beginning of an array.' },
      { term: 'Contiguous', definition: 'How elements are stored in memory.' },
      { term: 'Capacity', definition: 'The total allocated size before needing a resize.' }
    ];
  } else if (lesson.id === 'linked-lists') {
    lesson.matchingExercise = [
      { term: 'Node', definition: 'An object containing data and a reference to the next object.' },
      { term: 'Head', definition: 'The first element in a linked list.' },
      { term: 'O(1) Insertion', definition: 'Adding an element when you already have the reference to the node.' },
      { term: 'O(n) Access', definition: 'Finding an element at a specific index.' }
    ];
  } else {
    // Generic fallback for others
    lesson.matchingExercise = [
      { term: 'Time Complexity', definition: 'How runtime scales with input size.' },
      { term: 'Space Complexity', definition: 'How memory usage scales with input size.' },
      { term: 'Edge Case', definition: 'Extreme problem parameters that require special handling.' },
      { term: 'Brute Force', definition: 'The most straightforward, often least efficient solution.' }
    ];
  }
});
