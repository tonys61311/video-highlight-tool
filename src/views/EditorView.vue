<template>
  <div class="editor-view">
    <div class="panel-container">
      <TranscriptEditor class="left-panel" />
      <VideoPreview class="right-panel" />
    </div>
  </div>
</template>

<script setup lang="ts">
import TranscriptEditor from '@/components/editing/TranscriptEditor.vue'
import VideoPreview from '@/components/preview/VideoPreview.vue'
import { provideVideoControl } from '@/hooks/useVideoControl'

provideVideoControl()

</script>

<style scoped lang="scss">
/* 原有样式保持不变 */
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
      overflow-y: auto;
    }
  }
}
</style>
