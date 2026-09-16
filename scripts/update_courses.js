import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../artifacts/pathforge/src/data/courseContent.ts');
let content = fs.readFileSync(filePath, 'utf-8');

const specificQuestions = {
  'arrays': `questions: [
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
      }
    ]`,
  'linked-lists': `questions: [
      {
        prompt: 'What is the primary advantage of a Linked List over an Array?',
        options: ['O(1) random access', 'O(1) insertion at the head without shifting elements', 'Lower memory overhead', 'Better CPU cache locality'],
        answerIndex: 1,
        explanation: 'Linked lists do not require contiguous memory, so you can insert a new node at the head just by changing pointers in O(1) time.'
      }
    ]`,
  'stacks-queues': `questions: [
      {
        prompt: 'Which data structure would you use to implement an "Undo" feature?',
        options: ['Queue', 'Stack', 'Linked List', 'Hash Table'],
        answerIndex: 1,
        explanation: 'Undo features require Last-In-First-Out (LIFO) behavior. The most recent action is the first one undone, perfectly matching a Stack.'
      }
    ]`,
  'hash-tables': `questions: [
      {
        prompt: 'What happens when two keys in a Hash Table hash to the same index?',
        options: ['The older key is deleted', 'An exception is thrown', 'A collision occurs and is resolved via chaining or probing', 'The table immediately doubles in size'],
        answerIndex: 2,
        explanation: 'Collisions are normal. In chaining, the index stores a linked list of values. In probing, the table looks for the next empty slot.'
      }
    ]`,
  'searching': `questions: [
      {
        prompt: 'What is the prerequisite for using Binary Search?',
        options: ['The array must be perfectly balanced', 'The array must be sorted', 'The array must contain numbers only', 'The array must have an odd length'],
        answerIndex: 1,
        explanation: 'Binary search relies on the fact that if a value is smaller than the midpoint, the target MUST be in the left half. This only holds true if the array is sorted.'
      }
    ]`,
  'sorting': `questions: [
      {
        prompt: 'What does it mean for a sorting algorithm to be "stable"?',
        options: ['It never crashes', 'It takes exactly O(N log N) time', 'Equal elements retain their original relative order', 'It uses O(1) extra space'],
        answerIndex: 2,
        explanation: 'Stability is crucial when sorting by multiple criteria. If you sort by First Name, then by Last Name, a stable sort keeps the First Names sorted within identical Last Names.'
      }
    ]`,
  'sliding-window': `questions: [
      {
        prompt: 'Which type of problem is best suited for the Sliding Window technique?',
        options: ['Finding the shortest path in a graph', 'Finding the maximum sum of a contiguous subarray', 'Sorting a list of integers', 'Balancing a binary tree'],
        answerIndex: 1,
        explanation: 'Sliding window is designed for contiguous sequences (subarrays or substrings) where we need to find an optimal range.'
      }
    ]`,
  'greedy': `questions: [
      {
        prompt: 'What is the main danger of a Greedy Algorithm?',
        options: ['They are too slow', 'They use too much memory', 'They make locally optimal choices that might not lead to the global optimum', 'They always require floating-point math'],
        answerIndex: 2,
        explanation: 'Greedy algorithms never look back. If the best immediate choice traps you into a terrible long-term outcome, the greedy approach fails.'
      }
    ]`,
  'trees': `questions: [
      {
        prompt: 'In a Binary Search Tree (BST), where is the smallest element located?',
        options: ['At the root', 'The leftmost leaf', 'The rightmost leaf', 'Randomly distributed'],
        answerIndex: 1,
        explanation: 'Because every left child is smaller than its parent, traversing left as far as possible guarantees finding the absolute minimum.'
      }
    ]`,
  'graphs': `questions: [
      {
        prompt: 'Which traversal algorithm is guaranteed to find the shortest path in an unweighted graph?',
        options: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'Topological Sort', 'Pre-order Traversal'],
        answerIndex: 1,
        explanation: 'BFS explores the graph in concentric circles (levels). The first time it reaches a node, it is guaranteed to have taken the fewest possible steps.'
      }
    ]`,
  'heaps': `questions: [
      {
        prompt: 'How is a Binary Heap typically represented in memory?',
        options: ['A network of Node objects with pointers', 'A flat array', 'A hash map', 'A linked list'],
        answerIndex: 1,
        explanation: 'Heaps are complete binary trees, which means they map perfectly to arrays. The left child of index i is at 2i+1, and the right child is at 2i+2.'
      }
    ]`,
  'tries': `questions: [
      {
        prompt: 'Why use a Trie instead of a Hash Set for storing a dictionary of words?',
        options: ['Tries are built into JavaScript', 'Tries use less memory when many words share prefixes', 'Tries allow O(1) lookups regardless of word length', 'Tries automatically sort numbers'],
        answerIndex: 1,
        explanation: 'Words like "car", "cart", and "card" all share the "car" branch in a Trie, heavily compressing the required memory compared to storing full strings in a Hash Set.'
      }
    ]`,
  'union-find': `questions: [
      {
        prompt: 'What optimization makes Union-Find nearly O(1)?',
        options: ['Memoization', 'Path Compression', 'Binary Search', 'Sliding Window'],
        answerIndex: 1,
        explanation: 'Path compression flattens the tree. Whenever you look up a node\'s root, you update it to point directly to the root, making all future lookups instant.'
      }
    ]`,
  'dynamic-programming': `questions: [
      {
        prompt: 'What two properties must a problem have to be solved with Dynamic Programming?',
        options: ['Negative edges and cycles', 'Optimal substructure and overlapping subproblems', 'Sorted input and O(1) space constraints', 'Contiguous memory and LIFO behavior'],
        answerIndex: 1,
        explanation: 'Optimal substructure means the big problem can be broken into smaller problems. Overlapping subproblems means we calculate the SAME small problem multiple times, making it worth caching.'
      }
    ]`,
  'backtracking': `questions: [
      {
        prompt: 'What is the purpose of "pruning" in a Backtracking algorithm?',
        options: ['To delete the original input array', 'To stop exploring a path as soon as it violates constraints', 'To convert the tree into a linked list', 'To sort the results'],
        answerIndex: 1,
        explanation: 'By abandoning a path the moment it becomes invalid (pruning), backtracking avoids exploring millions of useless permutations.'
      }
    ]`,
  'bit-manipulation': `questions: [
      {
        prompt: 'What does the bitwise left shift operator (<<) effectively do to an integer?',
        options: ['Divides it by 2', 'Multiplies it by 2', 'Negates it', 'Converts it to a string'],
        answerIndex: 1,
        explanation: 'Shifting all bits to the left by 1 position doubles their positional value, multiplying the entire number by 2.'
      }
    ]`
};

