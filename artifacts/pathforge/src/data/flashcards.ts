export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
}

export const FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-arrays-1',
    category: 'Linear structures',
    front: 'What is the time complexity of appending an element to a dynamic array?',
    back: 'Amortized O(1). Resizing takes O(n), but it happens infrequently enough that the average cost is constant.'
  },
  {
    id: 'fc-arrays-2',
    category: 'Linear structures',
    front: 'Why is inserting at the beginning of an array O(n)?',
    back: 'Because all existing elements must be shifted one position to the right in contiguous memory.'
  },
  {
    id: 'fc-linked-1',
    category: 'Linear structures',
    front: 'What is the main advantage of a Linked List over an Array?',
    back: 'O(1) insertion and deletion at known positions without needing to shift elements or resize.'
  },
  {
    id: 'fc-trees-1',
    category: 'Trees & graphs',
    front: 'What is the defining property of a Binary Search Tree (BST)?',
    back: 'For any node, all nodes in its left subtree are strictly smaller, and all nodes in its right subtree are strictly greater.'
  },
  {
    id: 'fc-graphs-1',
    category: 'Trees & graphs',
    front: 'Explain the difference between BFS and DFS.',
    back: 'BFS explores level-by-level (using a Queue), while DFS explores as deep as possible before backtracking (using a Stack).'
  },
  {
    id: 'fc-sysdesign-1',
    category: 'System Design',
    front: 'What is Consistent Hashing?',
    back: 'A routing strategy that minimizes key remapping when a node is added or removed, commonly used in distributed caches and load balancers.'
  },
  {
    id: 'fc-sysdesign-2',
    category: 'System Design',
    front: 'What is the Saga Pattern?',
    back: 'A sequence of local transactions where each updates data and triggers the next step. If a step fails, compensating transactions are executed to undo the previous steps.'
  },
  {
    id: 'fc-ml-1',
    category: 'Machine Learning',
    front: 'What is the purpose of an Activation Function in a neural network?',
    back: 'To introduce non-linearity, allowing the network to learn complex patterns instead of just linear transformations.'
  },
  {
    id: 'fc-ml-2',
    category: 'Machine Learning',
    front: 'What is the vanishing gradient problem?',
    back: 'When gradients become infinitesimally small during backpropagation in deep networks, preventing earlier layers from updating effectively.'
  },
  {
    id: 'fc-webarch-1',
    category: 'Web Architecture',
    front: 'What is Reconciliation in React?',
    back: 'The diffing algorithm React uses to compare the new Virtual DOM with the old one, determining the minimal set of real DOM updates required.'
  },
  {
    id: 'fc-cache-1',
    category: 'System Design',
    front: 'Explain Write-Through vs Write-Behind caching.',
    back: 'Write-Through updates cache and DB synchronously (safe, slower writes). Write-Behind updates cache immediately and DB asynchronously (fast writes, risk of data loss).'
  }
];
