import {
  Button,
  CloseButton,
  Drawer,
  Portal,
} from "@chakra-ui/react";
import { type ReactNode, useState } from "react";

interface PopupProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
}

export const Popup = ({
  open,
  onOpenChange,
  title = "Заголовок",
  children,
  footer,
}: PopupProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(open);

  const handleChange = (state: { open: boolean }) => {
    setIsOpen(state.open);
    onOpenChange?.(state.open);
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={handleChange} placement="bottom">
      <Drawer.Trigger asChild>
        <Button variant="outline" size="sm">
          Open
        </Button>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content roundedTop="2xl">
            <Drawer.Header>
              <Drawer.Title>{title}</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>{children}</Drawer.Body>
            {footer && <Drawer.Footer>{footer}</Drawer.Footer>}
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};
