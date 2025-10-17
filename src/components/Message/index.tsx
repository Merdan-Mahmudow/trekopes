import { Text } from "@chakra-ui/react"

export interface MessageProps {
    role: "user" | "assistant"
    content: string
}
export function MessageBox({ role, content }: MessageProps) {
  return (
    <>
      {role == "assistant" ? (
        <Text
        ml={"3"}
          marginBlock={"3"}
          borderTopRadius={"2xl"}
          borderBottomEndRadius={"2xl"}
          textAlign={"left"}
          paddingLeft={"4"}
          paddingRight={"4"}
          paddingTop={"2"}
          paddingBottom={"2"}
          maxW={"400px"}
          w={"fit-content"}
          color={"gray.100"}
          bg={"#242625"}
          display={"block"}
        >
          {content}
        </Text>
      ) : (
        <Text
        mr={"3"}
          marginLeft="auto"
          p={2}
          marginBlock={"3"}
          borderTopRadius={"2xl"}
          borderBottomStartRadius={"2xl"}
          textAlign={"left"}
          paddingLeft={"4"}
          paddingRight={"4"}
          paddingTop={"2"}
          paddingBottom={"2"}
          maxW={"400px"}
          w={"fit-content"}
          bg={"#134d37"}
          color={"white"}
          display={"block"}
        >
          {content}
        </Text>
      )}
    </>
  );
}