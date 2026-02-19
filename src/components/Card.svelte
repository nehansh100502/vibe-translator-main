<script>
  import { createEventDispatcher } from 'svelte';
  import { dragState } from '../stores/kanban.js';

  export let card;
  export let columnId;
  export let index;

  const dispatch = createEventDispatcher();

  let isEditing = false;
  let editTitle = card.title;
  let editDescription = card.description;
  let editPriority = card.priority;

  function handleDragStart(event) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', JSON.stringify({
      cardId: card.id,
      sourceColumnId: columnId,
      sourceIndex: index
    }));
    
    dragState.set({
      isDragging: true,
      draggedCard: card,
      sourceColumnId: columnId
    });

    // Add a slight delay to allow the drag image to be created
    setTimeout(() => {
      event.target.classList.add('dragging');
    }, 0);
  }

  function handleDragEnd(event) {
    event.target.classList.remove('dragging');
    dragState.set({
      isDragging: false,
      draggedCard: null,
      sourceColumnId: null
    });
  }

  function startEditing() {
    editTitle = card.title;
    editDescription = card.description;
    editPriority = card.priority;
    isEditing = true;
  }

  function saveEdit() {
    if (editTitle.trim()) {
      dispatch('update', {
        cardId: card.id,
        updates: {
          title: editTitle.trim(),
          description: editDescription.trim(),
          priority: editPriority
        }
      });
    }
    isEditing = false;
  }

  function cancelEdit() {
    isEditing = false;
  }

  function handleDelete() {
    dispatch('delete', { cardId: card.id });
  }

  function handleKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      saveEdit();
    } else if (event.key === 'Escape') {
      cancelEdit();
    }
  }

  function getPriorityClass(priority) {
    return `priority-${priority}`;
  }
</script>

<div 
  class="card {getPriorityClass(card.priority)}"
  draggable="true"
  on:dragstart={handleDragStart}
  on:dragend={handleDragEnd}
  role="listitem"
  tabindex="0"
>
  {#if isEditing}
    <div class="card-edit">
      <input
        type="text"
        class="edit-title"
        bind:value={editTitle}
        on:keydown={handleKeydown}
        placeholder="Card title"
        autofocus
      />
      <textarea
        class="edit-description"
        bind:value={editDescription}
        on:keydown={handleKeydown}
        placeholder="Description (optional)"
        rows="2"
      ></textarea>
      <select class="edit-priority" bind:value={editPriority}>
        <option value="low">Low Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="high">High Priority</option>
      </select>
      <div class="edit-actions">
        <button class="btn-save" on:click={saveEdit}>Save</button>
        <button class="btn-cancel" on:click={cancelEdit}>Cancel</button>
      </div>
    </div>
  {:else}
    <div class="card-content">
      <div class="card-header">
        <span class="priority-badge">{card.priority}</span>
        <div class="card-actions">
          <button class="btn-icon" on:click={startEditing} title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="btn-icon btn-delete" on:click={handleDelete} title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
      <h4 class="card-title">{card.title}</h4>
      {#if card.description}
        <p class="card-description">{card.description}</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .card {
    background: white;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    cursor: grab;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    border-left: 3px solid transparent;
  }

  .card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .card:active {
    cursor: grabbing;
  }

  .card.dragging {
    opacity: 0.5;
    transform: rotate(3deg);
  }

  .card.priority-high {
    border-left-color: #ef4444;
  }

  .card.priority-medium {
    border-left-color: #f59e0b;
  }

  .card.priority-low {
    border-left-color: #22c55e;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .priority-badge {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 4px;
    background: #f1f5f9;
    color: #64748b;
  }

  .card.priority-high .priority-badge {
    background: #fef2f2;
    color: #dc2626;
  }

  .card.priority-medium .priority-badge {
    background: #fffbeb;
    color: #d97706;
  }

  .card.priority-low .priority-badge {
    background: #f0fdf4;
    color: #16a34a;
  }

  .card-actions {
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .card:hover .card-actions {
    opacity: 1;
  }

  .btn-icon {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: #94a3b8;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.15s ease, color 0.15s ease;
  }

  .btn-icon:hover {
    background: #f1f5f9;
    color: #475569;
  }

  .btn-delete:hover {
    background: #fef2f2;
    color: #dc2626;
  }

  .card-title {
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    line-height: 1.4;
  }

  .card-description {
    margin: 0;
    font-size: 12px;
    color: #64748b;
    line-height: 1.5;
  }

  .card-edit {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .edit-title {
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    width: 100%;
    box-sizing: border-box;
  }

  .edit-title:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .edit-description {
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 12px;
    resize: vertical;
    font-family: inherit;
    width: 100%;
    box-sizing: border-box;
  }

  .edit-description:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .edit-priority {
    padding: 6px 8px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 12px;
    background: white;
    cursor: pointer;
  }

  .edit-priority:focus {
    outline: none;
    border-color: #3b82f6;
  }

  .edit-actions {
    display: flex;
    gap: 8px;
  }

  .btn-save,
  .btn-cancel {
    flex: 1;
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .btn-save {
    background: #3b82f6;
    color: white;
  }

  .btn-save:hover {
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
