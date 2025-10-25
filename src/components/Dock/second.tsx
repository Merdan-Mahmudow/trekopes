import { PawIcon } from "../../assets/svg/paw";
import UsersIcon from "../../assets/svg/invite";
import { Box, Flex, IconButton } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { MusicIcon } from "../../assets/svg/music";
import { COLOR } from "../ui/colors";
import { useNavigate } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import store from "../../store";

const MotionPath = motion.path;

const NavBar = () => {
  const activeDock = useStore(store, (state) => state.dock)
const [active, setActive] = useState<"left" | "center" | "right">("left");
  const [convexParams, setConvexParams] = useState({ centerX: 200, width: 95, height: 15 });
  const [svgWidth, setSvgWidth] = useState(400);
  const navigate = useNavigate()

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
  };

  const changeConvexParams = () => {
    setConvexParams({ centerX: positions[active], width: 90, height: 13 });
    setTimeout(() => {
      setConvexParams({ centerX: positions[active], width: 95, height: 15 });
    }, 400);
  };

  const createPath = (centerX: number) => {
    const waveWidth = convexParams.width;
    const waveHeight = convexParams.height;
    const topY = 29;

    const waveStart = centerX - waveWidth / 2;
    const waveEnd = centerX + waveWidth / 2;

    return `
      M 9 ${topY}
      H ${waveStart - -3.7}
      C ${waveStart + 10} ${topY + 3}, ${waveStart + 25} ${waveHeight + 3}, ${centerX - 15} ${waveHeight}
      C ${centerX - 5} ${waveHeight - 3}, ${centerX + 5} ${waveHeight - 3}, ${centerX + 15} ${waveHeight}
      C ${waveEnd - 15} ${waveHeight + 6}, ${waveEnd - 23} ${topY - 4}, ${waveEnd} ${topY}
      H ${svgWidth - 40}
      C ${svgWidth - 25} ${topY}, ${svgWidth - 20} 36, ${svgWidth - 20} 60
      V 60
      C ${svgWidth - 20} 65, ${svgWidth - 10} 85, ${svgWidth - 40} 86
      H 50
      C 15 90, 24 60, 23 50
      V 50
      C 25 40, 25 ${topY}, 42 ${topY}
      H 10
      Z
    `;
  };
  const handleClick = (position: "left" | "center" | "right", href: object) => {
    setActive(position);
    changeConvexParams();
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
      <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} 100`} preserveAspectRatio="none">
        <MotionPath
          d={createPath(positions[active])}
          fill="#282828"
          animate={{ d: createPath(positions[active]) }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
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
          onClick={() => handleClick("left", {to: '/referral'})}
        >
          <UsersIcon stroke={active === "left" ? COLOR.brand.orange : "white"}/>
        </IconButton>
        <IconButton
          aria-label="Paw"
          variant="ghost"
          _hover={{ bg: "none" }}
          color={active === "center" ? "orange.400" : "whiteAlpha.700"}
          onClick={() => handleClick("center", {to: '/generate'})}
        >
          <PawIcon size={"26px"} fill={active === "center" ? COLOR.brand.orange : "white"}/>
        </IconButton>
        <IconButton
          aria-label="Music"
          variant="ghost"
          onClick={() => handleClick("right", {to: '/profile'})}
        >
          <MusicIcon size={"24px"} fill={active === "right" ? COLOR.brand.orange : "white"}/>
        </IconButton>
      </Flex>
    </Box>
  );
};

export default NavBar;
