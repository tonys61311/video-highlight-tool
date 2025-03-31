import { defineStore } from 'pinia'

export const useApiStore = defineStore('api', {
  state: () => ({
    isLoading: false,
    error: null as string | null
  }),
  actions: {
    setLoading(loading: boolean) {
      this.isLoading = loading
    },
    setError(error: string | null) {
      this.error = error
    },
    resetError() {
      this.error = null
    }
  }
})
