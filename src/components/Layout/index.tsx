import { Grid, Box } from "@chakra-ui/react";
import { Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import Header from "../Header";
import { COLOR } from "../ui/colors";
import NavBar from "../Dock/second";
import { Player } from "../Player";
import store from "../../store";
import { useStore } from "@tanstack/react-store";
import { ReactLenis } from "lenis/react"; // или '@studio-freight/react-lenis'
import "lenis/dist/lenis.css";

export function Layout() {
  const path = useLocation();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isDockVisible, setIsDockVisible] = useState(true);
  const playerState = useStore(store, (state) => state.player);

  useEffect(() => {
    const hideHeaderPaths = ["/chat", "/welcome"];
    const hideDockPaths = ["/create", "/chat", "/question", "/questionsFinish", "/welcome"];

    setIsHeaderVisible(!hideHeaderPaths.includes(path.pathname));
    setIsDockVisible(!hideDockPaths.includes(path.pathname));
  }, [path.pathname]);

  const currentTrack = useMemo(() => {
    const { queue, currentIndex, src, currentTrackId, title, artist, cover } = playerState;

    if (queue && typeof currentIndex === "number" && currentIndex >= 0) {
      return queue[currentIndex] ?? null;
    }

    if (src) {
      return {
        id: currentTrackId ?? src,
        src,
        title,
        artist,
        cover,
      };
    }

    return null;
  }, [playerState]);

  const hasPlayerRow = playerState.isVisible && !!currentTrack;

  const templateRows = [
    isHeaderVisible ? "85px" : null,
    hasPlayerRow ? "auto" : null,
    "1fr",
    isDockVisible ? "auto" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Grid
      templateRows={templateRows}
      h="100dvh"
      bg={COLOR.bg.chakra.subtle}
      p={0}
      m={0}
      // ВАЖНО: без overflow="hidden" здесь
    >
      {isHeaderVisible && <Header />}

      {hasPlayerRow && (
        <Box>
          <Player />
        </Box>
      )}

      {/* Центральная зона со скроллом Lenis */}
      <ReactLenis
        options={{
          smoothWheel: true,
          syncTouch: true,

          lerp: 0.1,
          duration: 0.23,
          wheelMultiplier:  1,
          touchMultiplier: 0.45,
          infinite: false
        }}
        style={{
          height: "100%",
          overflow: "auto",   // именно этот контейнер скроллится
          width: "100vw",
        }}
      >
        <Box as="main" minH="100%" overflowX="hidden">
          <Outlet />
        </Box>
      </ReactLenis>

      {isDockVisible && <NavBar />}
    </Grid>
  );
}
