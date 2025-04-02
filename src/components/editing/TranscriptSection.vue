<template>
  <div class="section">
    <h4>{{ section.title }}</h4>
    <ul>
      <li v-for="s in section.sentences" :key="s.id" :ref="el => setSentenceRef(el as HTMLLIElement, s.id)"
        :class="{ selected: isSelected(s.id), focused: isFocused(s.id) }" @click="toggle(s.id)">
        <span class="time" @click.stop="seekTo(s.id, s.start)">{{ formatTime(s.start) }}</span>
        <span class="text">{{ s.text }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useTranscriptStore } from '@/stores/transcriptStore'
import type { Section } from '@/types/transcript'
import { computed, ref, watch, nextTick } from "vue";
import { useScrollContainer } from '@/hooks/useScrollContainer'
import { useVideoControl } from '@/hooks/useVideoControl'
import { formatTime } from '@/utils/helpers'

defineProps<{
  section: Section
}>()

const store = useTranscriptStore()
const highlights = computed(() => store.highlights)
const currentHighlightSegment = computed(() => store.currentHighlightSegment)
const firstHighlightSegment = computed(() => store.firstHighlightSegment)
const sentenceRefs = ref<Map<string, HTMLLIElement>>(new Map()) // 儲存句子的 DOM 元素，用於滾動到特定句子
const { scrollToElement } = useScrollContainer()
const { setCurrentTime } = useVideoControl()

// 修正後的 ref 回調函數
const setSentenceRef = (el: HTMLLIElement | null, id: string) => {
  if (el) sentenceRefs.value.set(id, el)
  else sentenceRefs.value.delete(id) // 刪除已經不存在的元素
}

// 當前句子是否已選中
function isSelected(id: string) {
  return highlights.value.has(id);
}

// 判斷當前句子是否為focused
function isFocused(id: string) {
  return currentHighlightSegment.value?.id === id;
}

function toggle(id: string) {
  store.toggleSentence(id)
  if (isFocused(id)) setCurrentTime(firstHighlightSegment.value?.start || 0)
  else setCurrentTime(currentHighlightSegment.value?.start || 0)
}

function seekTo(id: string, time: number) {
  if (isSelected(id)) {
    setCurrentTime(time) // 如果已選中，直接跳轉到該時間
  }
}

// 監聽 currentHighlightSegment 的變化，滾動到相應的句子
watch(currentHighlightSegment, async (newSegment) => {
  if (!newSegment) return

  await nextTick() // 等待 DOM 更新

  const sentenceEl = sentenceRefs.value.get(newSegment.id)
  if (sentenceEl) {
    scrollToElement(sentenceEl, {
      behavior: 'smooth',
      block: 'center'
    })
  }
})
</script>

<style scoped lang="scss">
.section {
  h4 {
    margin-top: 1rem;
    font-weight: bold;
    color: #333;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      display: flex;
      align-items: center;
      background: #fff;
      margin: 0.25rem 0;
      padding: 0.5rem;
      border-radius: 6px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.2s ease;

      .time {
        font-weight: bold;
        margin-right: 0.5rem;
        color: gray;
      }

      .text {
        color: #333;
      }

      &.selected {
        background: #3b82f6;

        .time,
        .text {
          color: white;
        }
      }

      &.focused {
        border-color: #f53e0b; // Orange border for focused state
        box-shadow: 0 0 0 1px #f53e0b;
      }
    }
  }
}
</style>
