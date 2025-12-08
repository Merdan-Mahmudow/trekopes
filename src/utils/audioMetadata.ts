import { parseBlob } from 'music-metadata'
import { debugWarn } from './logger'

export type ExtractCoverOptions = {
  signal?: AbortSignal
  rangeHeader?: string
  /** Максимальный размер для загрузки (по умолчанию 2MB) */
  maxSize?: number
}

const DEFAULT_RANGE = 'bytes=0-2097151' // ~2 MB (ID3 теги обычно в начале файла)
const DEFAULT_MAX_SIZE = 20 * 1024 * 1024 // 20 MB

/**
 * Загружает аудиофайл и извлекает встроенную обложку (APIC).
 * Сначала пробует Range request, если сервер не поддерживает — загружает целиком.
 * Возвращает data URL с изображением или undefined, если обложки нет/недоступна.
 */
export async function extractEmbeddedCoverFromAudio(
  src: string,
  options?: ExtractCoverOptions
): Promise<string | undefined> {
  try {
    // Сначала пробуем Range request
    let response = await fetch(src, {
      signal: options?.signal,
      headers: {
        Range: options?.rangeHeader ?? DEFAULT_RANGE,
      },
    })

    // Если сервер не поддерживает Range (статус 200 вместо 206) или ошибка — пробуем без Range
    if (response.status === 200 || !response.ok) {
      // Проверяем Content-Length, чтобы не грузить слишком большие файлы
      const contentLength = response.headers.get('Content-Length')
      const maxSize = options?.maxSize ?? DEFAULT_MAX_SIZE
      
      if (contentLength && parseInt(contentLength, 10) > maxSize) {
        debugWarn('[audioMetadata] File too large, skipping', { size: contentLength, src })
        return undefined
      }

      // Если статус не OK, делаем новый запрос без Range
      if (!response.ok) {
        response = await fetch(src, { signal: options?.signal })
        if (!response.ok) {
          debugWarn('[audioMetadata] Fetch failed', { status: response.status, src })
          return undefined
        }
      }
    }

    const blob = await response.blob()
    const metadata = await parseBlob(blob)
    const picture = metadata.common.picture?.[0]

    if (!picture?.data?.length) {
      return undefined
    }

    return buildDataUrl(picture.data, picture.format)
  } catch (error) {
    if ((error as DOMException)?.name === 'AbortError') {
      return undefined
    }
    debugWarn('[audioMetadata] Cover extraction error', error, { src })
    return undefined
  }
}

function buildDataUrl(bytes: Uint8Array, format?: string): string {
  let binary = ''
  const chunkSize = 0x8000

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }

  const base64 = globalThis.btoa(binary)
  const mime = format || 'image/jpeg'

  return `data:${mime};base64,${base64}`
}

