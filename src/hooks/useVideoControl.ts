// composables/useVideoControl.ts
import { ref, provide, inject, type Ref } from 'vue'

const VIDEO_CONTROL_KEY = Symbol('video_control')

// 類型定義
type VideoControl = {
  videoRef: Ref<HTMLVideoElement | null>
  setCurrentTime: (time: number) => void
}

export const provideVideoControl = () => {
  const videoRef = ref<HTMLVideoElement | null>(null)

  const setCurrentTime = (time: number) => {
    if (videoRef.value) {
      videoRef.value.currentTime = time
    }
  }

  provide(VIDEO_CONTROL_KEY, {
    videoRef,
    setCurrentTime
  })
  return { videoRef } // 返回 ref 用於綁定 <video>
}

export const useVideoControl = () => {
  const ctx = inject<VideoControl>(VIDEO_CONTROL_KEY)

  if (!ctx) {
    throw new Error('useScrollContainer must be used within a provider')
  }

  return ctx
}
