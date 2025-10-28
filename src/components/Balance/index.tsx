import { Flex, Image, Text } from "@chakra-ui/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { BsChatDots } from "react-icons/bs";
import { COLOR } from "../ui/colors";
import { useStore } from "@tanstack/react-store";
import store from "../../store";

export function Balance() {
    const navigate = useNavigate();
    const user = useStore(store, (state) => state.user)

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
                onClick={() => navigate({ to: "/tarrifs" })}
                >
                <Image
                    w={"20px"}
                    h={"20px"}
                    src="https://storage.yandexcloud.net/trekopes/paw.svg" 
                />
                
                <Text>{user.balance}</Text>
            </Flex>
        </Flex>
    </>
}