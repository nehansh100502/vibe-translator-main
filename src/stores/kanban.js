import { writable, derived } from 'svelte/store';

// Generate unique IDs
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Initial board data
const initialColumns = [
  {
    id: 'todo',
    title: 'To Do',
    cards: [
      { id: generateId(), title: 'Research competitors', description: 'Analyze top 5 competitors in the market', priority: 'high' },
      { id: generateId(), title: 'Design wireframes', description: 'Create initial wireframes for the dashboard', priority: 'medium' },
      { id: generateId(), title: 'Setup CI/CD pipeline', description: 'Configure GitHub Actions for automated deployment', priority: 'low' }
    ]
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    cards: [
      { id: generateId(), title: 'Implement authentication', description: 'Add OAuth2 login with Google and GitHub', priority: 'high' },
      { id: generateId(), title: 'Write unit tests', description: 'Cover core business logic with tests', priority: 'medium' }
    ]
  },
  {
    id: 'review',
    title: 'In Review',
    cards: [
      { id: generateId(), title: 'API documentation', description: 'Document all REST endpoints with OpenAPI', priority: 'medium' }
    ]
  },
  {
    id: 'done',
    title: 'Done',
    cards: [
      { id: generateId(), title: 'Project setup', description: 'Initialize repository and configure tooling', priority: 'low' },
      { id: generateId(), title: 'Database schema', description: 'Design and implement database models', priority: 'high' }
    ]
  }
];

// Create the main store
function createKanbanStore() {
  const { subscribe, set, update } = writable(initialColumns);

  return {
    subscribe,
    
    // Add a new card to a column
    addCard: (columnId, card) => {
      update(columns => {
        return columns.map(col => {
          if (col.id === columnId) {
            return {
              ...col,
              cards: [...col.cards, { ...card, id: generateId() }]
            };
          }
          return col;
        });
      });
    },

    // Update an existing card
    updateCard: (columnId, cardId, updates) => {
      update(columns => {
        return columns.map(col => {
          if (col.id === columnId) {
            return {
              ...col,
              cards: col.cards.map(card => 
                card.id === cardId ? { ...card, ...updates } : card
              )
            };
          }
          return col;
        });
      });
    },

    // Delete a card
    deleteCard: (columnId, cardId) => {
      update(columns => {
        return columns.map(col => {
          if (col.id === columnId) {
            return {
              ...col,
              cards: col.cards.filter(card => card.id !== cardId)
            };
          }
          return col;
        });
      });
    },

    // Move a card within the same column
    moveCardInColumn: (columnId, fromIndex, toIndex) => {
      update(columns => {
        return columns.map(col => {
          if (col.id === columnId) {
            const newCards = [...col.cards];
            const [movedCard] = newCards.splice(fromIndex, 1);
            newCards.splice(toIndex, 0, movedCard);
            return { ...col, cards: newCards };
          }
          return col;
        });
      });
    },

    // Move a card to a different column
    moveCardToColumn: (fromColumnId, toColumnId, cardId, toIndex) => {
      update(columns => {
        let movedCard = null;
        
        // First, find and remove the card from source column
        const updatedColumns = columns.map(col => {
          if (col.id === fromColumnId) {
            const cardIndex = col.cards.findIndex(c => c.id === cardId);
            if (cardIndex !== -1) {
              movedCard = col.cards[cardIndex];
              return {
                ...col,
                cards: col.cards.filter(c => c.id !== cardId)
              };
            }
          }
          return col;
        });

        // Then, add the card to the destination column
        if (movedCard) {
          return updatedColumns.map(col => {
            if (col.id === toColumnId) {
              const newCards = [...col.cards];
              const insertIndex = toIndex !== undefined ? toIndex : newCards.length;
              newCards.splice(insertIndex, 0, movedCard);
              return { ...col, cards: newCards };
            }
            return col;
          });
        }

        return updatedColumns;
      });
    },

    // Add a new column
    addColumn: (title) => {
      update(columns => [
        ...columns,
        { id: generateId(), title, cards: [] }
      ]);
    },

    // Update column title
    updateColumnTitle: (columnId, title) => {
      update(columns => {
        return columns.map(col => 
          col.id === columnId ? { ...col, title } : col
        );
      });
    },

    // Delete a column
    deleteColumn: (columnId) => {
      update(columns => columns.filter(col => col.id !== columnId));
    },

    // Reset to initial state
    reset: () => set(initialColumns)
  };
}

export const kanbanStore = createKanbanStore();

// Derived store for total card count
export const totalCards = derived(kanbanStore, $columns => 
  $columns.reduce((sum, col) => sum + col.cards.length, 0)
);

// Derived store for cards by priority
export const cardsByPriority = derived(kanbanStore, $columns => {
  const all = $columns.flatMap(col => col.cards);
  return {
    high: all.filter(c => c.priority === 'high').length,
    medium: all.filter(c => c.priority === 'medium').length,
    low: all.filter(c => c.priority === 'low').length
  };
});

// Store for drag state
export const dragState = writable({
  isDragging: false,
  draggedCard: null,
  sourceColumnId: null
});
