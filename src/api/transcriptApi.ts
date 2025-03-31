// api/transcriptApi.ts
import type { TranscriptData } from '@/types/transcript'
import { BaseApi } from '@/utils/baseApi'

class TranscriptApi extends BaseApi {
  constructor() {
    super('/mockApi') // 設定基礎路徑
  }

  async loadTranscript() {
    return this.get<TranscriptData>('/transcript.json', {
      minLoadingTime: 1000
    })
  }
}

export const transcriptApi = new TranscriptApi()
