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
        <p v-if="currentSentence" class="overlay-text">
          {{ currentSentence.text }}
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
import { ref, computed, nextTick } from 'vue'
import { useTranscriptStore } from '@/stores/transcriptStore'
import { Play, Pause, SkipForward, SkipBack } from 'lucide-vue-next'
import { useVideoControl } from '@/hooks/useVideoControl'
import { apiRequest } from '@/utils/apiRequestHandler'
import { formatTime } from '@/utils/helpers'

const store = useTranscriptStore()
const { videoRef } = useVideoControl()

const videoUrl = ref<string | undefined>('')
const isPlaying = ref(false)
const progressBarRef = ref<HTMLDivElement | null>(null)

const currentTime = computed({
  get: () => store.currentTime,
  set: (val: number) => store.setCurrentTime(val)
})

const formatCurrentTime = computed(() => formatTime(currentTime.value))

const currentSentence = computed(() => {
  if (store.sections.length === 0) return null
  for (const section of store.sections) {
    for (const sentence of section.sentences) {
      if (
        currentTime.value >= sentence.start &&
        currentTime.value < sentence.end
      ) {
        return sentence
      }
    }
  }
  return null
})

// 監聽 videoRef currentTime的變化
function onTimeUpdate() {
  if (!videoRef.value) return;
  const currentT = videoRef.value.currentTime;
  currentTime.value = currentT
  const nextSegment = store.currentHighlightSegment;
  if (!nextSegment) {
    // 沒有下一段時停止播放
    videoRef.value.pause();
    isPlaying.value = false;
    videoRef.value.currentTime = store.firstHighlightSegment?.start || 0;
  } else if (currentT < nextSegment.start) {
    // 自動跳轉到下一段的開始
    videoRef.value.currentTime = nextSegment.start;
  }
}

// 設置影片時長監聽器
function setupVideoDurationListener() {
  nextTick(() => {
    if (!videoRef.value) return;

    const handleLoadedMetadata = () => {
      const duration = videoRef.value?.duration;
      if (duration && duration > 0) {
        store.setDuration(duration);
      }
    };

    // 先移除舊的監聽器避免重複綁定
    videoRef.value.removeEventListener('loadedmetadata', handleLoadedMetadata);
    // 添加新的監聽器
    videoRef.value.addEventListener('loadedmetadata', handleLoadedMetadata);

    // 立即檢查（針對已緩存的影片）
    if (videoRef.value.readyState > 0) {
      handleLoadedMetadata();
    }
  });
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

// 載入範例影片
async function loadSample() {
  videoUrl.value = `${import.meta.env.VITE_API_BASE_URL}/videos/sample.mp4`;
  await apiRequest(
    () => store.loadTranscript(),
    { minLoadingTime: 1000 }
  )
  setupVideoDurationListener();
}

function togglePlay() {
  if (!videoRef.value) return
  if (videoRef.value.paused) {
    videoRef.value.play()
    isPlaying.value = true
  } else {
    videoRef.value.pause()
    isPlaying.value = false
  }
}

// 後退跳轉（確保停留在高亮片段）
function skipForward(seconds: number) {
  if (!videoRef.value || !store.highlightSegments?.length) return;

  videoRef.value.currentTime -= seconds;

  // 1. 反向排序找出前一個高亮片段
  const prevHighlight = [...store.highlightSegments]
    .sort((a, b) => b.start - a.start)
    .find(seg => seg.start < store.currentTime);

  // 2. 如果有前序高亮則跳轉，否則跳轉到最後一個高亮（循環）
  videoRef.value.currentTime = prevHighlight?.start || store.firstHighlightSegment?.start || 0;
}

function skipBackward(seconds: number) {
  if (videoRef.value) {
    videoRef.value.currentTime += seconds
  }
}

// 點擊進度條後跳轉到相應的時間點
const handleHighlightClick = (e: MouseEvent) => {
  if (!videoRef.value || !progressBarRef.value) return

  // 1. 計算點擊位置在進度條上的百分比 (0~1)
  const rect = progressBarRef.value.getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const clickPercent = Math.min(Math.max(clickX / rect.width, 0), 1)

  // 2. 計算點擊位置對應的確切時間（秒）
  const clickTime = clickPercent * store.duration

  // 3. 跳轉到確切的時間點
  videoRef.value.currentTime = clickTime

  e.stopPropagation()
}

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
  }

  .video-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    flex: 1;

    .overlay-text {
      position: absolute;
      color: #ddd;
      background-color: rgba(48, 47, 47, 0.4);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }
  }

  .video-player {
    width: 100%;
    height: 100%;
    background: black;
    object-fit: contain;
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
</style>
