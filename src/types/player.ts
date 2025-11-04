export interface Track {
  id: string
  src: string
  title?: string
  artist?: string
  cover?: string
  duration?: number
}

export type PlayerProps = {
  src?: string
  isVisible?: boolean
  isPlaying?: boolean
  currentTrackId?: string | null
  queue?: Track[]
  currentIndex?: number
  title?: string
  artist?: string
  cover?: string
}