// utils/baseApi.ts
import { apiRequest, type ApiRequestOptions } from './apiRequestHandler'

export class BaseApi {
  protected baseUrl: string = import.meta.env.VITE_API_BASE_URL || ''

  constructor(baseUrl: string = '') {
    this.baseUrl += baseUrl
  }

  protected async fetchData<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data?: Record<string, unknown>,
    options?: ApiRequestOptions<T>
  ): Promise<T | null> {
    const url = `${this.baseUrl}${endpoint}`

    return apiRequest<T>(async () => {
      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      if (data) {
        config.body = JSON.stringify(data)
      }

      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return response.json()
    }, options)
  }

  public async get<T>(endpoint: string, options?: ApiRequestOptions<T>): Promise<T | null> {
    return this.fetchData<T>('GET', endpoint, undefined, options)
  }

  public async post<T>(endpoint: string, data: Record<string, unknown>, options?: ApiRequestOptions<T>): Promise<T | null> {
    return this.fetchData<T>('POST', endpoint, data, options)
  }
}
