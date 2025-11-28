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
    left: (svgWidth || 400) * 0.23,
    center: (svgWidth || 400) * 0.5,
    right: (svgWidth || 400) * 0.77,
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

  const createPath: (centerX: number) => string = (centerX: number) => {
    // Проверяем, что все значения валидны
    const validSvgWidth = svgWidth && svgWidth > 0 && !isNaN(svgWidth) ? svgWidth : 400;
    

    const waveWidth = (convexParams.width ?? 0) || 0;
    const waveHeight = (convexParams.height ?? 0) || 0;
    const topY = 29;

    const waveStart = centerX - waveWidth / 2;
    const waveEnd = centerX + waveWidth / 2;
    const controlDistance = waveWidth * 0.3;
    const peakY = Math.max(waveHeight - 5, 2);

    // Параметры для симметричных углов
    const cornerRadius = 40;
    const cornerStartX = cornerRadius;
    const cornerEndX = validSvgWidth - cornerRadius;
    const cornerTopY = topY;
    const cornerBottomY = 60;
    const cornerControlY1 = 36;
    const cornerControlY2 = 65;
    const cornerBottomControlY = 85;
    const cornerBottomYFinal = 86;

    // Проверяем, что все вычисленные значения валидны и преобразуем их в числа
    const safeNum = (v: number): number => {
      const num = Number(v);
      return isNaN(num) || !isFinite(num) ? 0 : num;
    };

    const csX = safeNum(cornerStartX);
    const ctY = safeNum(cornerTopY);
    const wS = safeNum(waveStart);
    const wE = safeNum(waveEnd);
    const cD = safeNum(controlDistance);
    const cX = safeNum(centerX);
    const pY = safeNum(peakY);
    const ceX = safeNum(cornerEndX);
    const cbY = safeNum(cornerBottomY);
    const ccY1 = safeNum(cornerControlY1);
    const ccY2 = safeNum(cornerControlY2);
    const cbcY = safeNum(cornerBottomControlY);
    const cbfY = safeNum(cornerBottomYFinal);

    return `m ${csX} ${ctY} H ${wS} C ${wS + cD * 0.4} ${ctY}, ${cX - cD} ${pY}, ${cX} ${pY} C ${cX + cD} ${pY}, ${wE - cD * 0.4} ${ctY}, ${wE} ${ctY} H ${ceX} C ${ceX + 17} ${ctY}, ${ceX + 17} ${ccY1}, ${ceX + 17.5} ${cbY} V ${cbY} C ${ceX + 15} ${ccY2}, ${ceX + 25} ${cbcY + 2}, ${ceX} ${cbfY} H ${csX} C ${csX - 15} ${cbfY}, ${csX - 20} ${cbcY}, ${csX - 20} ${cbY} V ${cbY} C ${csX - 20} ${ccY1}, ${csX - 15} ${ctY}, ${csX} ${ctY} Z`;
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
      <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth || 400} 100`} preserveAspectRatio="none" overflow={"visible"}>
      <defs>
        <filter
          id="dock-shadow"
          x={-80}
          y={0}
          width={(svgWidth || 400) + 160}
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
          d={createPath(positions[active] ?? 0)}
          fill={"#27272a"}
          filter="url(#dock-shadow)"
          animate={{ d: createPath(positions[active] ?? 0) }}
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
