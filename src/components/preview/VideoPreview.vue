<template>
  <div class="video-preview">
    <div class="header">
      <h3>Preview</h3>
      <div class="actions">
        <label class="btn">
          Upload Video
          <input type="file" accept="video/*" @change="loadSample" hidden />
        </label>
        <button class="btn" @click="loadSample">Sample Video</button>
      </div>
    </div>

    <div class="container" v-if="store.transcript">
      <div class="video-wrapper">
        <video ref="videoRef" class="video-player" :src="videoUrl" @timeupdate="onTimeUpdate"></video>
        <p v-if="currentSegment" class="overlay-text">
          {{ currentSegment.text }}
        </p>
      </div>

      <div class="custom-controls">
        <button @click="skipForward(5)" aria-label="Backward 5s">
          <SkipBack :size="20" />
        </button>
        <button @click="togglePlay" aria-label="Play/Pause">
          <Play :size="20" v-if="!isPlaying" />
          <Pause :size="20" v-else />
        </button>
        <button @click="skipBackward(5)" aria-label="Forward 5s">
          <SkipForward :size="20" />
        </button>
        <span class="time">{{ formatCurrentTime }}</span>
      </div>

      <div class="progress-bar" ref="progressBarRef">
        <div :key="highlight.id" v-for="highlight in store.highlightSegments" class="progress-highlight"
          :class="[...highlight.adjacentClass]" :style="{
            left: `${highlight.leftPercent}%`,
            width: `${highlight.widthPercent}%`,
          }" @click="(e) => handleHighlightClick(e)"></div>
        <div class="progress-current" :style="{ left: store.progressPercent + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVideoControl } from '@/hooks/useVideoControl'
import { useTranscriptStore } from '@/stores/transcriptStore'
import { apiRequest } from '@/utils/apiRequestHandler'
import { computed, ref } from 'vue'
import { Play, Pause, SkipForward, SkipBack } from 'lucide-vue-next'

const store = useTranscriptStore()
const { videoRef, progressBarRef, isPlaying, formatCurrentTime, setVideoRefCurrentTime, togglePlay, skipForward, skipBackward, handleHighlightClick, onTimeUpdate, setupVideoDurationListener } = useVideoControl()

// 保留需要在组件中处理的部分
const videoUrl = ref('')
const currentSegment = computed(() => store.currentHighlightSegment)

async function loadSample() {
  videoUrl.value = `${import.meta.env.VITE_API_BASE_URL}/videos/sample.mp4`
  await apiRequest(() => store.loadTranscript(), { minLoadingTime: 1000 })
  setVideoRefCurrentTime(store.currentTime)
  setupVideoDurationListener()
}

// 處理上傳影片 目前暫時只走載入範例影片
// function handleUpload(event: Event) {
//   const target = event.target as HTMLInputElement;
//   const file = target.files?.[0];
//   if (file) {
//     // 清理之前的 URL（避免記憶體洩漏）
//     if (videoUrl.value) {
//       URL.revokeObjectURL(videoUrl.value);
//     }
//     videoUrl.value = URL.createObjectURL(file);
//     setupVideoDurationListener();
//   }
// }

</script>

<style scoped lang="scss">
.video-preview {
  display: flex;
  flex-direction: column;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn {
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      font-size: 0.875rem;
      cursor: pointer;
      background: #e5e7eb;
      color: #111827;
      border: none;
    }
  }

  .container {
    display: flex;
    flex-direction: column;
    flex: 1;

    .video-wrapper {
      position: relative;
      display: flex;
      justify-content: center;

      .video-player {
        width: 100%;
        height: auto;
        background: black;
        object-fit: contain;
      }

      .overlay-text {
        position: absolute;
        bottom: 5px; /* 調整文字位置 */
        color: #ddd;
        background-color: rgba(48, 47, 47, 0.4);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
      }
    }

    .custom-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 1rem 0;

      button {
        background: none;
        border: none;
        font-size: 1.25rem;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .time {
        color: white;
        font-size: 0.875rem;
        font-family: monospace;
        min-width: 50px;
      }
    }

    .progress-bar {
      margin-top: 0.5rem;
      height: 30px;
      background: #2e3440;
      border-radius: 4px;
      position: relative;

      .progress-current {
        position: absolute;
        top: 0;
        width: 4px;
        height: 100%;
        border-radius: 4px;
        background: #ef4444;
        transition: left 0.2s linear;
      }

      .progress-highlight {
        position: absolute;
        top: 0;
        height: 100%;
        background: #3b82f6;
        border-radius: 4px;

        // 當有 adjacent-right class 時
        &.adjacent-right {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }

        // 當有 adjacent-left class 時
        &.adjacent-left {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
      }
    }
  }
}
</style>
