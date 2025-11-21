import { parseBlob } from 'music-metadata-browser'
import { debugWarn } from './logger'

export type ExtractCoverOptions = {
  signal?: AbortSignal
  rangeHeader?: string
}

const DEFAULT_RANGE = 'bytes=0-524287' // ~512 KB

/**
 * Загружает минимальный фрагмент аудио и пытается извлечь встроенную обложку (APIC).
 * Возвращает data URL с изображением или undefined, если обложки нет/недоступна.
 */
export async function extractEmbeddedCoverFromAudio(
  src: string,
  options?: ExtractCoverOptions
): Promise<string | undefined> {
  try {
    const response = await fetch(src, {
      signal: options?.signal,
      headers: {
        Range: options?.rangeHeader ?? DEFAULT_RANGE,
      },
    })

    if (!response.ok) {
      debugWarn('[audioMetadata] Fetch failed', { status: response.status, src })
      return undefined
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

