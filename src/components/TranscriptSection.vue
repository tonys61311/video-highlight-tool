<template>
  <div class="section">
    <h4>{{ section.title }}</h4>
    <ul>
      <li v-for="s in section.sentences" :key="s.id" :class="{ selected: isSelected(s.id) }" @click="toggle(s.id)">
        <span class="time" @click.stop="seekTo(s.id, s.start)">{{ formatTime(s.start) }}</span>
        <span class="text">{{ s.text }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useTranscriptStore } from '@/stores/transcriptStore'
import type { Section } from '@/types/transcript'
import { computed } from "vue";

defineProps<{
  section: Section
}>()

const store = useTranscriptStore()
const highlights = computed(() => store.highlights)

function isSelected(id: string) {
  return highlights.value.has(id);
}

function toggle(id: string) {
  store.toggleSentence(id)
}

function seekTo(id: string, time: number) {
  if (isSelected(id)) store.setCurrentTime(time)
}

function formatTime(seconds: number): string {
  const min = Math.floor(seconds / 60)
  const sec = String(Math.floor(seconds % 60)).padStart(2, '0')
  return `${min}:${sec}`
}
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
    }
  }
}
</style>
