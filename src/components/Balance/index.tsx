import { Flex, IconButton, Image, Text } from "@chakra-ui/react";
import { useNavigate } from "@tanstack/react-router";
import { LuPlus } from "react-icons/lu";
import { BsChatDots } from "react-icons/bs";
import { COLOR } from "../ui/colors";
import { useStore } from "@tanstack/react-store";
import store from "../../store";
import { useIsPro } from "../../store/user";
import { toaster, Toaster } from "../ui/toaster";

export function Balance() {
    const navigate = useNavigate();
    const user = useStore(store, (state) => state.user);
    const isPro = useIsPro();

    const handleChatClick = () => {
        if (!isPro) {
            toaster.create({
                type: "info",
                title: "Чат недоступен",
                description: "Функция доступна только пользователям PRO",
            });
            return;
        }
        navigate({ to: "/chat" });
    };

    return <>
        <Flex
        
            justifyContent={"space-arond"}
            pt={"9px"}
            gap={3}
            alignItems={"center"}>
            <IconButton
                aria-label="Чат с Трекопсом"
                variant="ghost"
                children={<BsChatDots size={50} color={COLOR.brand.orange} />}
                _hover={{ bg: "transparent" }}
                _active={{ bg: "transparent" }}
                onClick={handleChatClick}
            />
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
            <Toaster />
        </Flex>
    </>
}