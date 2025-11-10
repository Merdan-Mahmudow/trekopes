import { Grid, Box } from "@chakra-ui/react";
import { Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import Header from "../Header";
import { COLOR } from "../ui/colors";
import NavBar from "../Dock/second";
import { Player } from "../Player";
import store from "../../store";
import { useStore } from "@tanstack/react-store";

export function Layout() {
    const path = useLocation()

    const [isHeaderVisible, setIsHeaderVisible] = useState<boolean>(true);
    const [isDockVisible, setIsDockVisible] = useState<boolean>(true);
    const playerState = useStore(store, (state) => state.player)

    useEffect(() => {
        const hideHeaderPaths = ["/chat", "/welcome"];
        const hideDockPaths = ['/create', '/chat', '/question', '/questionsFinish', '/welcome'];
        const updateVisible = () => {
            setIsHeaderVisible(!hideHeaderPaths.includes(path.pathname));
            setIsDockVisible(!hideDockPaths.includes(path.pathname));
        }

        updateVisible();
    }, [path.pathname]);

    const currentTrack = useMemo(() => {
        if (playerState.queue && typeof playerState.currentIndex === "number" && playerState.currentIndex >= 0) {
            return playerState.queue[playerState.currentIndex] ?? null;
        }
        if (playerState.src) {
            return {
                id: playerState.currentTrackId ?? playerState.src,
                src: playerState.src,
                title: playerState.title,
                artist: playerState.artist,
                cover: playerState.cover,
            };
        }
        return null;
    }, [playerState.queue, playerState.currentIndex, playerState.src, playerState.currentTrackId, playerState.title, playerState.artist, playerState.cover]);

    const hasPlayerRow = playerState.isVisible && !!currentTrack;
    const templateRows = `${isHeaderVisible ? "85px " : ""}${hasPlayerRow ? "auto " : ""}1fr${isDockVisible ? " auto" : ""}`;

    return (
        <>
            <Grid templateRows={templateRows} h={"100dvh"} bg={COLOR.bg.chakra.subtle} p={0} m={0} overflow="hidden">
                {isHeaderVisible && <Header />}

                {hasPlayerRow && (
                    <Box>
                        <Player />
                    </Box>
                )}

                <Box overflowY="auto" overflowX="hidden" w="100vw">
                    <Outlet />
                </Box>
                {isDockVisible && <NavBar />}
            </Grid>
        </>
    );
}