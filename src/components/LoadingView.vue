<template>
  <div v-if="isLoading" class="loading-overlay">
    <div class="loading-content">
      <div class="loading-spinner" :style="{
        width: `${spinnerSize}px`,
        height: `${spinnerSize}px`,
        borderTopColor: spinnerColor
      }"></div>
      <p class="loading-message" :style="{ color: textColor }">Loading...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApiStore } from '@/stores/apiStore'
import { computed } from 'vue'

const apiStore = useApiStore()
const isLoading = computed(() => apiStore.isLoading)

defineProps({
  spinnerColor: {
    type: String,
    default: '#3498db'
  },
  spinnerSize: {
    type: Number,
    default: 40
  },
  textColor: {
    type: String,
    default: 'white'
  }
})
</script>

<style lang="scss" scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;

    .loading-spinner {
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      animation: spin 2s linear infinite;
    }

    .loading-message {
      font-size: 1rem;
      font-weight: bold;
      margin-top: 0.625rem;
    }
  }
}
</style>
