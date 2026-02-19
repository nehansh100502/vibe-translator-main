<script setup>
import { ref, watch } from 'vue'
import KanbanColumn from './KanbanColumn.vue'

// Initial board state
const columns = ref([
  { id: 'todo', title: 'To Do' },
  { id: 'inProgress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' }
])

const tasks = ref({
  todo: [
    { id: '1', title: 'Set up project structure', priority: 'high', tags: ['setup'] },
    { id: '2', title: 'Design database schema', priority: 'high', tags: ['backend'] },
    { id: '3', title: 'Create wireframes', priority: 'medium', tags: ['design'] }
  ],
  inProgress: [
    { id: '4', title: 'Implement user authentication', priority: 'high', tags: ['backend', 'security'] },
    { id: '5', title: 'Build dashboard UI', priority: 'medium', tags: ['frontend'] }
  ],
  review: [
    { id: '6', title: 'API endpoint documentation', priority: 'low', tags: ['docs'] }
  ],
  done: [
    { id: '7', title: 'Project kickoff meeting', priority: 'medium', tags: ['planning'] },
    { id: '8', title: 'Requirements gathering', priority: 'high', tags: ['planning'] }
  ]
})

const isAddingColumn = ref(false)
const newColumnTitle = ref('')

// Load state from localStorage
const savedState = localStorage.getItem('kanban-board')
if (savedState) {
  try {
    const parsed = JSON.parse(savedState)
    columns.value = parsed.columns || columns.value
    tasks.value = parsed.tasks || tasks.value
  } catch (e) {
    console.error('Failed to load saved state:', e)
  }
}

// Save state to localStorage on changes
watch([columns, tasks], () => {
  localStorage.setItem('kanban-board', JSON.stringify({
    columns: columns.value,
    tasks: tasks.value
  }))
}, { deep: true })

let taskIdCounter = 100

function generateTaskId() {
  return String(++taskIdCounter)
}

function addTask({ columnId, title }) {
  const priorities = ['low', 'medium', 'high']
  const newTask = {
    id: generateTaskId(),
    title,
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    tags: []
  }
  tasks.value[columnId].push(newTask)
}

function deleteTask(taskId) {
  for (const columnId in tasks.value) {
    const index = tasks.value[columnId].findIndex(t => t.id === taskId)
    if (index !== -1) {
      tasks.value[columnId].splice(index, 1)
      break
    }
  }
}

function updateTask(updatedTask) {
  for (const columnId in tasks.value) {
    const index = tasks.value[columnId].findIndex(t => t.id === updatedTask.id)
    if (index !== -1) {
      tasks.value[columnId][index] = updatedTask
      break
    }
  }
}

function updateColumnTasks(columnId, newTasks) {
  tasks.value[columnId] = newTasks
}

function addColumn() {
  if (newColumnTitle.value.trim()) {
    const id = newColumnTitle.value.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
    columns.value.push({ id, title: newColumnTitle.value.trim() })
    tasks.value[id] = []
    newColumnTitle.value = ''
    isAddingColumn.value = false
  }
}

function deleteColumn(columnId) {
  const index = columns.value.findIndex(c => c.id === columnId)
  if (index !== -1) {
    columns.value.splice(index, 1)
    delete tasks.value[columnId]
  }
}

function renameColumn(columnId, newTitle) {
  const column = columns.value.find(c => c.id === columnId)
  if (column) {
    column.title = newTitle
  }
}

function resetBoard() {
  localStorage.removeItem('kanban-board')
  location.reload()
}
</script>

<template>
  <div class="min-h-screen p-6">
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white mb-2">
          Kanban Board
        </h1>
        <p class="text-slate-400">
          Drag and drop tasks between columns to update their status
        </p>
      </div>
      <button
        @click="resetBoard"
        class="text-sm px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-slate-300 transition-colors border border-slate-600/50"
      >
        Reset Board
      </button>
    </div>
    
    <!-- Board -->
    <div class="flex gap-6 overflow-x-auto pb-6">
      <KanbanColumn
        v-for="column in columns"
        :key="column.id"
        :column="column"
        :tasks="tasks[column.id] || []"
        @update:tasks="updateColumnTasks(column.id, $event)"
        @add-task="addTask"
        @delete-task="deleteTask"
        @update-task="updateTask"
        @delete-column="deleteColumn"
        @rename-column="renameColumn"
      />
      
      <!-- Add Column -->
      <div class="w-80 min-w-[320px] flex-shrink-0">
        <div v-if="isAddingColumn" class="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <input
            v-model="newColumnTitle"
            @keyup.enter="addColumn"
            @keyup.escape="isAddingColumn = false"
            placeholder="Enter column title..."
            class="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
            autofocus
          />
          <div class="flex gap-2">
            <button
              @click="addColumn"
              class="flex-1 text-sm px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition-colors font-medium"
            >
              Add Column
            </button>
            <button
              @click="isAddingColumn = false"
              class="text-sm px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
        <button
          v-else
          @click="isAddingColumn = true"
          class="w-full h-16 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-700/50 hover:border-purple-500/50 transition-all text-slate-500 hover:text-slate-300 flex items-center justify-center gap-2"
        >
          <span class="text-2xl">+</span>
          Add Column
        </button>
      </div>
    </div>
  </div>
</template>
