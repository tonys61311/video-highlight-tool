// stores/transcriptStore.ts
import { defineStore } from 'pinia'
import type { TranscriptData, Section, HighlightSentence } from '@/types/transcript'

export const useTranscriptStore = defineStore('transcript', {
  state: () => ({
    transcript: null as TranscriptData | null,
    highlights: new Set<string>(),
    currentTime: 0,
    duration: 1,
    videoRef: null as HTMLVideoElement | null,
  }),

  getters: {
    sections(state): Section[] {
      return state.transcript?.sections || []
    },
    selectedIds(state): string[] {
      return Array.from(state.highlights)
    },
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
            leftPercent: (sentence.start / state.duration) * 100,
            widthPercent: ((sentence.end - sentence.start) / state.duration) * 100,
            adjacentClass: classParts
          };
        })
        .filter(sentence => state.highlights.has(sentence.id));
    },
    // 找出當前時間所屬的高亮片段
    currentHighlightSegment(state): HighlightSentence | null {
      const sentences = this.highlightSegments;
      let current: HighlightSentence | null = null;
      let next: HighlightSentence | null = null;

      // 單次循環同時檢查
      for (const sentence of sentences) {
        // 檢查是否為當前片段
        if (state.currentTime >= sentence.start && state.currentTime <= sentence.end) {
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
    firstHighlightSegment(state): HighlightSentence | null {
      const sentences = this.highlightSegments;
      if (sentences.length > 0) {
        return sentences[0];
      }
      return null;
    },
    progressPercent(state): number {
      if (!state.duration) return 0;
      return (state.currentTime / state.duration) * 100;
    },
  },

  actions: {
    async loadTranscript() {
      const res = await fetch('/mock/transcript.json')
      const json: TranscriptData = await res.json()

      this.transcript = json
      this.highlights = new Set(json.highlightIds)
      const segment = this.currentHighlightSegment
      if (segment) this.currentTime = segment.start // 設定當前時間為highlight片段的開始時間
    },
    toggleSentence(id: string) {
      const copy = new Set(this.highlights)
      if (copy.has(id)) {
        copy.delete(id)
      } else {
        copy.add(id)
      }
      this.highlights = copy
      if (this.videoRef) {
        this.videoRef.currentTime = this.firstHighlightSegment?.start || 0;
      }
    },
    setCurrentTime(t: number) {
      this.currentTime = t
    },
    setVideoRefCurrentTime(t: number) {
      if (this.videoRef) {
        this.videoRef.currentTime = t
      }
    },
    setDuration(d: number) {
      this.duration = d
    },
    setVideoRef(ref: HTMLVideoElement | null) {
      this.videoRef = ref;
    },
  }
})
