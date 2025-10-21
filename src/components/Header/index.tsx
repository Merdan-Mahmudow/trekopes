import { Image, Grid, Box, GridItem } from "@chakra-ui/react";
import { Balance } from "../Balance";
import { useNavigate } from "@tanstack/react-router";

export default function Header() {
    const navigate = useNavigate()
    return <>
        <Grid
            templateColumns={"repeat(3, 1fr)"}
            alignItems={"center"}
            justifyItems={"center"}
            pt={4}>
            <Box>
                <Image
                    src={"https://storage.yandexcloud.net/trekopes/logo-h.PNG"}
                    w={"160px"}
                    ml={5}
                    onClick={() => navigate({ to: '/' })}
                />
            </Box>
            <GridItem
            justifyContent={"flex-end"}>
                
            </GridItem>
            <Balance />
        </Grid>

    </>
}