for (const [id, newQuestions] of Object.entries(specificQuestions)) {
  const split1 = content.split(`id: '${id}'`);
  if (split1.length === 2) {
    const before = split1[0];
    const after = split1[1];
    
    const qStart = after.indexOf('questions: [');
    if (qStart !== -1) {
      let qEnd = after.indexOf('    ]', qStart);
      const newAfter = after.substring(0, qStart) + newQuestions + after.substring(qEnd + 5);
      content = before + `id: '${id}'` + newAfter;
    }
  }
}

content = content.replace(/\| 'bit-manipulation';/, "| 'bit-manipulation'\n  | 'pathfinding-astar'\n  | 'cellular-automata'\n  | 'bsp-trees';");

const newCourses = `  },
  {
    id: 'pathfinding-astar',
    title: 'A* Pathfinding & Heuristics',
    shortTitle: 'A* Search',
    category: 'Algorithms',
    description: 'Find the shortest path efficiently by combining Dijkstra\\'s actual distance with a greedy heuristic estimate.',
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
    description: 'Use simple neighbor rules to simulate organic cave generation and Conway\\'s Game of Life.',
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
    videoId: 'v7SJgK4XQks',
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
`;

content = content.replace(/\n];\s*export function getCourseLesson/g, newCourses + '\n];\n\nexport function getCourseLesson');

fs.writeFileSync(filePath, content);
console.log('Course content updated!');
