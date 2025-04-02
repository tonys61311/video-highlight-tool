// src/utils/helpers.ts

/**
 * 將秒數格式化為 mm:ss 字串
 * @param seconds 秒數
 * @returns 格式化時間字串
 */
export function formatTime(seconds: number): string {
  const min = Math.floor(seconds / 60)
  const sec = String(Math.floor(seconds % 60)).padStart(2, '0')
  return `${min}:${sec}`
}
