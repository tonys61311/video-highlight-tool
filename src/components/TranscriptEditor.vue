<template>
  <div class="transcript" ref="scrollContainer">
    <h3>Transcript</h3>
    <div class="sections">
      <TranscriptSection v-for="section in store.sections" :key="section.title" :section="section" />
    </div>
  </div>
</template>

<script setup lang="ts">
import TranscriptSection from '@/components/TranscriptSection.vue'
import { useTranscriptStore } from '@/stores/transcriptStore'
import { useScrollContainerProvider } from '@/hooks/useScrollContainer'

const store = useTranscriptStore()
const { scrollContainer } = useScrollContainerProvider()

</script>

<style scoped lang="scss">
.transcript {
  padding: 1rem;
  display: flex;
  flex-direction: column;
}
</style>
