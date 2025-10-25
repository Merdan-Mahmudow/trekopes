import { Grid, Box } from "@chakra-ui/react";
import { Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Dock from "../Dock";
import Header from "../Header";
import { COLOR } from "../ui/colors";
import NavBar from "../Dock/second";

export function Layout() {
    const path = useLocation()

    const [isHeaderVisible, setIsHeaderVisible] = useState<boolean>(true);
    const [isDockVisible, setIsDockVisible] = useState<boolean>(true);

    useEffect(() => {
        const hideHeaderPaths = ["/chat"];
        const hideDockPaths = ['/create', '/chat', '/question', '/questionsFinish'];
        const updateVisible = () => {
            setIsHeaderVisible(!hideHeaderPaths.includes(path.pathname));
            setIsDockVisible(!hideDockPaths.includes(path.pathname));
        }

        // initial check
        updateVisible();

    }, [path.pathname]);

    const templateRows = `${isHeaderVisible ? "85px " : ""}1fr${isDockVisible ? " auto" : ""}`;

    return (
        <>
            <Grid templateRows={templateRows} h={"100dvh"} bg={COLOR.bg.chakra.subtle} p={0} m={0} >
                {isHeaderVisible && <Header />}
                {/* Оборачиваем Outlet, чтобы он получал ограничение 1fr (minH=0) */}
                <Box minH={0}>
                  <Outlet />
                </Box>
                {isDockVisible && <NavBar />}
            </Grid>
        </>
    );
}