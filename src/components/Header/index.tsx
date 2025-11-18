import { Image, Flex } from "@chakra-ui/react";
import { Balance } from "../Balance";
import { useNavigate } from "@tanstack/react-router";

export default function Header() {
    const navigate = useNavigate()
    return <>
        <Flex
            justifyContent={"space-between"}
            alignItems={"center"}
            placeSelf={"center"}
            w={"90vw"}
            pt={4}>
                <Image
                    src={"https://storage.yandexcloud.net/trekopes/logo-h.PNG"}
                    w={"140px"}
                    objectFit={"cover"}
                    onClick={() => navigate({ to: '/' })}
                />
            <Balance />
        </Flex>

    </>
}