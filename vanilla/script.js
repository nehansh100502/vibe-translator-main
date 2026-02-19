// Kanban Board Application
(function() {
    'use strict';

    // State Management
    const STORAGE_KEY = 'kanban-tasks';
    
    let tasks = loadTasks();
    let draggedTask = null;
    let editingTaskId = null;

    // DOM Elements
    const taskModal = document.getElementById('taskModal');
    const taskForm = document.getElementById('taskForm');
    const modalTitle = document.getElementById('modalTitle');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const taskLists = document.querySelectorAll('.task-list');
    const addTaskBtns = document.querySelectorAll('.add-task-btn');

    // Initialize
    function init() {
        renderAllTasks();
        setupEventListeners();
    }

    // Load tasks from localStorage
    function loadTasks() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : getSampleTasks();
        } catch (e) {
            console.error('Error loading tasks:', e);
            return getSampleTasks();
        }
    }

    // Save tasks to localStorage
    function saveTasks() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        } catch (e) {
            console.error('Error saving tasks:', e);
        }
    }

    // Sample tasks for first-time users
    function getSampleTasks() {
        return [
            {
                id: generateId(),
                title: 'Welcome to Kanban Board!',
                description: 'Drag and drop this card to move it between columns.',
                priority: 'low',
                status: 'todo'
            },
            {
                id: generateId(),
                title: 'Create your first task',
                description: 'Click the "+ Add Task" button to create a new task.',
                priority: 'medium',
                status: 'todo'
            },
            {
                id: generateId(),
                title: 'Organize your work',
                description: 'Use the three columns to track progress.',
                priority: 'high',
                status: 'in-progress'
            }
        ];
    }

    // Generate unique ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Setup Event Listeners
    function setupEventListeners() {
        // Add task buttons
        addTaskBtns.forEach(btn => {
            btn.addEventListener('click', () => openModal(btn.dataset.status));
        });

        // Modal controls
        closeModalBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        taskModal.addEventListener('click', (e) => {
            if (e.target === taskModal) closeModal();
        });

        // Form submission
        taskForm.addEventListener('submit', handleFormSubmit);

        // Drag and drop for task lists
        taskLists.forEach(list => {
            list.addEventListener('dragover', handleDragOver);
            list.addEventListener('dragleave', handleDragLeave);
            list.addEventListener('drop', handleDrop);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    }

    // Render all tasks
    function renderAllTasks() {
        // Clear all task lists
        taskLists.forEach(list => {
            list.innerHTML = '';
        });

        // Render each task in its column
        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            const targetList = document.querySelector(`.task-list[data-status="${task.status}"]`);
            if (targetList) {
                targetList.appendChild(taskElement);
            }
        });

        // Update task counts
        updateTaskCounts();
    }

    // Create task card element
    function createTaskElement(task) {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.draggable = true;
        card.dataset.taskId = task.id;

        card.innerHTML = `
            <div class="priority-indicator priority-${task.priority}"></div>
            <h4 class="task-title">${escapeHtml(task.title)}</h4>
            ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
            <div class="task-actions">
                <button class="task-action-btn edit-btn" data-action="edit">Edit</button>
                <button class="task-action-btn delete-btn" data-action="delete">Delete</button>
            </div>
        `;

        // Drag events
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);

        // Action buttons
        card.querySelector('.edit-btn').addEventListener('click', () => editTask(task.id));
        card.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

        return card;
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Update task counts in column headers
    function updateTaskCounts() {
        const statuses = ['todo', 'in-progress', 'done'];
        statuses.forEach(status => {
            const count = tasks.filter(t => t.status === status).length;
            const column = document.querySelector(`.column[data-status="${status}"]`);
            if (column) {
                column.querySelector('.task-count').textContent = count;
            }
        });
    }

    // Modal functions
    function openModal(status, taskId = null) {
        editingTaskId = taskId;
        
        if (taskId) {
            // Editing existing task
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                modalTitle.textContent = 'Edit Task';
                document.getElementById('taskTitle').value = task.title;
                document.getElementById('taskDescription').value = task.description || '';
                document.getElementById('taskPriority').value = task.priority;
                document.getElementById('taskStatus').value = task.status;
                document.getElementById('taskId').value = task.id;
            }
        } else {
            // Creating new task
            modalTitle.textContent = 'Add New Task';
            taskForm.reset();
            document.getElementById('taskStatus').value = status;
            document.getElementById('taskPriority').value = 'medium';
        }

        taskModal.classList.add('active');
        document.getElementById('taskTitle').focus();
    }

    function closeModal() {
        taskModal.classList.remove('active');
        taskForm.reset();
        editingTaskId = null;
    }

    // Form submission
    function handleFormSubmit(e) {
        e.preventDefault();

        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const priority = document.getElementById('taskPriority').value;
        const status = document.getElementById('taskStatus').value;
        const taskId = document.getElementById('taskId').value;

        if (!title) return;

        if (editingTaskId) {
            // Update existing task
            const taskIndex = tasks.findIndex(t => t.id === editingTaskId);
            if (taskIndex !== -1) {
                tasks[taskIndex] = {
                    ...tasks[taskIndex],
                    title,
                    description,
                    priority
                };
            }
        } else {
            // Create new task
            const newTask = {
                id: generateId(),
                title,
                description,
                priority,
                status
            };
            tasks.push(newTask);
        }

        saveTasks();
        renderAllTasks();
        closeModal();
    }

    // Edit task
    function editTask(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            openModal(task.status, taskId);
        }
    }

    // Delete task
    function deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            renderAllTasks();
        }
    }

    // Drag and Drop handlers
    function handleDragStart(e) {
        draggedTask = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.dataset.taskId);
    }

    function handleDragEnd(e) {
        this.classList.remove('dragging');
        draggedTask = null;
        
        // Remove drag-over class from all lists
        taskLists.forEach(list => {
            list.classList.remove('drag-over');
        });
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        this.classList.add('drag-over');

        // Find the element we're hovering over
        const afterElement = getDragAfterElement(this, e.clientY);
        const dragging = document.querySelector('.dragging');
        
        if (dragging) {
            if (afterElement == null) {
                this.appendChild(dragging);
            } else {
                this.insertBefore(dragging, afterElement);
            }
        }
    }

    function handleDragLeave(e) {
        // Only remove class if we're leaving the list entirely
        if (!this.contains(e.relatedTarget)) {
            this.classList.remove('drag-over');
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');

        const taskId = e.dataTransfer.getData('text/plain');
        const newStatus = this.dataset.status;

        // Update task status
        const task = tasks.find(t => t.id === taskId);
        if (task && task.status !== newStatus) {
            task.status = newStatus;
            saveTasks();
            updateTaskCounts();
        }

        // Reorder tasks based on DOM order
        reorderTasks();
    }

    // Get element after which to insert the dragged element
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Reorder tasks array based on DOM order
    function reorderTasks() {
        const newOrder = [];
        
        taskLists.forEach(list => {
            const cards = list.querySelectorAll('.task-card');
            cards.forEach(card => {
                const task = tasks.find(t => t.id === card.dataset.taskId);
                if (task) {
                    newOrder.push(task);
                }
            });
        });

        tasks = newOrder;
        saveTasks();
    }

    // Initialize the app when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
