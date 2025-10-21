import { useTracks } from "../../hooks/useTracks";
import {
    Box,
    VStack,
    HStack,
    Text,
    IconButton,
    Spinner,
    Separator,
    Button,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
// import type { Telegram } from "telegram-web-app";
import { FaPlay, FaDownload } from "react-icons/fa";
import type { SongItem } from "../../types/songs";
import { updatePlayerState, setCurrentTrack } from "../../store/player";
import store from '../../store';
import { useStore } from '@tanstack/react-store';
import { BsPauseFill } from 'react-icons/bs'

export function MusicList({ listType }: { listType: "mytracks" | "examples" }) {
    // const tg: Telegram = window.Telegram;
    const { loadTracks } = useTracks();
    const { isLoading, data, error } = useQuery({
        queryKey: ["tracks", listType],
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

    const handlePlay = (s: SongItem) => {
        const url = getTrackUrl(s);
        if (!url) return;
        const id = s.id
        // if clicked same track -> toggle
        if (playerState.currentTrackId === id) {
            updatePlayerState({ isPlaying: !playerState.isPlaying });
            return
        }
        // otherwise set current track by id and start playing
        setCurrentTrack(id, url, true)
    };

    return (
        <Box p={4} w="100%">
            <VStack gap={3} align="stretch">
                {isLoading && (
                    <HStack justify="center" py={8}>
                        <Spinner size="md" />
                        <Text>Загрузка треков...</Text>
                    </HStack>
                )}

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
                                    <Box key={s.id} p={3} bg="gray.900" borderRadius="md">
                                        <HStack justify="space-between">
                                            <HStack gap={3} align="center">
                                                                        <Button
                                                                            onClick={() => handlePlay(s)}
                                                                            aria-label={`Play ${s.title ?? "track"}`}
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            colorScheme="orange"
                                                                        >
                                                                            {playerState.currentTrackId === s.id && playerState.isPlaying ? (
                                                                                <><BsPauseFill style={{ marginRight: 8 }} /> Pause</>
                                                                            ) : (
                                                                                <><FaPlay style={{ marginRight: 8 }} /> Play</>
                                                                            )}
                                                                        </Button>
                                                <Box>
                                                    <Text fontWeight={600}>{s.title ?? "Без названия"}</Text>
                                                    <Text fontSize="sm" color="gray.300">
                                                        {s.author ?? "Неизвестный"}
                                                    </Text>
                                                </Box>
                                            </HStack>

                                            <HStack>
                                                <Text color="gray.300">{formatDuration(s.duration)}</Text>
                                                                        {url && (
                                                                            <a href={url} target="_blank" rel="noopener noreferrer">
                                                                                <IconButton aria-label="download" size="sm">
                                                                                    <FaDownload />
                                                                                </IconButton>
                                                                            </a>
                                                                        )}
                                            </HStack>
                                        </HStack>
                                    </Box>
                                );
                            })
                        ) : (
                            <Box p={4} bg="gray.900" borderRadius="md">
                                <Text>
                                    {listType === "mytracks"
                                        ? "У вас пока нет загруженных треков."
                                        : "Примеры треков пока не доступны."}
                                </Text>
                            </Box>
                        )}
                    </>
                )}

                <Separator />
            </VStack>
        </Box>
    );
}