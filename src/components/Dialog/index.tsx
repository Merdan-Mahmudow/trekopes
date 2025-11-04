import { CloseButton, Dialog, Portal, Text } from "@chakra-ui/react";
import { type ReactNode } from "react";
import { COLOR } from "../ui/colors";

interface DialogWindowProps {
    open: boolean;
    title?: string;
    children?: ReactNode;
    footer?: ReactNode;
    onOpenChange?: () => void;
    onFocusOutside?: () => void;
}

export function DiaologWindow({
    open,
    title,
    children,
    footer,
    onFocusOutside,
    onOpenChange
}: DialogWindowProps) {
    return (
        <Dialog.Root open={open} onFocusOutside={onFocusOutside} onOpenChange={onOpenChange} motionPreset={"slide-in-bottom"} placement={"top"}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content w={"90vw"} bg={COLOR.kit.darkGray} rounded={"2xl"}>
                        <Dialog.Header py={4}>
                            <Text fontSize={"20px"} color={COLOR.kit.orangeWhite}>{ title }</Text>
                        </Dialog.Header>
                        <Dialog.Body>
                            { children }
                        </Dialog.Body>
                        <Dialog.Footer>
                            {footer}
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}