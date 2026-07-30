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
} from 'lucide-react';

export type CourseCategory = 'Linear structures' | 'Algorithms' | 'Trees & graphs';
export type CourseId =
  | 'arrays'
  | 'linked-lists'
  | 'stacks-queues'
  | 'searching'
  | 'sorting'
  | 'trees'
  | 'graphs';

export interface LessonStep {
  title: string;
  detail: string;
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
];

export function getCourseLesson(id?: string): CourseLesson | undefined {
  return COURSE_LESSONS.find(lesson => lesson.id === id);
}

export const COURSE_CATEGORIES: CourseCategory[] = ['Linear structures', 'Algorithms', 'Trees & graphs'];

export const COURSE_CATEGORY_ICONS: Record<CourseCategory, LucideIcon> = {
  'Linear structures': Brackets,
  Algorithms: Binary,
  'Trees & graphs': Boxes,
};