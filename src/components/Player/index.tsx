import { useEffect, useRef, useState } from 'react'
import { Box, Flex, Button, Text } from '@chakra-ui/react'
import { BsPlayFill, BsPauseFill } from 'react-icons/bs'
import store from '../../store'
import { useStore } from '@tanstack/react-store'
import { setPlayerPlaying } from '../../store/player'

const STORAGE_KEY = 'global_player_state_v1'

type State = {
  src?: string
  currentTime?: number
  isPlaying?: boolean
}

export function Player() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playerState = useStore(store, (state) => state.player)
  const [isPlaying, setIsPlaying] = useState<boolean>(!!playerState.isPlaying)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)
  const seekingRef = useRef(false)

  // initialize audio element
  useEffect(() => {
    const a = new Audio()
    a.preload = 'metadata'
    audioRef.current = a

    const onLoaded = () => setDuration(a.duration || 0)
    const onTime = () => {
      if (!seekingRef.current) {
        setCurrent(a.currentTime || 0)
      }
    }
    const onEnded = () => setIsPlaying(false)

    a.addEventListener('loadedmetadata', onLoaded)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('ended', onEnded)

    return () => {
      a.pause()
      a.removeEventListener('loadedmetadata', onLoaded)
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('ended', onEnded)
      audioRef.current = null
    }
  }, [])

  // load src when it changes
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    if (playerState.src) {
      a.src = playerState.src
      a.load()
    } else {
      a.removeAttribute('src')
      a.load()
    }
  }, [playerState.src])

  // play/pause side effect
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    if (isPlaying) {
      a.play().catch(() => setIsPlaying(false))
    } else {
      a.pause()
    }
  }, [isPlaying, playerState.src])

  // keep local isPlaying in sync with store
  useEffect(() => {
    if (typeof playerState.isPlaying === 'boolean') {
      setIsPlaying(!!playerState.isPlaying)
    }
  }, [playerState.isPlaying])

  // restore time from storage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed: State = JSON.parse(raw)
      if (parsed?.currentTime && audioRef.current && parsed.currentTime > 0) {
        audioRef.current.currentTime = parsed.currentTime
        setCurrent(parsed.currentTime)
      }
      if (parsed?.isPlaying) setIsPlaying(true)
    } catch {
      // ignore
    }
  }, [])

  // persist currentTime + isPlaying when it changes
  useEffect(() => {
    try {
      const payload: State = { currentTime: current, isPlaying }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // ignore
    }
  }, [current, isPlaying])


  const toggle = () => {
    setIsPlaying(p => {
      const next = !p
      setPlayerPlaying(next)
      return next
    })
  }



  const format = (t: number) => {
    if (!isFinite(t)) return '0:00'
    const mm = Math.floor(t / 60)
    const ss = Math.floor(t % 60)
    return `${mm}:${ss.toString().padStart(2, '0')}`
  }

  // expose some global to allow programmatic control (optional)
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.__GLOBAL_PLAYER__ = {
      play: () => setIsPlaying(true),
      pause: () => setIsPlaying(false),
    }
  }, [])

  return (
    <Box position="fixed" bottom="18px" left="18px" zIndex={1200} bg="rgba(0,0,0,0.6)" p={3} borderRadius="md" display={!playerState.isVisible ? "none" : "block"}>
      <Flex align="center" gap={3} minW="260px">
        <Button onClick={toggle} aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? <BsPauseFill /> : <BsPlayFill />}
        </Button>
        <Box flex={1}>
            {/* Use native range input for compatibility */}
            <input
              aria-label="player-slider"
              type="range"
              min={0}
              step={0.1}
              max={Math.max(duration || 0, 0)}
              value={current}
              style={{ width: '100%' }}
              onPointerDown={() => { seekingRef.current = true }}
              onPointerUp={(e: any) => {
                seekingRef.current = false
                const val = Number(e.currentTarget?.value ?? e.target?.value ?? 0)
                const a = audioRef.current
                if (a) {
                  a.currentTime = val
                }
                setCurrent(val)
              }}
              onTouchStart={() => { seekingRef.current = true }}
              onTouchEnd={(e: any) => {
                seekingRef.current = false
                const val = Number(e.currentTarget?.value ?? e.target?.value ?? 0)
                const a = audioRef.current
                if (a) {
                  a.currentTime = val
                }
                setCurrent(val)
              }}
              onChange={(e: any) => {
                // reflect thumb position while dragging
                setCurrent(Number(e.target.value))
              }}
            />
          <Flex justify="space-between">
            <Text fontSize="xs">{format(current)}</Text>
            <Text fontSize="xs">{format(duration)}</Text>
          </Flex>
        </Box>
      </Flex>
    </Box>
  )
}

export default Player
