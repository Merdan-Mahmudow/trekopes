import React from 'react';
import { Box, HStack, Text, Image } from '@chakra-ui/react';
import { motion, type Variants } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { PawIcon } from '../../assets/svg/paw';
import MusicIcon from '../../assets/img/music.svg';

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

const Dock: React.FC = () => {
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
          boxShadow="0 4px 10px rgba(0,0,0,0.12)"
        >
          <Text userSelect="none" fontSize="18px">A</Text>
        </MotionBox>

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
          boxShadow="0 4px 10px rgba(0,0,0,0.12)"
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
            w="60px"
            h="60px"
            borderRadius="full" // круглая кнопка
            color="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
            border={"rgba(244, 146, 49, 1) solid .5px"}
            boxShadow="0 0 30px rgba(244, 146, 49, 1) inset"
            position="relative"
            zIndex={2}
            _hover={{ cursor: 'pointer' }}
            
          >
            <Link to="/create">
              <Text userSelect="none" fontSize="22pt"><PawIcon /></Text>
            </Link>
          </Box>
        </MotionBox>

        <MotionBox
          as="button"
          aria-label="App 4"
          whileHover={btnHover}
          w="48px"
          h="48px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="full"
          bgGradient="linear(to-b, gray.100, gray.200)"
          boxShadow="0 4px 10px rgba(255, 243, 243, 0.48) inset"
          _focus={{ boxShadow: "0 4px 10px rgba(244, 146, 49, 1) inset" }}
        >
            <Image
             src={MusicIcon}
              objectFit={"contain"}
             w={"20px"}
             h={"20px"}/>
        </MotionBox>

        <MotionBox
          as="button"
          aria-label="App 5"
          whileHover={btnHover}
          w="48px"
          h="48px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="full"
          bgGradient="linear(to-b, gray.100, gray.200)"
          boxShadow="0 4px 10px rgba(0,0,0,0.12)"
        >
          <Text userSelect="none" fontSize="18px">D</Text>
        </MotionBox>
      </HStack>
    </MotionBox>
  );
};

export default Dock;