import { HStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import '../../style/fonts.css'
import { COLOR } from "../ui/colors";

const MotionSpan = motion.span;

export const PreLoader = () => {
  const text = "ТРЕКОIIЁС";

  return (
    <HStack h={"100dvh"} w={"100vw"} justifyContent={"center"}>
      {text.split("").map((char, index) => (
        <MotionSpan
          key={index}
          className="font-bicubic"
          style={{ color: "white", fontSize: "24pt", fontWeight: "bold"}}
          animate={{
            textShadow: [
              `0px 0px 0px ${COLOR.kit.orange}` ,
              `0px 0px 20px ${COLOR.kit.orange}`,
              `0px 0px 0px ${COLOR.kit.orange}`,
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
            delay: index * 0.1, // задержка для каждой буквы
          }}
        >
          {char}
        </MotionSpan>
      ))}
    </HStack>
  );
};
