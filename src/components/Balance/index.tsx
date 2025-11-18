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
            gap={3}
            alignItems={"center"}>
            <Link to="/chat">
                <BsChatDots size={"18px"} color={COLOR.brand.orange} />
            </Link>
            <Flex
                borderRadius={"full"}
                p={"2px 8px"}
                alignItems={"center"}
                bg={user.limit > 0 ? COLOR.kit.darkGray : 'rgb(228, 37, 72)'}
                gap={"3"}
                onClick={() => navigate({ to: "/tarrifs" })}
            >
                {user.limit > 0 ? (
                    <>
                       <Image
                    w={"16px"}
                    h={"16px"}
                    src="https://storage.yandexcloud.net/trekopes/paw.svg"
                />
                
                <Text>{user.limit}</Text>
                <LuPlus size={"20px"} color={COLOR.kit.orange} />
                    </>
                ) : (
                    <Text color={"white.400"} fontSize={"14px"}  p={"2px 8px"} fontWeight={600}>Пополнить</Text>
                )}
            </Flex>
        </Flex>
    </>
}