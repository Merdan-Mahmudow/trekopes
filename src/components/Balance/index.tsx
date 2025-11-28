import { Flex, Image, Text } from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { BsChatDots } from "react-icons/bs";
import { COLOR } from "../ui/colors";

export function Balance() {
    return <>
        <Flex
        
            justifyContent={"space-arond"}
            pt={"9px"}
            gap={3}
            alignItems={"center"}>
                <Link to="/chat"><BsChatDots size={"22px"} color={COLOR.brand.orange}/></Link>
            <Flex
                w={"fit"}
                borderRadius={"full"}
                p={"4px 12px"}
                alignItems={"center"}
                bg={COLOR.kit.darkGray}
                gap={"4px"}
                >
                <Image
                    w={"20px"}
                    h={"20px"}
                    src="https://storage.yandexcloud.net/trekopes/paw.svg" 
                />
                
                <Text>18</Text>
            </Flex>
        </Flex>
    </>
}