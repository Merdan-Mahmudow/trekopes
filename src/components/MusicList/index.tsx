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
import { TbTextRecognition } from "react-icons/tb";
import { useState } from "react";
import { Popup } from "../Popup";
import { motion } from "framer-motion";
import { useReducedMotion } from "../ui/accessibility";
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

    const { isLoading, data, error } = useQuery({
        queryKey: ["webapp-generations", token],
        queryFn: loadTracks,
        enabled: Boolean(token),
        staleTime: 30_000,
    });

    const generations = (data?.data ?? musicState.generations) ?? [];

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

                    {!isLoading && !error && (
                        <>
                            {generations && generations.length > 0 ? (
                                generations
                                    .filter((generation: GenerationDto) => generation.song?.status !== 'failed' && generation.status !== 'failed')
                                    .map((generation: GenerationDto) => {
                                        const url = getTrackUrl(generation);
                                        const title = generation.song?.title ?? generation.generated_title ?? "Без названия";
                                        const author = generation.song?.author ?? "Трекопёс";
                                        const status = generation.status;
                                        if (status === 'processing') {
                                            return (
                                                <Skeleton key={generation.id} p={3} bg={COLOR.kit.darkGray} borderRadius="2xl" h="70px" />
                                            )
                                        }
                                        return (
                                            <Box key={generation.id} p={3} bg={COLOR.kit.darkGray} borderRadius="2xl">
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
                                                        <Box>
                                                            <Text fontWeight={600} lineClamp={1}>{title}</Text>
                                                            <Text fontSize="sm" color="gray.300">
                                                                {author}
                                                            </Text>
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
            <Popup
                open={Boolean(lyricsModal)}
                title={lyricsModal?.title ?? ""}
                onOpenChange={() => setLyricsModal(null)}
            >
                <VStack
                    align="stretch"
                    gap={4}
                    color={COLOR.kit.orangeWhite}
                    maxH="70dvh"
                    overflowY="auto"
                >

                    <VStack align="stretch" gap={2} fontSize="md">
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
                                    fontSize={"md"}
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
            </Popup>
        </>
    );
}