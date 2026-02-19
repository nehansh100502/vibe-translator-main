<script setup>
import { ref } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete', 'update'])

const isEditing = ref(false)
const editTitle = ref('')

const priorityColors = {
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30'
}

function startEditing() {
  editTitle.value = props.task.title
  isEditing.value = true
}

function saveEdit() {
  if (editTitle.value.trim()) {
    emit('update', { ...props.task, title: editTitle.value.trim() })
  }
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}
</script>

<template>
  <div
    class="group bg-slate-800/80 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-slate-700/50 hover:border-purple-500/50 transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-purple-500/10"
  >
    <div v-if="isEditing" class="space-y-2">
      <input
        v-model="editTitle"
        @keyup.enter="saveEdit"
        @keyup.escape="cancelEdit"
        class="w-full bg-slate-700 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        autofocus
      />
      <div class="flex gap-2">
        <button
          @click="saveEdit"
          class="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-500 rounded text-white transition-colors"
        >
          Save
        </button>
        <button
          @click="cancelEdit"
          class="text-xs px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
    
    <div v-else>
      <div class="flex items-start justify-between gap-2">
        <p class="text-sm text-slate-200 flex-1" @dblclick="startEditing">
          {{ task.title }}
        </p>
        <button
          @click="$emit('delete', task.id)"
          class="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all duration-200 text-xs"
          title="Delete task"
        >
          ✕
        </button>
      </div>
      
      <div class="mt-2 flex items-center gap-2">
        <span
          :class="[
            'text-xs px-2 py-0.5 rounded-full border',
            priorityColors[task.priority]
          ]"
        >
          {{ task.priority }}
        </span>
        <span v-if="task.tags?.length" class="flex gap-1">
          <span
            v-for="tag in task.tags"
            :key="tag"
            class="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-400"
          >
            {{ tag }}
          </span>
        </span>
      </div>
    </div>
  </div>
</template>
