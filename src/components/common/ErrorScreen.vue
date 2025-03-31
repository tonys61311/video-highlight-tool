<template>
  <div v-if="error" class="error-overlay">
    <h2 class="error-title">⚠ 發生錯誤</h2>
    <p class="error-message">{{ error || '請檢查網路連線或稍後再試' }}</p>
    <button class="reload-button" @click="reloadPage">重新載入</button>
  </div>
</template>

<script setup lang="ts">

import { useApiStore } from '@/stores/apiStore'
import { computed } from 'vue'

const apiStore = useApiStore()
const error = computed(() => apiStore.error)

const reloadPage = () => {
  apiStore.resetError()
  window.location.reload()
}

</script>

<style lang="scss" scoped>
.error-overlay {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  z-index: 1000;
  text-align: center;
}

.error-title {
  color: #d9534f;
  font-size: 22px;
  font-weight: bold;
}

.error-message {
  color: #333;
  font-size: 16px;
}

.reload-button {
  background-color: #d9534f;
  color: white;
  border: none;
  padding: 10px 15px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 5px;
  margin-top: 10px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #c9302c;
  }
}
</style>
