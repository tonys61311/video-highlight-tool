<template>
  <LoadingView />
  <ErrorScreen />
  <EditorView v-show="!apiStore.error" />
</template>

<script setup lang="ts">
import EditorView from '@/views/EditorView.vue'
import LoadingView from '@/components/common/LoadingView.vue'
import ErrorScreen from '@/components/common/ErrorScreen.vue'
import { useApiStore } from '@/stores/apiStore'

const apiStore = useApiStore()

</script>

<style scoped></style>
