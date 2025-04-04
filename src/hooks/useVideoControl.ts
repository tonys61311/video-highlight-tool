// hooks/useVideoControl.ts
import { ref, provide, inject, type Ref, computed, nextTick } from 'vue'
import { useTranscriptStore } from '@/stores/transcriptStore'
import { formatTime } from '@/utils/helpers'

const VIDEO_CONTROL_KEY = Symbol('video_control')

/**
 * 視頻控制相關的狀態和方法類型定義
 */
type VideoControl = {
  /** 視頻元素的 Ref 對象 */
  videoRef: Ref<HTMLVideoElement | null>
  /** 進度條元素的 Ref 對象 */
  progressBarRef: Ref<HTMLDivElement | null>
  /** 當前是否正在播放的狀態 */
  isPlaying: Ref<boolean>
  /** 當前播放時間（秒） */
  currentTime: Ref<number>
  /** 格式化後的當前時間（HH:MM:SS） */
  formatCurrentTime: Ref<string>
  /** 設置視頻當前時間 */
  setVideoRefCurrentTime: (time: number) => void
  /** 切換播放/暫停狀態 */
  togglePlay: () => void
  /** 向前跳轉指定秒數 */
  skipForward: (seconds: number) => void
  /** 向後跳轉指定秒數 */
  skipBackward: (seconds: number) => void
  /** 處理進度條點擊事件 */
  handleHighlightClick: (e: MouseEvent) => void
  /** 處理視頻時間更新事件 */
  onTimeUpdate: () => void
  /** 設置視頻時長監聽器 */
  setupVideoDurationListener: () => void
  /** 播放視頻 */
  playVideo: () => void
  /** 暫停視頻 */
  pauseVideo: () => void
}

/**
 * 提供視頻控制相關的狀態和方法
 * @returns 返回 videoRef 和 progressBarRef 用於模板綁定
 */
export const provideVideoControl = () => {
  const store = useTranscriptStore()
  const videoRef = ref<HTMLVideoElement | null>(null)
  const progressBarRef = ref<HTMLDivElement | null>(null)
  const isPlaying = ref(false)

  /**
   * 當前播放時間（與 store 同步）
   */
  const currentTime = computed({
    get: () => store.currentTime,
    set: (val: number) => store.setCurrentTime(val)
  })

  /**
   * 格式化後的當前時間（HH:MM:SS）
   */
  const formatCurrentTime = computed(() => formatTime(currentTime.value))

  /**
   * 設置視頻元素的當前時間
   * @param time - 要設置的時間（秒）
   */
  const setVideoRefCurrentTime = (time: number) => {
    if (videoRef.value) {
      videoRef.value.currentTime = time
    }
  }

  /**
   * 切換播放/暫停狀態
   */
  const togglePlay = () => {
    if (!videoRef.value) return
    if (videoRef.value.paused) {
      playVideo()
    } else {
      pauseVideo()
    }
  }

  const playVideo = () => {
    if (!videoRef.value) return
    videoRef.value.play()
    isPlaying.value = true
  }

  const pauseVideo = () => {
    if (!videoRef.value) return
    videoRef.value.pause()
    isPlaying.value = false
  }

  /**
   * 向前跳轉指定秒數（確保停留在高亮片段）
   * @param seconds - 要跳轉的秒數
   */
  const skipForward = (seconds: number) => {
    if (!videoRef.value || !store.highlightSegments?.length) return
    const newTime = Math.max(0, videoRef.value.currentTime - seconds)
    setVideoRefCurrentTime(newTime)
  }

  /**
   * 向後跳轉指定秒數
   * @param seconds - 要跳轉的秒數
   */
  const skipBackward = (seconds: number) => {
    if (!videoRef.value) return
    const newTime = videoRef.value.currentTime + seconds
    setVideoRefCurrentTime(newTime)
  }

  /**
   * 處理進度條點擊事件，跳轉到對應時間
   * @param e - 鼠標事件對象
   */
  const handleHighlightClick = (e: MouseEvent) => {
    if (!videoRef.value || !progressBarRef.value) return
    const rect = progressBarRef.value.getBoundingClientRect()
    const clickPercent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
    setVideoRefCurrentTime(clickPercent * store.duration)
    e.stopPropagation()
  }

  /**
   * 處理視頻時間更新事件，同步當前時間到 store
   */
  function onTimeUpdate() {
    if (!videoRef.value) return;
    const currentT = videoRef.value.currentTime;
    currentTime.value = currentT
    const nextSegment = store.currentHighlightSegment;
    if (!nextSegment) {
      // 沒有下一段時停止播放
      pauseVideo()
      videoRef.value.currentTime = store.firstHighlightSegment?.start || 0;
    } else if (currentT < nextSegment.start) {
      // 自動跳轉到下一段的開始
      videoRef.value.currentTime = nextSegment.start;
    }
  }

  /**
   * 設置視頻時長監聽器，獲取視頻總時長後更新到 store
   */
  const setupVideoDurationListener = () => {
    nextTick(() => {
      if (!videoRef.value) return

      const handleLoadedMetadata = () => {
        const duration = videoRef.value?.duration
        if (duration && duration > 0) {
          store.setDuration(duration)
        }
      }

      // 避免重複綁定
      videoRef.value.removeEventListener('loadedmetadata', handleLoadedMetadata)
      videoRef.value.addEventListener('loadedmetadata', handleLoadedMetadata)

      // 立即檢查已緩存的視頻
      if (videoRef.value.readyState > 0) {
        handleLoadedMetadata()
      }
    })
  }

  // 提供所有視頻控制相關的狀態和方法
  provide(VIDEO_CONTROL_KEY, {
    videoRef,
    progressBarRef,
    isPlaying,
    currentTime,
    formatCurrentTime,
    setVideoRefCurrentTime,
    togglePlay,
    skipForward,
    skipBackward,
    handleHighlightClick,
    onTimeUpdate,
    setupVideoDurationListener,
    playVideo,
    pauseVideo,
  })

  return { videoRef, progressBarRef }
}

/**
 * 使用視頻控制相關的狀態和方法
 * @returns 視頻控制對象
 * @throws 如果不在 provideVideoControl 的組件樹中會拋出錯誤
 */
export const useVideoControl = () => {
  const ctx = inject<VideoControl>(VIDEO_CONTROL_KEY)
  if (!ctx) throw new Error('useVideoControl must be used within a provider')
  return ctx
}
