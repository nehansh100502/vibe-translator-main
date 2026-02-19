<script setup>
import { ref, computed } from 'vue'
import draggable from 'vuedraggable'
import KanbanCard from './KanbanCard.vue'

const props = defineProps({
  column: {
    type: Object,
    required: true
  },
  tasks: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:tasks', 'add-task', 'delete-task', 'update-task', 'delete-column', 'rename-column'])

const isAddingTask = ref(false)
const newTaskTitle = ref('')
const isEditingTitle = ref(false)
const editColumnTitle = ref('')

const localTasks = computed({
  get: () => props.tasks,
  set: (value) => emit('update:tasks', value)
})

const columnColors = {
  todo: 'from-blue-600/20 to-blue-800/20 border-blue-500/30',
  inProgress: 'from-amber-600/20 to-amber-800/20 border-amber-500/30',
  review: 'from-purple-600/20 to-purple-800/20 border-purple-500/30',
  done: 'from-emerald-600/20 to-emerald-800/20 border-emerald-500/30'
}

const headerColors = {
  todo: 'text-blue-400',
  inProgress: 'text-amber-400',
  review: 'text-purple-400',
  done: 'text-emerald-400'
}

function addTask() {
  if (newTaskTitle.value.trim()) {
    emit('add-task', {
      columnId: props.column.id,
      title: newTaskTitle.value.trim()
    })
    newTaskTitle.value = ''
    isAddingTask.value = false
  }
}

function cancelAddTask() {
  newTaskTitle.value = ''
  isAddingTask.value = false
}

function startEditingTitle() {
  editColumnTitle.value = props.column.title
  isEditingTitle.value = true
}

function saveColumnTitle() {
  if (editColumnTitle.value.trim()) {
    emit('rename-column', props.column.id, editColumnTitle.value.trim())
  }
  isEditingTitle.value = false
}
</script>

<template>
  <div
    :class="[
      'flex flex-col w-80 min-w-[320px] bg-gradient-to-b rounded-xl border backdrop-blur-sm',
      columnColors[column.id] || columnColors.todo
    ]"
  >
    <!-- Column Header -->
    <div class="p-4 border-b border-slate-700/50">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2" v-if="!isEditingTitle">
          <h2
            :class="['font-semibold text-lg', headerColors[column.id] || headerColors.todo]"
            @dblclick="startEditingTitle"
          >
            {{ column.title }}
          </h2>
          <span class="text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">
            {{ tasks.length }}
          </span>
        </div>
        <div v-else class="flex-1 mr-2">
          <input
            v-model="editColumnTitle"
            @keyup.enter="saveColumnTitle"
            @keyup.escape="isEditingTitle = false"
            @blur="saveColumnTitle"
            class="w-full bg-slate-700 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            autofocus
          />
        </div>
        <button
          @click="$emit('delete-column', column.id)"
          class="text-slate-500 hover:text-red-400 transition-colors p-1"
          title="Delete column"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Tasks List -->
    <div class="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px]">
      <draggable
        v-model="localTasks"
        :group="{ name: 'tasks', pull: true, put: true }"
        item-key="id"
        :animation="200"
        ghost-class="opacity-50"
        drag-class="rotate-2"
        class="space-y-3 min-h-[100px]"
      >
        <template #item="{ element }">
          <KanbanCard
            :task="element"
            @delete="$emit('delete-task', $event)"
            @update="$emit('update-task', $event)"
          />
        </template>
      </draggable>
    </div>
    
    <!-- Add Task -->
    <div class="p-3 border-t border-slate-700/50">
      <div v-if="isAddingTask" class="space-y-2">
        <textarea
          v-model="newTaskTitle"
          @keyup.enter.prevent="addTask"
          @keyup.escape="cancelAddTask"
          placeholder="Enter task title..."
          class="w-full bg-slate-800/80 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none border border-slate-600/50"
          rows="2"
          autofocus
        ></textarea>
        <div class="flex gap-2">
          <button
            @click="addTask"
            class="flex-1 text-sm px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition-colors font-medium"
          >
            Add Task
          </button>
          <button
            @click="cancelAddTask"
            class="text-sm px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
      <button
        v-else
        @click="isAddingTask = true"
        class="w-full text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg py-2 transition-colors flex items-center justify-center gap-1"
      >
        <span class="text-lg">+</span>
        Add a task
      </button>
    </div>
  </div>
</template>
