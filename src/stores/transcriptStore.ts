// stores/transcriptStore.ts
import { defineStore } from 'pinia'
import type { TranscriptData, Section, HighlightSentence, Sentence } from '@/types/transcript'
import { transcriptApi } from '@/api/transcriptApi'

export const useTranscriptStore = defineStore('transcript', {
  state: () => ({
    transcript: null as TranscriptData | null, // Api 回傳的 transcript 資料，包含 sections 和 highlightIds
    highlights: new Set<string>(), // 儲存目前選取的 highlight 片段 ID 集合
    currentTime: 0, // 當前播放時間，單位為秒
    duration: 1, // 視頻總長度，單位為秒
  }),

  getters: {
    sections(state): Section[] {
      return state.transcript?.sections || []
    },
    selectedIds(state): string[] {
      return Array.from(state.highlights)
    },
    // 取得highlight片段的詳細資訊，包含百分比和相鄰片段資訊
    highlightSegments(state): HighlightSentence[] {
      if (!state.transcript?.sections || !state.duration) return [];

      return state.transcript.sections
        .flatMap(section => section.sentences)
        .map((sentence, index, array) => {
          const isNextSelected = index < array.length - 1 &&
            state.highlights.has(array[index + 1].id);
          const isPrevSelected = index > 0 &&
            state.highlights.has(array[index - 1].id);

          const classParts: string[] = [];
          if (isNextSelected) classParts.push('adjacent-right');
          if (isPrevSelected) classParts.push('adjacent-left');

          return {
            ...sentence,
            leftPercent: (sentence.start / state.duration) * 100, // 計算左側百分比
            widthPercent: ((sentence.end - sentence.start) / state.duration) * 100, // 計算寬度百分比
            adjacentClass: classParts //樣式標籤（連續 highlight 的視覺優化）
          };
        })
        .filter(sentence => state.highlights.has(sentence.id));
    },
    // 找出當前時間所屬的highlight片段
    currentHighlightSegment(state): HighlightSentence | null {
      const sentences = this.highlightSegments;
      let current: HighlightSentence | null = null;
      let next: HighlightSentence | null = null;

      // 單次循環同時檢查
      for (const sentence of sentences) {
        // 檢查是否為當前片段
        if (state.currentTime >= sentence.start && state.currentTime < sentence.end) {
          current = sentence;
          break; // 找到當前片段即可停止
        }
        // 記錄第一個符合的「下一片段」
        if (!next && sentence.start > state.currentTime) {
          next = sentence;
        }
      }

      return current || next || null;
    },
    // 找出第一個highlight片段，用於初始化或預設播放
    firstHighlightSegment(state): HighlightSentence | null {
      const sentences = this.highlightSegments;
      if (sentences.length > 0) {
        return sentences[0];
      }
      return null;
    },
    // 計算當前播放進度的百分比
    progressPercent(state): number {
      if (!state.duration) return 0;
      return (state.currentTime / state.duration) * 100;
    },
  },

  actions: {
    // 初始化載入 transcript 資料
    async loadTranscript() {
      const json = await transcriptApi.loadTranscript()
      if (json) {
        console.log('Loaded transcript:', json)
        this.transcript = json
        this.highlights = new Set(json.highlightIds)
        const segment = this.currentHighlightSegment
        if (segment) this.setCurrentTime(segment.start)
      }
      return json
    },
    // 更新 highlights 片段
    toggleSentence(id: string) {
      const copy = new Set(this.highlights)
      if (copy.has(id)) {
        copy.delete(id)
      } else {
        copy.add(id)
      }
      this.highlights = copy
    },
    setCurrentTime(t: number) {
      this.currentTime = t
    },
    setDuration(d: number) {
      this.duration = d
    },
  }
})
