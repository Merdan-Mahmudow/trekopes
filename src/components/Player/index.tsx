import { useEffect, useRef, useState, useCallback } from 'react'
import { Box, Flex, Button, Text, HStack, IconButton, Image, CloseButton } from '@chakra-ui/react'
import { BsPlayFill, BsPauseFill, BsSkipBackwardFill, BsSkipForwardFill } from 'react-icons/bs'
import store from '../../store'
import { useStore } from '@tanstack/react-store'
import { setPlayerPlaying, playNext, playPrev, updatePlayerState, hidePlayer } from '../../store/player'
import { COLOR } from '../ui/colors'

const STORAGE_KEY = 'global_player_state_v2'

type PlayerState = {
  src?: string
  currentTime?: number
  isPlaying?: boolean
  currentTrackId?: string | null
}

type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error'

export function Player() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playerState = useStore(store, (state) => state.player)
  const [isPlaying, setIsPlaying] = useState<boolean>(!!playerState.isPlaying)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)
  const [status, setStatus] = useState<PlayerStatus>('idle')
  const seekingRef = useRef(false)

  // Initialize audio element
  useEffect(() => {
    const a = new Audio()
    a.preload = 'metadata'
    audioRef.current = a

    const onLoaded = () => {
      setDuration(a.duration || 0)
      setStatus('paused')
    }
    const onTime = () => {
      if (!seekingRef.current) {
        const currentTime = a.currentTime || 0
        setCurrent(currentTime)
        
        // Телеметрия: отслеживание завершения на 90%
        if (a.duration && currentTime > 0) {
          const percent = (currentTime / a.duration) * 100
          if (percent >= 90 && !a.dataset.completed90) {
            a.dataset.completed90 = 'true'
            trackTelemetry('complete', {
              track_id: playerState.currentTrackId,
              position: currentTime,
              percent,
            })
          }
        }
      }
      // Телеметрия: отправка события timeupdate
      dispatchEvent('player:timeupdate', {
        currentTime: a.currentTime,
        duration: a.duration,
        track_id: playerState.currentTrackId,
      })
    }
    const onEnded = () => {
      setIsPlaying(false)
      setStatus('ended')
      dispatchEvent('player:ended', { track_id: playerState.currentTrackId })
      
      // Auto play next if available
      if (playerState.queue && playerState.currentIndex !== undefined) {
        const nextIndex = playerState.currentIndex + 1
        if (nextIndex < playerState.queue.length) {
          playNext()
        }
      }
    }
    const onError = () => {
      setStatus('error')
      setIsPlaying(false)
      dispatchEvent('player:error', { track_id: playerState.currentTrackId })
    }
    const onLoadStart = () => setStatus('loading')
    const onCanPlay = () => {
      if (status === 'loading') setStatus('paused')
    }

    a.addEventListener('loadedmetadata', onLoaded)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('ended', onEnded)
    a.addEventListener('error', onError)
    a.addEventListener('loadstart', onLoadStart)
    a.addEventListener('canplay', onCanPlay)

    return () => {
      a.pause()
      a.removeEventListener('loadedmetadata', onLoaded)
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('ended', onEnded)
      a.removeEventListener('error', onError)
      a.removeEventListener('loadstart', onLoadStart)
      a.removeEventListener('canplay', onCanPlay)
      audioRef.current = null
    }
  }, [])

  // Load src when it changes
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    if (playerState.src) {
      // Reset completion flag when track changes
      delete a.dataset.completed90
      a.src = playerState.src
      a.load()
      setStatus('loading')
    } else {
      a.removeAttribute('src')
      a.load()
    }
  }, [playerState.src])

  // Play/pause side effect
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    if (isPlaying && playerState.src) {
      a.play()
        .then(() => {
          setStatus('playing')
          dispatchEvent('player:play', { track_id: playerState.currentTrackId })
          // Телеметрия: play
          trackTelemetry('play', { track_id: playerState.currentTrackId, position: a.currentTime })
        })
        .catch(() => {
          setIsPlaying(false)
          setStatus('error')
        })
    } else {
      a.pause()
      if (status !== 'loading' && status !== 'idle') {
        setStatus('paused')
        dispatchEvent('player:pause', { track_id: playerState.currentTrackId })
        // Телеметрия: pause
        trackTelemetry('pause', { track_id: playerState.currentTrackId, position: a.currentTime })
      }
    }
  }, [isPlaying, playerState.src, playerState.currentTrackId, status])

  // Keep local isPlaying in sync with store
  useEffect(() => {
    if (typeof playerState.isPlaying === 'boolean') {
      setIsPlaying(!!playerState.isPlaying)
    }
  }, [playerState.isPlaying])

  // Restore state from sessionStorage when src changes
  useEffect(() => {
    if (!playerState.src) return
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed: PlayerState = JSON.parse(raw)
      if (parsed?.currentTime && audioRef.current && parsed.currentTime > 0 && parsed.src === playerState.src) {
        audioRef.current.currentTime = parsed.currentTime
        setCurrent(parsed.currentTime)
      }
      if (parsed?.isPlaying && parsed.src === playerState.src) {
        setIsPlaying(true)
      }
    } catch {
      // ignore
    }
  }, [playerState.src])

  // Persist state to sessionStorage
  useEffect(() => {
    try {
      const payload: PlayerState = {
        currentTime: current,
        isPlaying,
        src: playerState.src,
        currentTrackId: playerState.currentTrackId,
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // ignore
    }
  }, [current, isPlaying, playerState.src, playerState.currentTrackId])

  // Auto-hide removed - player stays visible when paused

  const toggle = useCallback(() => {
    setIsPlaying(p => {
      const next = !p
      setPlayerPlaying(next)
      return next
    })
  }, [])

  const seek = useCallback((delta: number) => {
    const a = audioRef.current
    if (!a) return
    const newTime = Math.max(0, Math.min(duration, current + delta))
    a.currentTime = newTime
    setCurrent(newTime)
    trackTelemetry('seek', {
      track_id: playerState.currentTrackId,
      position: newTime,
      source: 'keyboard',
    })
  }, [current, duration, playerState.currentTrackId])

const HAVE_METADATA = 1;

function getClientX(e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>): number | null {
  // Сначала тач, потом мышь
  // На touchend клиентХ лежит в changedTouches
  // На некоторых девайсах событие может прилететь дважды (tap -> click) — снаружи отсей.
  // Здесь просто извлекаем координату.
  // @ts-ignore
  if ('changedTouches' in e && e.changedTouches?.[0]) return e.changedTouches[0].clientX;
  // @ts-ignore
  if ('touches' in e && e.touches?.[0]) return e.touches[0].clientX;
  // @ts-ignore
  if ('clientX' in e && typeof e.clientX === 'number') return e.clientX;
  return null;
}

function resolveDuration(a: HTMLAudioElement, fallback?: number): number | null {
  // Нормальная duration
  if (Number.isFinite(a.duration) && a.duration > 0) return a.duration;

  // HLS/стримы: duration может быть Infinity — берём фактический конец из seekable
  if (a.duration === Infinity && a.seekable?.length) {
    const end = a.seekable.end(a.seekable.length - 1);
    if (Number.isFinite(end) && end > 0) return end;
  }

  // Падаем на проп duration из стейта, если он валиден
  if (Number.isFinite(fallback) && (fallback as number) > 0) return fallback as number;

  return null;
}

const handleSeek = useCallback((
  e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
) => {
  e.preventDefault();
  e.stopPropagation();

  const a = audioRef.current;
  if (!a) {
    console.warn('[Player] handleSeek: audioRef.current is null');
    return;
  }

  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
  const width = rect?.width ?? 0;
  if (!Number.isFinite(width) || width <= 0) {
    console.warn('[Player] handleSeek: invalid rect.width', width);
    return;
  }

  const cx = getClientX(e);
  if (!Number.isFinite(cx)) {
    console.warn('[Player] handleSeek: clientX is non-finite', cx);
    return;
  }

  const x = (cx as number) - rect.left;
  const percentRaw = x / width;
  // Аккуратно клаем проценты
  const percent = Math.max(0, Math.min(1, Number.isFinite(percentRaw) ? percentRaw : 0));

  const safeApply = () => {
    const dur = resolveDuration(a, duration);
    if (!Number.isFinite(dur) || (dur as number) <= 0) {
      console.warn('[Player] handleSeek: duration non-finite/<=0', { aDuration: a.duration, fallback: duration });
      return;
    }

    // Считаем цель и валидируем
    const newTimeRaw = percent * (dur as number);
    const newTime = Number.isFinite(newTimeRaw) ? newTimeRaw : 0;

    // Доп. защита от невалидных значений
    if (!Number.isFinite(newTime) || newTime < 0) {
      console.warn('[Player] handleSeek: computed newTime non-finite', { percent, dur, newTimeRaw });
      return;
    }

    try {
      a.currentTime = newTime;   // ← тут раньше падало
      setCurrent(newTime);
      seekingRef.current = false;

      trackTelemetry('seek', {
        track_id: playerState.currentTrackId,
        position: newTime,
        source: 'progress_bar',
      });

      console.log('[Player] Seek OK', { width, x, percent, newTime, dur });
    } catch (err) {
      console.warn('[Player] handleSeek: failed to set currentTime', err, { percent, width, x });
    }
  };

  // Если метаданные не готовы — дождёмся
  if (a.readyState < HAVE_METADATA) {
    const onMeta = () => {
      a.removeEventListener('loadedmetadata', onMeta);
      safeApply();
    };
    a.addEventListener('loadedmetadata', onMeta, { once: true });
    try { a.load?.(); } catch {}
  } else {
    safeApply();
  }
}, [duration, playerState.currentTrackId]);

  const handleNext = useCallback(() => {
    if (playerState.queue && playerState.currentIndex !== undefined) {
      const nextIndex = playerState.currentIndex + 1
      if (nextIndex < playerState.queue.length) {
        playNext()
        trackTelemetry('next', {
          track_id: playerState.currentTrackId,
          source: 'button',
        })
      }
    }
  }, [playerState.queue, playerState.currentIndex, playerState.currentTrackId])

  const handlePrev = useCallback(() => {
    if (playerState.queue && playerState.currentIndex !== undefined) {
      const prevIndex = playerState.currentIndex - 1
      if (prevIndex >= 0) {
        playPrev()
        trackTelemetry('prev', {
          track_id: playerState.currentTrackId,
          source: 'button',
        })
      }
    }
  }, [playerState.queue, playerState.currentIndex, playerState.currentTrackId])

  const handleHide = useCallback(() => {
    hidePlayer()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input/textarea
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      const a = audioRef.current
      if (!a || !playerState.isVisible) return

      switch (e.key) {
        case ' ': // Space
          e.preventDefault()
          toggle()
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (e.shiftKey) {
            seek(-10)
          } else {
            seek(-5)
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          if (e.shiftKey) {
            seek(10)
          } else {
            seek(5)
          }
          break
        case 'n':
        case 'N':
          e.preventDefault()
          handleNext()
          break
        case 'p':
        case 'P':
          e.preventDefault()
          handlePrev()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, current, duration, toggle, seek, handleNext, handlePrev, playerState.isVisible])

  const format = (t: number) => {
    if (!isFinite(t)) return '0:00'
    const mm = Math.floor(t / 60)
    const ss = Math.floor(t % 60)
    return `${mm}:${ss.toString().padStart(2, '0')}`
  }

  const progressPercent = duration > 0 ? (current / duration) * 100 : 0

  // Public API
  useEffect(() => {
    const playerAPI = {
      play: () => setIsPlaying(true),
      pause: () => setIsPlaying(false),
      next: handleNext,
      prev: handlePrev,
      seek: (secondsOrPercent: number | { seconds?: number; percent?: number }) => {
        const a = audioRef.current
        if (!a) return
        let newTime: number
        if (typeof secondsOrPercent === 'number') {
          if (secondsOrPercent >= 0 && secondsOrPercent <= 1) {
            // Percent
            newTime = secondsOrPercent * duration
          } else {
            // Seconds
            newTime = secondsOrPercent
          }
        } else {
          if (secondsOrPercent.percent !== undefined) {
            newTime = secondsOrPercent.percent * duration
          } else {
            newTime = secondsOrPercent.seconds || 0
          }
        }
        newTime = Math.max(0, Math.min(duration, newTime))
        a.currentTime = newTime
        setCurrent(newTime)
      },
      show: () => updatePlayerState({ isVisible: true }),
      hide: handleHide,
      loadQueue: (_tracks: any[], _startIndex?: number) => {
        // This is handled by store actions
      },
    }
    // @ts-ignore
    window.__GLOBAL_PLAYER__ = playerAPI
    dispatchEvent('player:ready', {})
  }, [handleNext, handlePrev, handleHide, duration])

  const canGoNext = playerState.queue && playerState.currentIndex !== undefined && playerState.currentIndex < playerState.queue.length - 1
  const canGoPrev = playerState.queue && playerState.currentIndex !== undefined && playerState.currentIndex > 0

  if (!playerState.isVisible) {
    return null
  }

  return (
    <Box
      role="region"
      aria-label="Audio player"
      position="relative"
      w="100vw"
      zIndex={1200}
      bg="#1c1c1e"
      color="#f2f2f2"
      boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
      borderBottomRadius={"2xl"}
      
    >
      <Flex
        align="center"
        gap={3}
        px={4}
        py={3}
        minH={{ base: '76px', md: '64px' }}
        maxH={{ base: '88px', md: '72px' }}
        borderBottomRadius={"2xl"}
        
      >
        {/* Cover */}
        {(playerState.cover || playerState.title) && (
          <Box
            w={{ base: '40px', md: '32px' }}
            h={{ base: '40px', md: '32px' }}
            flexShrink={0}
            borderRadius="md"
            overflow="hidden"
            bg="#2a2a2d"
            
          >
            {playerState.cover ? (
              <Image
                src={playerState.cover}
                alt={playerState.title || 'Track cover'}
                w="100%"
                h="100%"
                objectFit="cover"
              />
            ) : (
              <Box w="100%" h="100%" display="flex" alignItems="center" justifyContent="center" fontSize="xs">
                🎵
              </Box>
            )}
          </Box>
        )}

        {/* Track Info */}
        <Box flex={1} minW={0} onClick={() => {
          // Click on track info to open playlist/queue
          dispatchEvent('player:queuechange', {})
        }} style={{ cursor: 'pointer' }}>
          <Text
            fontSize={{ base: 'sm', md: 'xs' }}
            fontWeight={600}
            lineHeight="1.2"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            title={playerState.title || 'Без названия'}
          >
            {playerState.title || 'Без названия'}
          </Text>
          <Text
            fontSize={{ base: 'xs', md: '2xs' }}
            color="#b3b3b3"
            lineHeight="1.2"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            title={playerState.artist || 'Трекопёс'}
          >
            {playerState.artist || 'Трекопёс'}
          </Text>
        </Box>

        {/* Controls */}
        <HStack gap={1} flexShrink={0}>
          <IconButton
            aria-label="Previous track"
            aria-disabled={!canGoPrev}
            size="sm"
            variant="ghost"
            colorScheme="gray"
            onClick={handlePrev}
            disabled={!canGoPrev}
            _hover={{ bg: '#2a2a2d' }}
            _active={{ bg: '#3a3a3d' }}
            minW="40px"
            minH="40px"
          >
            <BsSkipBackwardFill />
          </IconButton>
          <Button
            aria-label={isPlaying ? 'Pause' : 'Play'}
            aria-pressed={isPlaying}
            onClick={toggle}
            w="50px"
            h="50px"
            variant="ghost"
            rounded="full"
            bg={isPlaying ? '#2a2a2d' : COLOR.kit.iconBg}
            color="white"
            _hover={{ bg: isPlaying ? '#3a3a3d' : COLOR.kit.orange }}
            _active={{ bg: isPlaying ? '#4a4a4d' : COLOR.kit.orange }}
            _focus={{ outline: '2px solid ' + COLOR.kit.orange, outlineOffset: '2px' }}
            loading={status === 'loading'}
          >
            {status === 'loading' ? null : isPlaying ? <BsPauseFill size={20} /> : <BsPlayFill size={20} />}
          </Button>
          <IconButton
            aria-label="Next track"
            aria-disabled={!canGoNext}
            size="sm"
            variant="ghost"
            colorScheme="gray"
            onClick={handleNext}
            disabled={!canGoNext}
            _hover={{ bg: '#2a2a2d' }}
            _active={{ bg: '#3a3a3d' }}
            minW="40px"
            minH="40px"
          >
            <BsSkipForwardFill />
          </IconButton>
        </HStack>

        {/* Time - обратный отсчет */}
        <HStack gap={2} flexShrink={0} justify="flex-end">
          <Text fontSize={{ base: 'xs', md: '2xs' }} color="#b3b3b3">
            -{format(Math.max(0, duration - current))}
          </Text>
        </HStack>

        {/* Hide button */}
        <IconButton
          aria-label="Hide player"
          size="sm"
          variant="ghost"
          colorScheme="gray"
          onClick={handleHide}
          _hover={{ bg: '#2a2a2d' }}
          _active={{ bg: '#3a3a3d' }}
          minW="32px"
          minH="32px"
        >
          <CloseButton />
        </IconButton>
      </Flex>

      {/* Progress bar */}
      <Box
        position="relative"
        h="3px"
        bg="#2a2a2d"
        cursor="pointer"
        onClick={handleSeek}
        onTouchEnd={handleSeek}
        onMouseMove={(e) => {
          if (!duration) return
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left
          const percent = Math.max(0, Math.min(1, x / rect.width))
          const hoverIndicator = e.currentTarget.querySelector('.hover-indicator') as HTMLElement
          if (hoverIndicator) {
            hoverIndicator.style.width = `${percent * 100}%`
          }
        }}
        onMouseLeave={(e) => {
          const hoverIndicator = e.currentTarget.querySelector('.hover-indicator') as HTMLElement
          if (hoverIndicator) {
            hoverIndicator.style.width = '0%'
          }
        }}
      >
        {/* Hover indicator */}
        <Box
          className="hover-indicator"
          position="absolute"
          left={0}
          top={0}
          bottom={0}
          width="0%"
          bg="rgba(106, 167, 255, 0.3)"
          pointerEvents="none"
          transition="width 0.1s ease"
          zIndex={1}
        />
        {/* Progress */}
        <Box
          position="absolute"
          left={0}
          top={0}
          bottom={0}
          h="100%"
          bg="#6aa7ff"
          width={`${progressPercent}%`}
          transition="width 0.1s linear"
          borderRadius="0 2px 2px 0"
          zIndex={2}
          pointerEvents="none"
        />
      </Box>
    </Box>
  )
}

// Helper functions
function dispatchEvent(eventName: string, detail: any) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(eventName, { detail }))
  }
}

function trackTelemetry(action: string, data: any) {
  // Телеметрия: отправка событий
  console.log('[Telemetry]', action, data)
  // Здесь можно добавить отправку на сервер аналитики
  // Например: analytics.track(action, data)
}

export default Player
