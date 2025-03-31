<template>
  <div class="editor-view">
    <div class="panel-container">
      <TranscriptEditor class="left-panel" />
      <VideoPreview class="right-panel" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import TranscriptEditor from '@/components/TranscriptEditor.vue'
import VideoPreview from '@/components/VideoPreview.vue'
import { useTranscriptStore } from '@/stores/transcriptStore'
import { provideVideoControl } from '@/hooks/useVideoControl'

const store = useTranscriptStore()
provideVideoControl()

onMounted(() => {
  store.loadTranscript()
})
</script>

<style scoped lang="scss">
.editor-view {
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  .panel-container {
    display: flex;
    width: 100%;
    height: 100%;

    .left-panel {
      flex: 1;
      border-right: 1px solid #ccc;
      overflow-y: auto;
      background: #f5f7fa;
    }

    .right-panel {
      flex: 1;
      padding: 1rem;
      background: #1e1e2f;
      color: white;
    }
  }
}
</style>
