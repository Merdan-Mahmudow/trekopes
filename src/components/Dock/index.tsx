import { Box, HStack, Text, Image } from '@chakra-ui/react';
import { motion, type Variants } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { PawIcon } from '../../assets/svg/paw';
import MusicIcon from '../../assets/img/music.svg';
import { FaNewspaper } from 'react-icons/fa6';
import { LiaBoneSolid } from 'react-icons/lia';
import React, { useState } from 'react';

const MotionBox = motion(Box as any);

const dropVariants: Variants = {
  initial: { scale: 0.6, y: 8, opacity: 0.18 },
  animate: {
    scale: 1,
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
  hover: { scale: 1.08, y: -6, opacity: 0.9, transition: { duration: 0.18 } },
};

const btnHover = { y: -6, scale: 1.06, transition: { type: 'spring', stiffness: 350, damping: 20 } };

const bubbleVariants: Variants = {
  initial: {
    boxShadow: "none",
  },
  active: {
    boxShadow: "0 4px 10px rgba(244, 146, 49, 1) inset",
  },
  clicked: {
    boxShadow: [
      "0 4px 10px rgba(255, 243, 243, 0.48) inset",
      "0 4px 10px rgba(244, 146, 49, 1) inset",
    ],
    transition: { duration: 0.6, ease: "linear" },
  },
};

const Dock: React.FC = () => {
  const dockHidePaths = ['/chat', '/create'];
  const activePath = window.location.pathname;
  
  if (dockHidePaths.includes(window.location.pathname)) {
    console.log('Dock hidden on this route');
    return null
  }

  // храним id кнопки, на которую кликнули — анимация будет только у неё
  const [clickedId, setClickedId] = useState<string | null>(null);

  const handleClick = (id: string, duration = 600) => {
    setClickedId(id);
    // убрать флаг после окончания анимации
    window.setTimeout(() => setClickedId(prev => (prev === id ? null : prev)), duration);
  };

  return (
    <MotionBox
      w={"80%"}
      borderRadius="full"
      height="60px"
      border=".7px solid rgba(244, 146, 49, 1)"
      display="inline-block"
      role="toolbar"
      aria-label="Dock"
      position="fixed"
      bottom="30px"
      left="50%"
      transform="translateX(-50%)"
      zIndex={1000}
      backdropFilter="saturate(180%) blur(10px)"
      overflow="visible" // важно чтобы выпирающая кнопка не обрезалась
    >
      <HStack align="center" justify="space-around" h="100%" px={6}>
        {/* App 1 (news) */}
        <MotionBox
          as="button"
          aria-label="App 1"
          whileHover={btnHover}
          w="48px"
          h="48px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="full"
          bgGradient="linear(to-b, gray.100, gray.200)"
          variants={bubbleVariants}
          initial="initial"
          animate={activePath === '/news' ? 'active' : (clickedId === 'news' ? 'clicked' : 'initial')}
          onClick={() => handleClick('news')}
          onBlur={() => { if (clickedId === 'news') setClickedId(null) }}
        >
          <Text userSelect="none" fontSize="18px"><FaNewspaper /></Text>
        </MotionBox>

        {/* App 2 (chat) */}
        <MotionBox
          as="button"
          aria-label="App 2"
          whileHover={btnHover}
          w="48px"
          h="48px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="full"
          bgGradient="linear(to-b, gray.100, gray.200)"
          variants={bubbleVariants}
          initial="initial"
          animate={activePath === '/chat' ? 'active' : (clickedId === 'chat' ? 'clicked' : 'initial')}
          onClick={() => handleClick('chat')}
          onBlur={() => { if (clickedId === 'chat') setClickedId(null) }}
        >
          <Link to="/chat">
            <Text userSelect="none" fontSize="18px">B</Text>
          </Link>
        </MotionBox>

        {/* Большая круглая кнопка, выпирающая из дока */}
        <MotionBox
          position="relative"
          display="flex"
          alignItems="center"
          justifyContent="center"
          aria-label="Main App"
          sx={{ width: "72px", height: "72px" }}
          // контейнер не интерактивен, интерактивность у inner button
        >
          {/* капля под кнопкой */}
          <MotionBox
            position="absolute"
            left="50%"
            transform="translateX(-50%)"
            w="44px"
            h="28px"
            borderRadius="22px"
            bgGradient="radial(rgba(99,102,241,0.18), transparent)"
            filter="blur(8px)"
            variants={dropVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"

          />

          <Box
            as={MotionBox}
            w="60px"
            h="60px"
            borderRadius="full" // круглая кнопка
            color="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
            border={"rgba(244, 146, 49, 1) solid .5px"}
            // тень постоянна только для активной (страницы /create)
            boxShadow={activePath === '/create' ? "0 0 30px rgba(244, 146, 49, 1) inset" : "0 4px 10px rgba(0,0,0,0.12)"}
            position="relative"
            zIndex={2}
            _hover={{ cursor: 'pointer' }}
          >
            <Link to="/create" onClick={() => handleClick('create', 500)}>
              <Text userSelect="none"><PawIcon /></Text>
            </Link>
          </Box>
        </MotionBox>

        {/* App 4 (music / root) */}
        <MotionBox
          as="button"
          aria-label="App 4"
          w="48px"
          h="48px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="full"
          bgGradient="linear(to-b, gray.100, gray.200)"
          variants={bubbleVariants}
          initial="initial"
          animate={activePath === '/' ? 'active' : (clickedId === 'music' ? 'clicked' : 'initial')}
          onClick={() => handleClick('music')}
          onBlur={() => { if (clickedId === 'music') setClickedId(null) }}
        >
            <Image
             src={MusicIcon}
              objectFit={"contain"}
             w={"20px"}
             h={"20px"}/>
        </MotionBox>

        {/* App 5 (bone) */}
        <MotionBox
          as="button"
          aria-label="App 5"
          w="48px"
          h="48px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="full"
          bgGradient="linear(to-b, gray.100, gray.200)"
          variants={bubbleVariants}
          initial="initial"
          animate={activePath === '/dsfs' ? 'active' : (clickedId === 'bone' ? 'clicked' : 'initial')}
          onClick={() => handleClick('bone')}
          onBlur={() => { if (clickedId === 'bone') setClickedId(null) }}
        >
          <Text userSelect="none" fontSize="18px"><LiaBoneSolid /></Text>
        </MotionBox>
      </HStack>
    </MotionBox>
  );
};

export default Dock;