import { PawIcon } from "../../assets/svg/paw";
import UsersIcon from "../../assets/svg/invite";
import { Box, Flex, IconButton } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { MusicIcon } from "../../assets/svg/music";
import { COLOR } from "../ui/colors";
import { useLocation, useNavigate } from "@tanstack/react-router";
import type { Telegram } from "telegram-web-app";

const MotionPath = motion.path;

const NavBar = () => {
  const path = useLocation()
  const [active, setActive] = useState<"left" | "center" | "right" | "none">("none");
  const [convexParams, setConvexParams] = useState({ centerX: 200, width: 95, height: 15 });
  const tg: Telegram | undefined = window.Telegram;
  const [svgWidth, setSvgWidth] = useState(400);
  const navigate = useNavigate()

  useEffect(() => {
    if (path.pathname === "/referral") {
      setActive("left");
    } else if (path.pathname === "/generate") {
      setActive("center");
    } else if (path.pathname === "/profile") {
      setActive("right");
    } else {
      setActive("none");
    }
  }, [path.pathname])

  useEffect(() => {
    const handleResize = () => {
      setSvgWidth(window.innerWidth * 0.85)
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const positions = {
    left: svgWidth * 0.23,
    center: svgWidth * 0.5,
    right: svgWidth * 0.77,
    none: 0,
  };

  const changeConvexParams = () => {
    if (active === "none") {
      setConvexParams({ centerX: positions[active], width: 0, height: 0 });
    } else {
      setConvexParams({ centerX: positions[active], width: 90, height: 13 });
      setTimeout(() => {
        setConvexParams({ centerX: positions[active], width: 95, height: 15 });
      }, 400);
    }
  };

  useEffect(() => {
    changeConvexParams();
  }, [active])

  const createPath = (centerX: number) => {
    const waveWidth = convexParams.width;
    const waveHeight = convexParams.height;
    const topY = 29;

    const waveStart = centerX - waveWidth / 2;
    const waveEnd = centerX + waveWidth / 2;
    const controlDistance = waveWidth * 0.3;
    const peakY = Math.max(waveHeight - 5, 2);

    // Параметры для симметричных углов
    const cornerRadius = 40;
    const cornerStartX = cornerRadius;
    const cornerEndX = svgWidth - cornerRadius;
    const cornerTopY = topY;
    const cornerBottomY = 60;
    const cornerControlY1 = 36;
    const cornerControlY2 = 65;
    const cornerBottomControlY = 85;
    const cornerBottomYFinal = 86;

    return `
      M ${cornerStartX} ${cornerTopY}
      H ${waveStart}
      C ${waveStart + controlDistance * 0.4} ${topY}, ${centerX - controlDistance} ${peakY}, ${centerX} ${peakY}
      C ${centerX + controlDistance} ${peakY}, ${waveEnd - controlDistance * 0.4} ${topY}, ${waveEnd} ${topY}
      H ${cornerEndX}
      C ${cornerEndX + 17} ${cornerTopY}, ${cornerEndX + 17} ${cornerControlY1}, ${cornerEndX + 17.5} ${cornerBottomY}
      V ${cornerBottomY}
      C ${cornerEndX + 15} ${cornerControlY2}, ${cornerEndX + 25} ${cornerBottomControlY + 2}, ${cornerEndX} ${cornerBottomYFinal}
      H ${cornerStartX}
      C ${cornerStartX - 15} ${cornerBottomYFinal}, ${cornerStartX - 20} ${cornerBottomControlY}, ${cornerStartX - 20} ${cornerBottomY}
      V ${cornerBottomY}
      C ${cornerStartX - 20} ${cornerControlY1}, ${cornerStartX - 15} ${cornerTopY}, ${cornerStartX} ${cornerTopY}
      Z
    `;
  };
  const handleClick = (position: "left" | "center" | "right", href: object) => {
    setActive(position);
    changeConvexParams();
    tg.WebApp.HapticFeedback.impactOccurred("medium");
    navigate(href)
  }
  return (
    <Box
      w="100vw"
      h="100px"
      position="fixed"
      bottom={0}
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} 100`} preserveAspectRatio="none" overflow={"visible"}>
      <defs>
        <filter
          id="dock-shadow"
          x={-80}
          y={0}
          width={svgWidth + 160}
          height={160}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feOffset in="SourceAlpha" dy="8" result="offset" />
          <feGaussianBlur in="offset" stdDeviation="12" result="blur" />
          <feFlood floodColor="#000000" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
        <MotionPath
          d={createPath(positions[active])}
          fill={"#27272a"}
          filter="url(#dock-shadow)"
          animate={{ d: createPath(positions[active]) }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
          style={{ overflow: "visible" }}
        />
      </svg>

      <Flex
        position="absolute"
        top="2"
        left="0"
        w="100%"
        h="100%"
        align="center"
        justify="space-around"
        padding={10}
      >
        <IconButton
          aria-label="Users"
          variant="ghost"
          color={active === "left" ? "orange.400" : "whiteAlpha.700"}
          onClick={() => handleClick("left", { to: '/referral' })}
        >
          <UsersIcon stroke={active === "left" ? COLOR.brand.orange : "white"} />
        </IconButton>
        <IconButton
          aria-label="Paw"
          variant="ghost"
          _hover={{ bg: "none" }}
          color={active === "center" ? "orange.400" : "whiteAlpha.700"}
          onClick={() => handleClick("center", { to: '/generate' })}
        >
          <PawIcon size={"26px"} fill={active === "center" ? COLOR.brand.orange : "white"} />
        </IconButton>
        <IconButton
          aria-label="Music"
          variant="ghost"
          onClick={() => handleClick("right", { to: '/profile' })}
        >
          <MusicIcon size={"24px"} fill={active === "right" ? COLOR.brand.orange : "white"} />
        </IconButton>
      </Flex>
    </Box>
  );
};

export default NavBar;
