import { Grid } from "@chakra-ui/react";
import { Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Dock from "../Dock";
import Header from "../Header";

export function Layout() {
    const path = useLocation()

    const [isHeaderVisible, setIsHeaderVisible] = useState<boolean>(true);
    const [isDockVisible, setIsDockVisible] = useState<boolean>(true);

    useEffect(() => {
        const hideHeaderPaths = ["/chat"];
        const hideDockPaths = ['/create', '/chat'];
        const updateVisible = () => {
            setIsHeaderVisible(!hideHeaderPaths.includes(path.pathname));
            setIsDockVisible(!hideDockPaths.includes(path.pathname));
        }

        // initial check
        updateVisible();

    }, [path.pathname]);

    return (
        <>
            <Grid templateRows={isHeaderVisible ? "85px calc(100vh - 120px)" : "calc(100vh - 14px)"} >
                {isHeaderVisible && <Header />}
                <Outlet />
                {isDockVisible && <Dock />}
            </Grid>
        </>
    );
}