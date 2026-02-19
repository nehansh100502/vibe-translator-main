<script>
  import Column from './Column.svelte';
  import { kanbanStore, totalCards, cardsByPriority } from '../stores/kanban.js';

  let isAddingColumn = false;
  let newColumnTitle = '';

  function handleAddCard(event) {
    kanbanStore.addCard(event.detail.columnId, event.detail.card);
  }

  function handleUpdateCard(event) {
    kanbanStore.updateCard(event.detail.columnId, event.detail.cardId, event.detail.updates);
  }

  function handleDeleteCard(event) {
    kanbanStore.deleteCard(event.detail.columnId, event.detail.cardId);
  }

  function handleMoveInColumn(event) {
    kanbanStore.moveCardInColumn(
      event.detail.columnId,
      event.detail.fromIndex,
      event.detail.toIndex
    );
  }

  function handleMoveToColumn(event) {
    kanbanStore.moveCardToColumn(
      event.detail.fromColumnId,
      event.detail.toColumnId,
      event.detail.cardId,
      event.detail.toIndex
    );
  }

  function handleUpdateTitle(event) {
    kanbanStore.updateColumnTitle(event.detail.columnId, event.detail.title);
  }

  function handleDeleteColumn(event) {
    kanbanStore.deleteColumn(event.detail.columnId);
  }

  function startAddingColumn() {
    isAddingColumn = true;
    newColumnTitle = '';
  }

  function addColumn() {
    if (newColumnTitle.trim()) {
      kanbanStore.addColumn(newColumnTitle.trim());
      isAddingColumn = false;
      newColumnTitle = '';
    }
  }

  function cancelAddColumn() {
    isAddingColumn = false;
    newColumnTitle = '';
  }

  function handleColumnKeydown(event) {
    if (event.key === 'Enter') {
      addColumn();
    } else if (event.key === 'Escape') {
      cancelAddColumn();
    }
  }
</script>

<div class="kanban-container">
  <header class="kanban-header">
    <div class="header-left">
      <h1>Kanban Board</h1>
      <div class="stats">
        <span class="stat-item">
          <span class="stat-value">{$totalCards}</span>
          <span class="stat-label">Total Cards</span>
        </span>
        <span class="stat-divider"></span>
        <span class="stat-item priority-high">
          <span class="stat-value">{$cardsByPriority.high}</span>
          <span class="stat-label">High</span>
        </span>
        <span class="stat-item priority-medium">
          <span class="stat-value">{$cardsByPriority.medium}</span>
          <span class="stat-label">Medium</span>
        </span>
        <span class="stat-item priority-low">
          <span class="stat-value">{$cardsByPriority.low}</span>
          <span class="stat-label">Low</span>
        </span>
      </div>
    </div>
    <button class="btn-reset" on:click={() => kanbanStore.reset()}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="1 4 1 10 7 10"></polyline>
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
      </svg>
      Reset Board
    </button>
  </header>

  <div class="board">
    {#each $kanbanStore as column (column.id)}
      <Column 
        {column}
        on:addCard={handleAddCard}
        on:updateCard={handleUpdateCard}
        on:deleteCard={handleDeleteCard}
        on:moveInColumn={handleMoveInColumn}
        on:moveToColumn={handleMoveToColumn}
        on:updateTitle={handleUpdateTitle}
        on:deleteColumn={handleDeleteColumn}
      />
    {/each}

    <div class="add-column">
      {#if isAddingColumn}
        <div class="add-column-form">
          <input
            type="text"
            class="column-title-input"
            bind:value={newColumnTitle}
            on:keydown={handleColumnKeydown}
            placeholder="Enter column title..."
            autofocus
          />
          <div class="add-column-actions">
            <button class="btn-add" on:click={addColumn}>Add</button>
            <button class="btn-cancel" on:click={cancelAddColumn}>Cancel</button>
          </div>
        </div>
      {:else}
        <button class="btn-add-column" on:click={startAddingColumn}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Column
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .kanban-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 24px;
  }

  .kanban-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;
  }

  h1 {
    margin: 0;
    color: white;
    font-size: 28px;
    font-weight: 700;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .stats {
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    padding: 8px 16px;
    border-radius: 8px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-value {
    font-size: 18px;
    font-weight: 700;
    color: white;
  }

  .stat-label {
    font-size: 10px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.8);
    letter-spacing: 0.5px;
  }

  .stat-divider {
    width: 1px;
    height: 30px;
    background: rgba(255, 255, 255, 0.3);
  }

  .priority-high .stat-value {
    color: #fca5a5;
  }

  .priority-medium .stat-value {
    color: #fcd34d;
  }

  .priority-low .stat-value {
    color: #86efac;
  }

  .btn-reset {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .btn-reset:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .board {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    padding-bottom: 16px;
    align-items: flex-start;
  }

  .board::-webkit-scrollbar {
    height: 8px;
  }

  .board::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  .board::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }

  .board::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }

  .add-column {
    min-width: 300px;
  }

  .btn-add-column {
    width: 100%;
    padding: 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px dashed rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s ease;
  }

  .btn-add-column:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    color: white;
  }

  .add-column-form {
    background: #f1f5f9;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .column-title-input {
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
  }

  .column-title-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .add-column-actions {
    display: flex;
    gap: 8px;
  }

  .btn-add,
  .btn-cancel {
    flex: 1;
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
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
    background: #e2e8f0;
    color: #64748b;
  }

  .btn-cancel:hover {
    background: #cbd5e1;
  }
</style>
