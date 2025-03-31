// composables/useScrollContainer.ts
import { ref, provide, inject, type Ref } from 'vue'

const SCROLL_CONTAINER_KEY = Symbol('scroll_container')

export function useScrollContainerProvider() {
  const scrollContainer = ref<HTMLElement | null>(null)

  const scrollToElement = (el: HTMLElement, options?: ScrollIntoViewOptions) => {
    if (!scrollContainer.value) return

    // 計算相對位置
    const containerRect = scrollContainer.value.getBoundingClientRect()
    const elementRect = el.getBoundingClientRect()

    const isVisible = (
      elementRect.top >= containerRect.top &&
      elementRect.bottom <= containerRect.bottom
    )

    if (!isVisible) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        ...options
      })
    }
  }

  provide(SCROLL_CONTAINER_KEY, {
    scrollContainer,
    scrollToElement
  })

  return { scrollContainer }
}

export function useScrollContainer() {
  const ctx = inject<{
    scrollContainer: Ref<HTMLElement | null>
    scrollToElement: (el: HTMLElement, options?: ScrollIntoViewOptions) => void
  }>(SCROLL_CONTAINER_KEY)

  if (!ctx) {
    throw new Error('useScrollContainer must be used within a provider')
  }

  return ctx
}
