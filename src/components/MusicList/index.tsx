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
    defineConfig,
    createSystem,
    defaultConfig,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { FaPlay } from "react-icons/fa";
import type { SongItem } from "../../types/songs";
import { updatePlayerState, setCurrentTrack, loadQueue } from "../../store/player";
import type { Track } from "../../types/player";
import store from '../../store';
import { useStore } from '@tanstack/react-store';
import { BsPauseFill } from 'react-icons/bs'
import { COLOR } from "../ui/colors";
import { LuCopyPlus } from "react-icons/lu";
import { Link } from "@tanstack/react-router";
import { HiOutlineDownload } from "react-icons/hi";

const config = defineConfig({
    theme: {
        keyframes: {
            wave: {
                "0%, 100%": { transform: "scaleY(0.45)", opacity: "0.55" },
                "40%": { transform: "scaleY(1.1)", opacity: "1" },
                "60%": { transform: "scaleY(0.75)", opacity: "0.8" },
            }
        }
    }
})
export const system = createSystem(defaultConfig, config)
function LoadingWave() {
    return (
        <HStack justify="center" py={6} gap={4}>
            <HStack gap={2}>
                {Array.from({ length: 5 }).map((_, idx) => (
                    <Box
                        key={idx}
                        w="6px"
                        h="34px"
                        borderRadius="full"
                        bgGradient="linear(to-b, rgba(12,220,247,0.15), rgba(12,220,247,0.9))"
                        boxShadow="0 0 12px rgba(12,220,247,0.55)"
                        animationName="wave"
                        animationDuration="1.3s"
                        animationTimingFunction="ease-in-out"
                        animationIterationCount="infinite"
                        animationDelay={`${idx * 0.12}s`}
                        transformOrigin="center bottom"
                    />
                ))}
            </HStack>
            <Text fontSize="sm" color={COLOR.kit.smoke} letterSpacing="0.02em">
                Загружаем треки...
            </Text>
        </HStack>
    )
}

export function MusicList() {
    // const tg: Telegram = window.Telegram;
    const { loadTracks } = useTracks();

    const { isLoading, data, error } = useQuery({
        queryKey: ["tracks"],
        queryFn: loadTracks,
    });

    const getTrackUrl = (s: SongItem): string | null => {
        if (s.download_url) return s.download_url;
        if (s.files) {
            const keys = Object.keys(s.files || {});
            // try to find an active file first
            for (const k of keys) {
                const f = s.files?.[k];
                if (f && f.active && f.url) return f.url;
            }
            // fallback to first available
            for (const k of keys) {
                const f = s.files?.[k];
                if (f && f.url) return f.url;
            }
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

    const handlePlay = (s: SongItem, allTracks?: SongItem[]) => {
        const url = getTrackUrl(s);
        if (!url) return;
        const id = s.id

        // if clicked same track -> toggle
        if (playerState.currentTrackId === id) {
            updatePlayerState({ isPlaying: !playerState.isPlaying });
            return
        }

        // Build queue from all tracks if available
        if (allTracks && allTracks.length > 0) {
            const tracks: Track[] = allTracks
                .filter(t => {
                    const trackUrl = getTrackUrl(t);
                    return trackUrl && t.status !== 'failed';
                })
                .map(t => ({
                    id: t.id,
                    src: getTrackUrl(t)!,
                    title: t.title ?? undefined,
                    artist: t.author ?? undefined,
                    duration: t.duration ?? undefined,
                }));

            const startIndex = tracks.findIndex(t => t.id === id);
            if (startIndex >= 0) {
                loadQueue(tracks, startIndex);
                return;
            }
        }

        // Fallback: set single track
        setCurrentTrack(id, url, true, s.title ?? undefined, s.author ?? undefined, undefined)
    };

    return (
        <Box p={4} w="100%" pb={"10dvh"}>
            <VStack gap={3} align="stretch">
                {isLoading && <LoadingWave />}

                {error && (
                    <Box bg="red.900" color="white" p={3} borderRadius="md">
                        Ошибка при загрузке треков.
                    </Box>
                )}

                {!isLoading && !error && (
                    <>
                        {data?.data && data.data.length > 0 ? (
                            data.data
                                .filter((s: SongItem) => s.status !== 'failed')
                                .map((s: SongItem) => {
                                    const url = getTrackUrl(s);
                                    return (
                                        <Box key={s.id} p={3} bg={COLOR.kit.darkGray} borderRadius="2xl">
                                            <HStack justify="space-between">
                                                <HStack gap={3} align="center">
                                                    <Button
                                                        onClick={() => handlePlay(s, data.data)}
                                                        aria-label={`Play ${s.title ?? "track"}`}
                                                        size="sm"
                                                        variant="ghost"
                                                        colorScheme="orange"
                                                    >
                                                        {playerState.currentTrackId === s.id && playerState.isPlaying ? (
                                                            <><BsPauseFill /></>
                                                        ) : (
                                                            <><FaPlay /></>
                                                        )}
                                                    </Button>
                                                    <Box>
                                                        <Text fontWeight={600} lineClamp={1}>{s.title ?? "Без названия"}</Text>
                                                        <Text fontSize="sm" color="gray.300">
                                                            {s.author ?? "Трекопёс"}
                                                        </Text>
                                                    </Box>
                                                </HStack>

                                                <HStack>
                                                    <Text color="gray.300">{formatDuration(s.duration)}</Text>
                                                    {url && (
                                                        <a href={url} target="_blank" rel="noopener noreferrer">
                                                            <IconButton aria-label="download" size="sm" variant={"ghost"}>
                                                                <HiOutlineDownload />
                                                            </IconButton>
                                                        </a>
                                                    )}
                                                </HStack>
                                            </HStack>
                                        </Box>
                                    );
                                })
                        ) : (
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
                )}
            </VStack>
        </Box>
    );
}