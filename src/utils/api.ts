// utils/api.ts
import { useApiStore } from '@/stores/apiStore'

type ApiRequestOptions<T> = {
  showLoading?: boolean
  errorMessage?: string
  minLoadingTime?: number // 新增最小加載時間選項
}

export async function apiRequest<T>(
  request: () => Promise<T>,
  options?: ApiRequestOptions<T>
): Promise<T | null> {
  const apiStore = useApiStore()
  const {
    showLoading = true,
    errorMessage = '請求失敗，請稍後再試',
    minLoadingTime = 300, // 預設 300ms 最小加載時間
  } = options || {}

  let startTime: number | null = null

  try {
    if (showLoading) {
      apiStore.setLoading(true)
      startTime = Date.now()
    }

    const result = await request()
    apiStore.resetError()
    return result
  } catch (error) {
    console.error('API Error:', error)

    const apiError = error as { response?: { data?: { message?: string } } } & Error
    apiStore.setError(
      (apiError.response?.data?.message) ||
      (error instanceof Error && error.message) ||
      errorMessage
    )
    return null
  } finally {
    if (showLoading) {
      // 計算剩餘需要等待的時間
      const elapsed = startTime ? Date.now() - startTime : 0
      const remainingTime = minLoadingTime - elapsed

      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime))
      }

      apiStore.setLoading(false)
    }
  }
}
