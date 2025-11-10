import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Flex, IconButton, Text } from '@chakra-ui/react'
import 'plyr/dist/plyr.css'
import Plyr from 'plyr-react'
import type { APITypes } from 'plyr-react'
import { BsSkipBackwardFill, BsSkipForwardFill } from 'react-icons/bs'
import { useStore } from '@tanstack/react-store'
import store from '../../store'
import { hidePlayer, playNext, playPrev, setPlayerPlaying, updatePlayerState } from '../../store/player'
import type { Track } from '../../types/player'

type PlayerProps = {
  song?: Track | null
}

export function Player({ song }: PlayerProps) {
  const playerState = useStore(store, (state) => state.player)
  const plyrRef = useRef<APITypes | null>(null)
  const detachListenersRef = useRef<(() => void) | null>(null)
  const hideTimeoutRef = useRef<number | null>(null)
  const preventAutoHideRef = useRef(false)
  const [isPlyrReady, setIsPlyrReady] = useState(false)

  const source = useMemo(() => {
    if (!song?.src) return undefined
    const title = song.title?.trim() || 'Без названия'
    const artist = song.artist?.trim()
    return {
      type: 'audio' as const,
      title: artist ? `${artist} — ${title}` : title,
      sources: [
        {
          src: song.src,
          type: 'audio/mp3',
        },
      ],
    }
  }, [song])

  const canGoPrev =
    (playerState.queue?.length ?? 0) > 0 && typeof playerState.currentIndex === 'number' && playerState.currentIndex > 0
  const canGoNext =
    (playerState.queue?.length ?? 0) > 0 &&
    typeof playerState.currentIndex === 'number' &&
    playerState.currentIndex < playerState.queue.length - 1

  const showPlayer = useCallback(() => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
    updatePlayerState({ isVisible: true })
  }, [])

  const scheduleHide = useCallback(() => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current)
    }
    hideTimeoutRef.current = window.setTimeout(() => {
      hidePlayer()
      hideTimeoutRef.current = null
    }, 220)
  }, [])

  const destroyPlyrInstance = useCallback(() => {
    if (detachListenersRef.current) {
      try {
        detachListenersRef.current()
      } catch (err) {
        console.warn('[Player] failed to detach listeners', err)
      }
      detachListenersRef.current = null
    }

    const instance = plyrRef.current?.plyr as unknown as { destroy?: () => void } | undefined
    if (instance?.destroy) {
      try {
        instance.destroy()
      } catch (err) {
        console.warn('[Player] failed to destroy Plyr instance', err)
      }
    }

    plyrRef.current = null
  }, [])

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current)
      }
      destroyPlyrInstance()
    }
  }, [destroyPlyrInstance])

  const handleRef = useCallback((api: APITypes | null) => {
    if (!api) {
      destroyPlyrInstance()
      return
    }
    plyrRef.current = api
    setIsPlyrReady(true)
  }, [destroyPlyrInstance])

  useEffect(() => {
    if (!isPlyrReady || !plyrRef.current) return
    if (detachListenersRef.current) {
      detachListenersRef.current()
      detachListenersRef.current = null
    }

    const instance = plyrRef.current.plyr

    const handlePlay = () => {
      preventAutoHideRef.current = false
      showPlayer()
      setPlayerPlaying(true)
    }

    const handlePause = () => {
      if (preventAutoHideRef.current) {
        preventAutoHideRef.current = false
        return
      }
      setPlayerPlaying(false)
      scheduleHide()
    }

    const handleEnded = () => {
      if (canGoNext) {
        preventAutoHideRef.current = true
        playNext()
      } else {
        setPlayerPlaying(false)
        scheduleHide()
      }
    }

    instance.on('play', handlePlay)
    instance.on('pause', handlePause)
    instance.on('ended', handleEnded)

    const detachInstance = () => {
      const safeInstance = instance as unknown as { off?: (event: string, cb: (...args: any[]) => void) => void; elements?: { container?: Element | null } }
      if (!safeInstance?.elements?.container || typeof safeInstance.off !== 'function') {
        return
      }
      safeInstance.off('play', handlePlay)
      safeInstance.off('pause', handlePause)
      safeInstance.off('ended', handleEnded)
    }

    detachListenersRef.current = detachInstance

    return detachInstance
  }, [canGoNext, isPlyrReady, scheduleHide, showPlayer])

  useEffect(() => {
    const plyrInstance = plyrRef.current?.plyr
    if (!plyrInstance) return

    const media = (plyrInstance as unknown as { media?: HTMLMediaElement }).media
    const callPlay = () => {
      if (typeof plyrInstance.play === 'function') {
        return plyrInstance.play()
      }
      if (media && typeof media.play === 'function') {
        return media.play()
      }
      return Promise.resolve()
    }

    const callPause = () => {
      if (typeof plyrInstance.pause === 'function') {
        plyrInstance.pause()
        return
      }
      if (media && typeof media.pause === 'function') {
        media.pause()
      }
    }

    if (!song?.src || !source) {
      if (typeof (plyrInstance as { stop?: () => void }).stop === 'function') {
        plyrInstance.stop()
      } else {
        callPause()
      }
      return
    }

    if (playerState.isPlaying) {
      showPlayer()
      Promise.resolve(callPlay()).catch(() => {
        // Автовоспроизведение может быть заблокировано браузером
      })
    } else {
      callPause()
    }
  }, [playerState.isPlaying, showPlayer, song, source])

  useEffect(() => {
    if (!song?.src) {
      destroyPlyrInstance()
      hidePlayer()
    }
  }, [destroyPlyrInstance, song])

  const handlePrev = useCallback(() => {
    if (!canGoPrev) return
    preventAutoHideRef.current = true
    playPrev()
  }, [canGoPrev])

  const handleNext = useCallback(() => {
    if (!canGoNext) return
    preventAutoHideRef.current = true
    playNext()
  }, [canGoNext])

  if (!song || !source) {
    return null
  }

  return (
    <Box
      px={4}
      py={3}
      bg="gray.900"
      color="white"
      borderRadius="lg"
      boxShadow="0 8px 32px rgba(0, 0, 0, 0.35)"
      maxW="480px"
      mx="auto"
      mt={3}
      transition="opacity 0.2s ease, transform 0.2s ease"
      opacity={playerState.isVisible ? 1 : 0}
      transform={playerState.isVisible ? 'translateY(0)' : 'translateY(12px)'}
      pointerEvents={playerState.isVisible ? 'auto' : 'none'}
    >
      <Flex justify="space-between" align="center" mb={3}>
        <Box>
          <Text fontSize="xs" color="gray.400">
            Сейчас играет
          </Text>
          <Text fontWeight={600} fontSize="md">
            {song.title || 'Без названия'}
          </Text>
          {song.artist ? (
            <Text fontSize="sm" color="gray.400">
              {song.artist}
            </Text>
          ) : null}
        </Box>
        <Flex gap={2}>
          <IconButton
            aria-label="Предыдущий трек"
            size="sm"
            variant="ghost"
            colorScheme="whiteAlpha"
            onClick={handlePrev}
            disabled={!canGoPrev}
          >
            <BsSkipBackwardFill />
          </IconButton>
          <IconButton
            aria-label="Следующий трек"
            size="sm"
            variant="ghost"
            colorScheme="whiteAlpha"
            onClick={handleNext}
            disabled={!canGoNext}
          >
            <BsSkipForwardFill />
          </IconButton>
        </Flex>
      </Flex>

      <Plyr
        key={song.id ?? song.src}
        ref={handleRef}
        source={source}
        options={{
          controls: ['play', 'progress', 'current-time', 'duration', 'mute', 'volume'],
          autoplay: playerState.isPlaying,
          clickToPlay: true,
        }}
      />
    </Box>
  )
}