import { useTracks } from "../../hooks/useTracks";
import {
    Box,
    VStack,
    HStack,
    Text,
    IconButton,
    Button,
    Grid,
    GridItem,
    Icon,
    Skeleton,
    Portal,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { FaPlay } from "react-icons/fa";
import type { GenerationDto } from "../../types/webapp";
import { updatePlayerState, setCurrentTrack, loadQueue } from "../../store/player";
import type { Track } from "../../types/player";
import store from '../../store';
import { useStore } from '@tanstack/react-store';
import { BsPauseFill } from 'react-icons/bs'
import { COLOR } from "../ui/colors";
import { LuCopyPlus } from "react-icons/lu";
import { Link } from "@tanstack/react-router";
import { HiOutlineDownload } from "react-icons/hi";
import { debugLog, logError } from "../../utils/logger";
import { TbTextRecognition } from "react-icons/tb";
import { MdPushPin, MdShare, MdReport, MdDelete } from "react-icons/md";
import { useState, useRef, useEffect } from "react";
import type { Telegram } from "telegram-web-app";
import { Popup } from "../Popup";
import { motion } from "framer-motion";
import { useReducedMotion } from "../ui/accessibility";
import { ReactLenis } from "lenis/react";
const MotionBox = motion(Box);

export default function LoadingWave({
    bars = 5,
    barWidth = "6px",
    barHeight = "34px",
    duration = 1.3,
    delayStep = 0.12,
    startColor = "rgba(12,220,247,0.15)",
    endColor = "rgba(12,220,247,0.9)",
    glowColor = "rgba(12,220,247,0.55)",
    label = "Загружаем треки...",
    textColor = "#9BA0A6", // замените на COLOR.kit.smoke при необходимости
    ...rest
}) {
    const prefersReducedMotion = useReducedMotion();


    return (
        <HStack justify="center" py={6} gap={4} role="status" aria-live="polite" {...rest}>
            <HStack gap={2}>
                {Array.from({ length: bars }).map((_, idx) => (
                    <MotionBox
                        key={idx}
                        w={barWidth}
                        h={barHeight}
                        borderRadius="full"
                        bg={COLOR.kit.orange}
                        style={{ transformOrigin: "center bottom" }}
                        initial={{ scaleY: 0.6 }}
                        animate={
                            prefersReducedMotion
                                ? { scaleY: 0.8 }
                                : { scaleY: [0.45, 1, 0.45] }
                        }
                        transition={{
                            duration: prefersReducedMotion ? 0 : duration,
                            repeat: prefersReducedMotion ? 0 : Infinity,
                            delay: idx * delayStep,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </HStack>
            {label ? (
                <Text fontSize="sm" color={textColor} letterSpacing="0.02em">
                    {label}
                </Text>
            ) : null}
        </HStack>
    );
}
export function MusicList() {
    const { loadTracks, token } = useTracks();
    const musicState = useStore(store, (s) => s.music);
    const [lyricsModal, setLyricsModal] = useState<{
        title: string;
        lyrics: string;
        style?: string;
        status?: string;
    } | null>(null);
    const [contextMenu, setContextMenu] = useState<{
        open: boolean;
        x: number;
        y: number;
        generation: GenerationDto | null;
    }>({
        open: false,
        x: 0,
        y: 0,
        generation: null,
    });
    const [pinnedTracksState, setPinnedTracksState] = useState<string[]>([]);
    const [longPressingId, setLongPressingId] = useState<string | null>(null);

    const { isLoading, data, error } = useQuery({
        queryKey: ["webapp-generations", token],
        queryFn: loadTracks,
        enabled: Boolean(token),
        staleTime: 30_000,
    });

    const generations = (data?.data ?? musicState.generations) ?? [];

    // Загружаем закрепленные треки при монтировании и обновляем при изменении
    useEffect(() => {
        setPinnedTracksState(getPinnedTracks());
    }, []);

    const getTrackUrl = (generation: GenerationDto): string | null => {
        const song = generation.song;
        if (!song) {
            return null;
        }
        if (song.download_url) return song.download_url;
        if (Array.isArray(song.files)) {
            const activeFile = song.files.find(
                (file: any) => file && typeof file === "object" && file.active && file.url
            );
            if (activeFile?.url) return activeFile.url as string;
            const firstFile = song.files.find(
                (file: any) => file && typeof file === "object" && file.url
            );
            if (firstFile?.url) return firstFile.url as string;
        }
        return null;
    };

    const formatDuration = (s?: number | null) => {
        if (!s || Number.isNaN(s)) return "—";
        const sec = Math.floor(s % 60);
        const min = Math.floor((s / 60) % 60);
        return `${min}:${sec.toString().padStart(2, "0")}`;
    };

    const playerState = useStore(store, (s) => s.player)

    const handlePlay = (generation: GenerationDto, allGenerations?: GenerationDto[]) => {
        const url = getTrackUrl(generation);
        if (!url) return;
        const songId = generation.song?.id ?? generation.id;

        // if clicked same track -> toggle
        if (playerState.currentTrackId === songId) {
            updatePlayerState({ isPlaying: !playerState.isPlaying });
            return
        }

        // Build queue from all tracks if available
        if (allGenerations && allGenerations.length > 0) {
            const tracks: Track[] = allGenerations
                .filter(gen => {
                    const trackUrl = getTrackUrl(gen);
                    return trackUrl && gen.status !== 'failed';
                })
                .map(gen => ({
                    id: gen.song?.id ?? gen.id,
                    src: getTrackUrl(gen)!,
                    title: gen.song?.title ?? gen.generated_title ?? undefined,
                    artist: gen.song?.author ?? undefined,
                    duration: gen.song?.duration ?? undefined,
                }));

            const startIndex = tracks.findIndex(t => t.id === songId);
            if (startIndex >= 0) {
                loadQueue(tracks, startIndex);
                return;
            }
        }

        // Fallback: set single track
        setCurrentTrack(
            songId,
            url,
            true,
            generation.song?.title ?? generation.generated_title ?? undefined,
            generation.song?.author ?? undefined,
            undefined
        )
    };

    // Обработка долгого нажатия для контекстного меню
    const longPressTimerRef = useRef<number | null>(null);
    const LONG_PRESS_DURATION = 500; // 500ms

    const handleLongPressStart = (generation: GenerationDto, event: React.TouchEvent | React.MouseEvent) => {
        // Предотвращаем стандартное поведение браузера только для mouse-событий
        // Для touch-событий preventDefault не работает в passive listeners
        if (!('touches' in event)) {
            event.preventDefault();
        }
        
        const trackId = generation.song?.id ?? generation.id;
        setLongPressingId(trackId);
        
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
        longPressTimerRef.current = window.setTimeout(() => {
            // Виброотдача при долгом нажатии
            const tg: Telegram | undefined = window.Telegram;
            if (tg?.WebApp?.HapticFeedback) {
                tg.WebApp.HapticFeedback.impactOccurred("heavy");
            }
    
            // Позиционирование меню с учетом границ экрана
            const menuWidth = 200;
            const menuHeight = 120;
            const x = Math.min(clientX, window.innerWidth - menuWidth - 10);
            const y = Math.min(clientY, window.innerHeight - menuHeight - 10);
            
            setContextMenu({
                open: true,
                x: Math.max(10, x),
                y: Math.max(10, y),
                generation,
            });
        }, LONG_PRESS_DURATION);
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        // Предотвращаем стандартное контекстное меню браузера
        e.preventDefault();
    };

    const handleLongPressEnd = () => {
        setLongPressingId(null);
        if (longPressTimerRef.current) {
            window.clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    };

    const handleContextMenuClose = () => {
        setContextMenu({
            open: false,
            x: 0,
            y: 0,
            generation: null,
        });
    };

    // Очистка таймера при размонтировании
    useEffect(() => {
        return () => {
            if (longPressTimerRef.current) {
                window.clearTimeout(longPressTimerRef.current);
            }
        };
    }, []);

    // Функции для новых кнопок
    const PINNED_TRACKS_KEY = 'pinned_tracks';

    const getPinnedTracks = (): string[] => {
        try {
            const pinned = localStorage.getItem(PINNED_TRACKS_KEY);
            return pinned ? JSON.parse(pinned) : [];
        } catch {
            return [];
        }
    };

    const isTrackPinned = (trackId: string): boolean => {
        return pinnedTracksState.includes(trackId);
    };

    const handlePinTrack = (generation: GenerationDto) => {
        const trackId = generation.song?.id ?? generation.id;
        const pinned = [...pinnedTracksState];
        
        if (isTrackPinned(trackId)) {
            // Открепляем
            const updated = pinned.filter(id => id !== trackId);
            localStorage.setItem(PINNED_TRACKS_KEY, JSON.stringify(updated));
            setPinnedTracksState(updated);
        } else {
            // Закрепляем
            pinned.push(trackId);
            localStorage.setItem(PINNED_TRACKS_KEY, JSON.stringify(pinned));
            setPinnedTracksState(pinned);
        }
        
        handleContextMenuClose();
    };

    const handleShareTrack = (generation: GenerationDto) => {
        const tg: Telegram | undefined = window.Telegram;
        const url = getTrackUrl(generation);
        
        if (!tg?.WebApp || !url) {
            logError("Telegram WebApp not available or track URL missing", undefined, { hasTg: !!tg, hasUrl: !!url });
            return;
        }

        // Для отправки аудио через Telegram используем прямую ссылку на файл
        // Это откроет диалог отправки аудио в Telegram
        // Формат: https://t.me/share/url?url=<audio_url>
        const shareLink = `https://t.me/share/url?url=${encodeURIComponent(url)}`;
        tg.WebApp.openTelegramLink(shareLink);
        
        handleContextMenuClose();
    };

    const handleReportTrack = (generation: GenerationDto) => {
        const trackId = generation.song?.id ?? generation.id;
        const reportText = `Жалоба на трек ID: ${trackId}`;
        const reportUrl = `https://t.me/Help_llec_bot?text=${encodeURIComponent(reportText)}`;
        
        const tg: Telegram | undefined = window.Telegram;
        if (tg?.WebApp) {
            tg.WebApp.openTelegramLink(reportUrl);
        } else {
            window.open(reportUrl, '_blank', 'noopener,noreferrer');
        }
        
        handleContextMenuClose();
    };

    const handleDeleteTrack = (generation: GenerationDto) => {
        // TODO: Реализовать удаление трека
        debugLog('Delete track:', generation.id);
        handleContextMenuClose();
    };

    return (
        <>
            <Box p={4} w="100%" pb={"10dvh"}>
                <VStack gap={3} align="stretch">
                    {isLoading && <LoadingWave />}

                    {error && (
                        <Box bg="red.900" color="white" p={3} borderRadius="md">
                            Ошибка при загрузке треков.
                        </Box>
                    )}

                    {!isLoading && !error && (() => {
                        // Разделяем треки на закрепленные и незакрепленные
                        const filteredGenerations = generations.filter(
                            (generation: GenerationDto) => generation.song?.status !== 'failed' && generation.status !== 'failed'
                        );
                        
                        const pinned = filteredGenerations.filter((gen: GenerationDto) => 
                            pinnedTracksState.includes(gen.song?.id ?? gen.id)
                        );
                        const unpinned = filteredGenerations.filter((gen: GenerationDto) => 
                            !pinnedTracksState.includes(gen.song?.id ?? gen.id)
                        );

                        return (
                            <>
                                {pinned.length > 0 && (
                                    <>
                                        {pinned.map((generation: GenerationDto) => {
                                        const url = getTrackUrl(generation);
                                        const title = generation.song?.title ?? generation.generated_title ?? "Без названия";
                                        const author = generation.song?.author ?? "Трекопёс";
                                        const status = generation.status;
                                        if (status === 'processing' || status === 'pending') {
                                            return (
                                                <Skeleton key={generation.id} p={3} bg={COLOR.kit.darkGray} borderRadius="2xl" h="70px" />
                                            )
                                        }
                                        const trackId = generation.song?.id ?? generation.id;
                                        const isPinned = isTrackPinned(trackId);
                                        const isLongPressing = longPressingId === trackId;
                                        
                                        return (
                                            <MotionBox
                                                key={generation.id}
                                                p={3}
                                                bg={isPinned ? "gray.800": COLOR.kit.darkGray}
                                                borderRadius="2xl"
                                                onTouchStart={(e) => handleLongPressStart(generation, e)}
                                                onTouchEnd={handleLongPressEnd}
                                                onTouchCancel={handleLongPressEnd}
                                                onMouseDown={(e) => handleLongPressStart(generation, e)}
                                                onMouseUp={handleLongPressEnd}
                                                onMouseLeave={handleLongPressEnd}
                                                onContextMenu={handleContextMenu}
                                                position="relative"
                                                userSelect="none"
                                                animate={{
                                                    scale: isLongPressing ? 0.95 : 1,
                                                }}
                                                transition={{
                                                    duration: LONG_PRESS_DURATION / 1000,
                                                    ease: "easeOut",
                                                }}
                                            >
                                                <HStack justify="space-between">
                                                    <HStack gap={3} align="center">
                                                        <Button
                                                            onClick={() => handlePlay(generation, generations)}
                                                            aria-label={`Play ${title}`}
                                                            size="sm"
                                                            variant="ghost"
                                                            colorScheme="orange"
                                                        >
                                                            {playerState.currentTrackId === (generation.song?.id ?? generation.id) && playerState.isPlaying ? (
                                                                <><BsPauseFill /></>
                                                            ) : (
                                                                <><FaPlay /></>
                                                            )}
                                                        </Button>
                                                        <Box flex={1}>
                                                            <HStack gap={2} align="center">
                                                                <Box flex={1}>
                                                                    <Text fontWeight={600} lineClamp={1}>{title}</Text>
                                                                    <Text fontSize="sm" color="gray.300">
                                                                        {author}
                                                                    </Text>
                                                                </Box>
                                                            </HStack>
                                                        </Box>
                                                    </HStack>

                                                    <HStack>
                                                        <Text color="gray.300">{formatDuration(generation.song?.duration)}</Text>
                                                        {(
                                                            generation.generated_lyrics ||
                                                            generation.song?.lyrics
                                                        ) && (
                                                                <IconButton
                                                                    aria-label="show-lyrics"
                                                                    size="md"
                                                                    variant={"ghost"}
                                                                    onClick={() =>
                                                                        setLyricsModal({
                                                                            title,
                                                                            lyrics:
                                                                                generation.generated_lyrics ||
                                                                                generation.song?.lyrics ||
                                                                                "",
                                                                            style:
                                                                                generation.generated_style ||
                                                                                generation.song?.style ||
                                                                                undefined,
                                                                            status: generation.status,
                                                                        })
                                                                    }
                                                                >
                                                                    <TbTextRecognition />
                                                                </IconButton>
                                                            )}
                                                        {url && (
                                                            <a href={url} target="_blank" rel="noopener noreferrer">
                                                                <IconButton aria-label="download" size="md" variant={"ghost"}>
                                                                    <HiOutlineDownload />
                                                                </IconButton>
                                                            </a>
                                                        )}
                                                    </HStack>
                                                </HStack>
                                            </MotionBox>
                                        );
                                        })}
                                        {unpinned.length > 0 && (
                                            <>
                                                <Box h="2px" bg="rgba(255,255,255,0.12)" my={2} />
                                            </>
                                        )}
                                    </>
                                )}
                                {unpinned.length > 0 && (
                                    <>
                                        {unpinned.map((generation: GenerationDto) => {
                                        const url = getTrackUrl(generation);
                                        const title = generation.song?.title ?? generation.generated_title ?? "Без названия";
                                        const author = generation.song?.author ?? "Трекопёс";
                                        const status = generation.status;
                                        if (status === 'processing' || status === 'pending') {
                                            return (
                                                <Skeleton key={generation.id} p={3} bg={COLOR.kit.darkGray} borderRadius="2xl" h="70px" >Генерирую...</Skeleton>
                                            )
                                        }
                                        const trackId = generation.song?.id ?? generation.id;
                                        const isPinned = isTrackPinned(trackId);
                                        const isLongPressing = longPressingId === trackId;
                                        
                                        return (
                                            <MotionBox
                                                key={generation.id}
                                                p={3}
                                                bg={COLOR.kit.darkGray}
                                                borderRadius="2xl"
                                                onTouchStart={(e) => handleLongPressStart(generation, e)}
                                                onTouchEnd={handleLongPressEnd}
                                                onTouchCancel={handleLongPressEnd}
                                                onMouseDown={(e) => handleLongPressStart(generation, e)}
                                                onMouseUp={handleLongPressEnd}
                                                onMouseLeave={handleLongPressEnd}
                                                onContextMenu={handleContextMenu}
                                                position="relative"
                                                userSelect="none"
                                                WebkitUserSelect={"none"}
                                                WebkitTouchCallout={"none"}
                                                touchAction={"manipulation"}
                                                animate={{
                                                    scale: isLongPressing ? 0.95 : 1,
                                                }}
                                                transition={{
                                                    duration: LONG_PRESS_DURATION / 1000,
                                                    ease: "easeOut",
                                                    delay: isLongPressing ? 0.3 : LONG_PRESS_DURATION / 1200,
                                                }}
                                            >
                                                <HStack justify="space-between">
                                                    <HStack gap={3} align="center">
                                                        <Button
                                                            onClick={() => handlePlay(generation, generations)}
                                                            aria-label={`Play ${title}`}
                                                            size="sm"
                                                            variant="ghost"
                                                            colorScheme="orange"
                                                        >
                                                            {playerState.currentTrackId === (generation.song?.id ?? generation.id) && playerState.isPlaying ? (
                                                                <><BsPauseFill /></>
                                                            ) : (
                                                                <><FaPlay /></>
                                                            )}
                                                        </Button>
                                                        <Box flex={1}>
                                                            <HStack gap={2} align="center">
                                                                {isPinned && (
                                                                    <Icon fontSize="sm" color={COLOR.kit.orange}>
                                                                        <MdPushPin />
                                                                    </Icon>
                                                                )}
                                                                <Box flex={1}>
                                                                    <Text fontWeight={600} lineClamp={1}>{title}</Text>
                                                                    <Text fontSize="sm" color="gray.300">
                                                                        {author}
                                                                    </Text>
                                                                </Box>
                                                            </HStack>
                                                        </Box>
                                                    </HStack>

                                                    <HStack>
                                                        <Text color="gray.300">{formatDuration(generation.song?.duration)}</Text>
                                                        {(
                                                            generation.generated_lyrics ||
                                                            generation.song?.lyrics
                                                        ) && (
                                                                <IconButton
                                                                    aria-label="show-lyrics"
                                                                    size="md"
                                                                    variant={"ghost"}
                                                                    onClick={() =>
                                                                        setLyricsModal({
                                                                            title,
                                                                            lyrics:
                                                                                generation.generated_lyrics ||
                                                                                generation.song?.lyrics ||
                                                                                "",
                                                                            style:
                                                                                generation.generated_style ||
                                                                                generation.song?.style ||
                                                                                undefined,
                                                                            status: generation.status,
                                                                        })
                                                                    }
                                                                >
                                                                    <TbTextRecognition />
                                                                </IconButton>
                                                            )}
                                                        {url && (
                                                            <a href={url} target="_blank" rel="noopener noreferrer">
                                                                <IconButton aria-label="download" size="md" variant={"ghost"}>
                                                                    <HiOutlineDownload />
                                                                </IconButton>
                                                            </a>
                                                        )}
                                                    </HStack>
                                                </HStack>
                                            </MotionBox>
                                        );
                                        })}
                                    </>
                                )}
                                {pinned.length === 0 && unpinned.length === 0 && (
                                <Grid gridTemplateRows={"repeat(3, 1fr)"} justifyContent={"center"} h={"80dvh"}>
                                    <GridItem></GridItem>
                                    <GridItem display={"flex"} color={COLOR.kit.orange}>
                                        <Link to='/generate' style={{ display: "flex", alignItems: "center", flexDirection: "column", width: "100%" }}>
                                            <Icon fontSize={"6xl"} children={<LuCopyPlus />} />
                                            <Text color={COLOR.kit.orange} fontSize={"xl"} fontWeight={"bolder"}>Создать трек</Text>
                                        </Link>
                                    </GridItem>
                                    <GridItem></GridItem>

                                </Grid>
                                )}
                            </>
                        );
                    })()}
                </VStack>
            </Box>
            <Popup
                open={Boolean(lyricsModal)}
                title={lyricsModal?.title ?? ""}
                onOpenChange={() => setLyricsModal(null)}
            >
                <ReactLenis
                    options={{
                        smoothWheel: true,
                        syncTouch: true,
                        lerp: 0.1,
                        duration: 0.23,
                        wheelMultiplier: 2,
                        touchMultiplier: 0,
                        infinite: false,
                        overscroll: true
                    }}
                    style={{
                        height: "100%",
                        width: "100%",
                        overflow: "auto",
                    }}
                >
                    <VStack color={COLOR.kit.orangeWhite}>
                        <VStack alignItems="stretch" gap={2} fontSize="md">

                            {lyricsModal?.lyrics.split("\n").map((line, index) => {
                                const trimmed = line.trim();
                                if (!trimmed) {
                                    return <Box key={`empty-${index}`} h="4" />;
                                }

                                const isSection =
                                    trimmed.startsWith("[") && trimmed.endsWith("]");
                                const sectionLabel = isSection
                                    ? trimmed
                                        .replace(/^\[|\]$/g, "")
                                        .replace(/intro/i, "Интро")
                                        .replace(/outro/i, "Аутро")
                                        .replace(/verse/i, "Куплет")
                                        .replace(/chorus/i, "Припев")
                                        .replace(/bridge/i, "Бридж")
                                        .replace(/hook/i, "Хук")
                                        .replace(/pre[-\s]?chorus/i, "Препев")
                                    : trimmed;

                                return (
                                    <Text
                                        key={`${sectionLabel}-${index}`}
                                        fontWeight={isSection ? "semibold" : "normal"}
                                        fontSize="md"
                                        color={isSection ? COLOR.kit.orange : COLOR.kit.orangeWhite}
                                        textTransform={isSection ? "uppercase" : "none"}
                                        letterSpacing={isSection ? "0.08em" : "normal"}
                                    >
                                        {sectionLabel}
                                    </Text>
                                );
                            })}
                        </VStack>
                    </VStack>
                </ReactLenis>
            </Popup>

            {/* Контекстное меню */}
            {contextMenu.open && contextMenu.generation && (
                <Portal>
                    <Box
                        position="fixed"
                        left={contextMenu.x}
                        top={contextMenu.y}
                        zIndex={1000}
                        bg={COLOR.kit.darkGray}
                        border="1px solid"
                        borderColor="rgba(255,255,255,0.12)"
                        borderRadius="xl"
                        p={2}
                        minW="200px"
                        boxShadow="0 8px 32px rgba(0,0,0,0.4)"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <VStack align="stretch">
                            {contextMenu.generation && (
                                <>
                                    {/* Закрепить */}
                                    <Button
                                        variant="ghost"
                                        justifyContent="flex-start"
                                        onClick={() => handlePinTrack(contextMenu.generation!)}
                                        color={COLOR.kit.white}
                                        _hover={{ bg: "rgba(255,255,255,0.1)" }}
                                    >
                                        <HStack gap={2}>
                                            <Icon fontSize="md">
                                                <MdPushPin />
                                            </Icon>
                                            <Text>
                                                {isTrackPinned(contextMenu.generation.song?.id ?? contextMenu.generation.id) 
                                                    ? 'Открепить' 
                                                    : 'Закрепить'}
                                            </Text>
                                        </HStack>
                                    </Button>

                                    <Box h="1px" bg="rgba(255,255,255,0.12)" />

                                    {/* Поделиться */}
                                    {getTrackUrl(contextMenu.generation) && (
                                        <Button
                                            variant="ghost"
                                            justifyContent="flex-start"
                                            onClick={() => handleShareTrack(contextMenu.generation!)}
                                            color={COLOR.kit.white}
                                            _hover={{ bg: "rgba(255,255,255,0.1)" }}
                                        >
                                            <HStack gap={2}>
                                                <Icon fontSize="md">
                                                    <MdShare />
                                                </Icon>
                                                <Text>Поделиться</Text>
                                            </HStack>
                                        </Button>
                                    )}

                                    <Box h="1px" bg="rgba(255,255,255,0.12)"/>

                                    {/* Пожаловаться */}
                                    <Button
                                        variant="ghost"
                                        justifyContent="flex-start"
                                        onClick={() => handleReportTrack(contextMenu.generation!)}
                                        color={COLOR.kit.white}
                                        _hover={{ bg: "rgba(255,255,255,0.1)" }}
                                    >
                                        <HStack gap={2}>
                                            <Icon fontSize="md">
                                                <MdReport />
                                            </Icon>
                                            <Text>Пожаловаться</Text>
                                        </HStack>
                                    </Button>

                                    <Box h="1px" bg="rgba(255,255,255,0.12)" />

                                    {/* Удалить */}
                                    <Button
                                        variant="ghost"
                                        justifyContent="flex-start"
                                        onClick={() => handleDeleteTrack(contextMenu.generation!)}
                                        color={"red.500"}
                                        _hover={{ bg: "rgba(255,255,255,0.1)" }}
                                    >
                                        <HStack gap={2}>
                                            <Icon fontSize="md">
                                                <MdDelete />
                                            </Icon>
                                            <Text>Удалить</Text>
                                        </HStack>
                                    </Button>
                                </>
                            )}
                        </VStack>
                    </Box>
                </Portal>
            )}

            {/* Оверлей для закрытия меню */}
            {contextMenu.open && (
                <Box
                    position="fixed"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    zIndex={999}
                    onClick={handleContextMenuClose}
                />
            )}

        </>
    );
}