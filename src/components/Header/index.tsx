import { Image, Grid, Box } from "@chakra-ui/react";
import { Balance } from "../Balance";

export default function Header() {
    return <>
        <Grid
            templateColumns={"repeat(3, 1fr)"}
            alignItems={"center"}
            justifyItems={"center"}
            pt={10}>
            <Box>
                <Image
                    src={"https://storage.yandexcloud.net/trekopes/logo-h.PNG"}
                    w={"160px"}
                    ml={5}
                />
            </Box>
            <Box></Box>
            <Balance />
        </Grid>

    </>
}