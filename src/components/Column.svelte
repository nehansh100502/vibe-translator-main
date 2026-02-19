<script>
  import { createEventDispatcher } from 'svelte';
  import Card from './Card.svelte';
  import { dragState } from '../stores/kanban.js';

  export let column;

  const dispatch = createEventDispatcher();

  let isAddingCard = false;
  let newCardTitle = '';
  let newCardDescription = '';
  let newCardPriority = 'medium';
  let isEditingTitle = false;
  let editedTitle = column.title;
  let dropTargetIndex = null;

  $: isDragOver = false;

  function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    isDragOver = true;

    // Calculate drop position based on mouse position
    const cards = event.currentTarget.querySelectorAll('.card');
    const mouseY = event.clientY;
    let targetIndex = column.cards.length;

    for (let i = 0; i < cards.length; i++) {
      const rect = cards[i].getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (mouseY < midY) {
        targetIndex = i;
        break;
      }
    }
    dropTargetIndex = targetIndex;
  }

  function handleDragLeave(event) {
    // Only set isDragOver to false if we're leaving the column entirely
    const rect = event.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = event;
    
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      isDragOver = false;
      dropTargetIndex = null;
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    isDragOver = false;
    
    const data = JSON.parse(event.dataTransfer.getData('text/plain'));
    const { cardId, sourceColumnId, sourceIndex } = data;

    if (sourceColumnId === column.id) {
      // Same column - reorder
      if (dropTargetIndex !== null && dropTargetIndex !== sourceIndex) {
        dispatch('moveInColumn', {
          columnId: column.id,
          fromIndex: sourceIndex,
          toIndex: dropTargetIndex > sourceIndex ? dropTargetIndex - 1 : dropTargetIndex
        });
      }
    } else {
      // Different column - move
      dispatch('moveToColumn', {
        fromColumnId: sourceColumnId,
        toColumnId: column.id,
        cardId,
        toIndex: dropTargetIndex
      });
    }
    
    dropTargetIndex = null;
  }

  function startAddingCard() {
    isAddingCard = true;
    newCardTitle = '';
    newCardDescription = '';
    newCardPriority = 'medium';
  }

  function cancelAddCard() {
    isAddingCard = false;
    newCardTitle = '';
    newCardDescription = '';
  }

  function addCard() {
    if (newCardTitle.trim()) {
      dispatch('addCard', {
        columnId: column.id,
        card: {
          title: newCardTitle.trim(),
          description: newCardDescription.trim(),
          priority: newCardPriority
        }
      });
      cancelAddCard();
    }
  }

  function handleAddCardKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      addCard();
    } else if (event.key === 'Escape') {
      cancelAddCard();
    }
  }

  function startEditingTitle() {
    editedTitle = column.title;
    isEditingTitle = true;
  }

  function saveTitle() {
    if (editedTitle.trim()) {
      dispatch('updateTitle', {
        columnId: column.id,
        title: editedTitle.trim()
      });
    }
    isEditingTitle = false;
  }

  function handleTitleKeydown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveTitle();
    } else if (event.key === 'Escape') {
      isEditingTitle = false;
    }
  }

  function handleUpdateCard(event) {
    dispatch('updateCard', {
      columnId: column.id,
      ...event.detail
    });
  }

  function handleDeleteCard(event) {
    dispatch('deleteCard', {
      columnId: column.id,
      ...event.detail
    });
  }

  function deleteColumn() {
    if (confirm(`Delete "${column.title}" and all its cards?`)) {
      dispatch('deleteColumn', { columnId: column.id });
    }
  }
</script>

<div 
  class="column"
  class:drag-over={isDragOver && $dragState.isDragging}
