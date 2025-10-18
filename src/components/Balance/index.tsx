import { Flex, IconButton, Image, Text, Clipboard } from "@chakra-ui/react";
import { useState, useEffect } from "react";

export function Balance() {
    const [chatID, setChatID] = useState<string>()
    useEffect(() => {
        setChatID("735673465")
    })
    return <>
        <Flex
            flexDir={"column"}
            justifyContent={"space-arond"}
            pt={"9px"}
            alignItems={"center"}>
            <Flex
                w={"fit"}
                border={"rgb(245, 118, 7) solid 2px"}
                borderRadius={"full"}
                p={"3px 6px"}
                alignItems={"center"}
                boxShadow={"rgb(245, 118, 7) 0 0 13px"}>
                <Image
                    w={"20px"}
                    h={"20px"}
                    ml={"5px"}
                    src="https://storage.yandexcloud.net/trekopes/paw.svg" 
                />
                
                <Text px={"7px"}>18</Text>
            </Flex>
            {/* <Flex>
                <Text
                    color={"gray"}
                    fontSize={"10pt"}
                    mt={"8px"}>ID: {chatID}
                </Text>
                <Clipboard.Root value={chatID}>
                    <Clipboard.Trigger asChild>
                        <IconButton variant="ghost" color={"orange.400"} size="xs">
                            <Clipboard.Indicator />
                        </IconButton>
                    </Clipboard.Trigger>
                </Clipboard.Root>
            </Flex> */}
        </Flex>
    </>
}