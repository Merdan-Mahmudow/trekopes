import {
  CloseButton,
  Drawer,
  Portal,
} from "@chakra-ui/react";
import { type ReactNode } from "react";
import { COLOR } from "../ui/colors";

interface PopupProps {
  open: boolean;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
  onOpenChange?: () => void;
  onFocusOutside?: () => void;
}

export const Popup = ({
  open,
  title = "Заголовок",
  children,
  footer,
  onFocusOutside,
  onOpenChange
}: PopupProps) => {

  // const handleChange = (state: { open: boolean }) => {
  //   setIsOpen(state.open);
  //   onOpenChange?.(state.open);
  // };

  return (
    <Drawer.Root open={open} onFocusOutside={onFocusOutside} onOpenChange={onOpenChange} placement={"bottom"}>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content roundedTop="2xl" h={"90dvh"}>
            <Drawer.Header>
              <Drawer.Title
              color={COLOR.kit.orangeWhite}
              fontSize={"24px"}>{title}</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>{children}</Drawer.Body>
            {footer && <Drawer.Footer>{footer}</Drawer.Footer>}
            <Drawer.CloseTrigger asChild>
              <CloseButton size="md" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};