>
  <div class="column-header">
    {#if isEditingTitle}
      <input
        type="text"
        class="title-input"
        bind:value={editedTitle}
        on:blur={saveTitle}
        on:keydown={handleTitleKeydown}
        autofocus
      />
    {:else}
      <h3 class="column-title" on:dblclick={startEditingTitle}>
        {column.title}
        <span class="card-count">{column.cards.length}</span>
      </h3>
    {/if}
    <button class="btn-delete-column" on:click={deleteColumn} title="Delete column">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>

  <div 
    class="column-content"
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
    role="list"
  >
    {#each column.cards as card, index (card.id)}
      <div class="card-wrapper" class:drop-before={dropTargetIndex === index && isDragOver}>
        <Card 
          {card} 
          columnId={column.id}
          {index}
          on:update={handleUpdateCard}
          on:delete={handleDeleteCard}
        />
      </div>
    {/each}
    
    {#if isDragOver && dropTargetIndex === column.cards.length}
      <div class="drop-indicator"></div>
    {/if}

    {#if isAddingCard}
      <div class="add-card-form">
        <input
          type="text"
          class="new-card-title"
          bind:value={newCardTitle}
          on:keydown={handleAddCardKeydown}
          placeholder="Enter card title..."
          autofocus
        />
        <textarea
          class="new-card-description"
          bind:value={newCardDescription}
          placeholder="Description (optional)"
          rows="2"
        ></textarea>
        <select class="new-card-priority" bind:value={newCardPriority}>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <div class="add-card-actions">
          <button class="btn-add" on:click={addCard}>Add Card</button>
          <button class="btn-cancel" on:click={cancelAddCard}>Cancel</button>
        </div>
      </div>
    {:else}
      <button class="btn-add-card" on:click={startAddingCard}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add a card
      </button>
    {/if}
  </div>
</div>

<style>
  .column {
    background: #f1f5f9;
    border-radius: 12px;
    width: 300px;
    min-width: 300px;
    max-height: calc(100vh - 140px);
    display: flex;
    flex-direction: column;
    transition: background-color 0.2s ease;
  }

  .column.drag-over {
    background: #e2e8f0;
  }

  .column-header {
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #e2e8f0;
  }

  .column-title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: default;
  }

  .card-count {
    background: #cbd5e1;
    color: #475569;
    font-size: 12px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 10px;
  }

  .title-input {
    flex: 1;
    padding: 4px 8px;
    border: 1px solid #3b82f6;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    outline: none;
  }

  .btn-delete-column {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: #94a3b8;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.15s ease, color 0.15s ease, background-color 0.15s ease;
  }

  .column:hover .btn-delete-column {
    opacity: 1;
  }

  .btn-delete-column:hover {
    background: #fef2f2;
    color: #dc2626;
  }

  .column-content {
    padding: 8px 12px 12px;
    overflow-y: auto;
    flex: 1;
    min-height: 100px;
  }

  .card-wrapper {
    position: relative;
  }

  .card-wrapper.drop-before::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 0;
    right: 0;
    height: 3px;
    background: #3b82f6;
    border-radius: 2px;
  }

  .drop-indicator {
    height: 3px;
    background: #3b82f6;
    border-radius: 2px;
    margin: 4px 0;
  }

  .btn-add-card {
    width: 100%;
    padding: 8px 12px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: #64748b;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background-color 0.15s ease, color 0.15s ease;
  }

  .btn-add-card:hover {
    background: #e2e8f0;
    color: #475569;
  }

  .add-card-form {
    background: white;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .new-card-title {
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 14px;
  }

  .new-card-title:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .new-card-description {
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 12px;
    resize: vertical;
    font-family: inherit;
  }

  .new-card-description:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .new-card-priority {
    padding: 6px 8px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 12px;
    background: white;
  }

  .add-card-actions {
    display: flex;
    gap: 8px;
  }

  .btn-add,
  .btn-cancel {
    flex: 1;
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .btn-add {
    background: #3b82f6;
    color: white;
  }

  .btn-add:hover {
    background: #2563eb;
  }

  .btn-cancel {
    background: #f1f5f9;
    color: #64748b;
  }

  .btn-cancel:hover {
    background: #e2e8f0;
  }
</style>
