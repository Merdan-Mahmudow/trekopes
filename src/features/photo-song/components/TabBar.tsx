import { Flex, IconButton } from "@chakra-ui/react";
import { StarIcon, SearchIcon, ChatIcon, BellIcon } from "@chakra-ui/icons";

interface TabBarProps {
  onNavigate: () => void;
}

export const TabBar = ({ onNavigate }: TabBarProps) => {
  return (
    <Flex
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      bg="#16171A"
      justify="space-around"
      p={4}
      borderTop="1px solid #2C2F33"
    >
      <IconButton aria-label="Home" icon={<StarIcon />} onClick={onNavigate} />
      <IconButton aria-label="Search" icon={<SearchIcon />} onClick={onNavigate} />
      <IconButton aria-label="Generate" icon={<ChatIcon />} variant="solid" colorScheme="orange" />
      <IconButton aria-label="Notifications" icon={<BellIcon />} onClick={onNavigate} />
    </Flex>
  );
};
