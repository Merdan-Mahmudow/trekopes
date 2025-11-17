import { Flex, Image, Text } from "@chakra-ui/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LuPlus } from "react-icons/lu";
import { BsChatDots } from "react-icons/bs";
import { COLOR } from "../ui/colors";
import { useStore } from "@tanstack/react-store";
import store from "../../store";

export function Balance() {
    const navigate = useNavigate();
    const user = useStore(store, (state) => state.user);

    return <>
        <Flex
        
            justifyContent={"space-arond"}
            pt={"9px"}
            px={"16px"}
            gap={3}
            alignItems={"center"}>
            <Link to="/chat">
                <BsChatDots size={"22px"} color={COLOR.brand.orange} />
            </Link>
            <Flex
                w={"fit"}
                borderRadius={"full"}
                p={"4px 12px"}
                alignItems={"center"}
                bg={'rgb(228, 37, 72)'}
                gap={"3"}
                onClick={() => navigate({ to: "/tarrifs" })}
            >
                {user.limit > 0 ? (
                    <>
                       <Image
                    w={"20px"}
                    h={"20px"}
                    src="https://storage.yandexcloud.net/trekopes/paw.svg"
                />
                
                <Text>{user.limit}</Text>
                <LuPlus size={13} color={COLOR.kit.orange} />
                    </>
                ) : (
                    <Text color={"white.400"} fontSize={"14px"} fontWeight={600}>Пополнить</Text>
                )}
            </Flex>
        </Flex>
    </>
}