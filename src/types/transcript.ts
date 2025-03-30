export interface Sentence {
  id: string
  start: number
  end: number
  text: string
}

export interface Section {
  title: string
  startTime: number
  endTime: number
  sentences: Sentence[]
}

export interface TranscriptData {
  videoUrl: string
  fullTranscript: string
  sections: Section[]
  highlightIds: string[]
}

export interface HighlightSentence extends Sentence {
  leftPercent: number
  widthPercent: number
  adjacentClass: string[] // 'adjacent-left', 'adjacent-right'
}
