import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Flex,
  Text,
  Box,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@tanstack/react-store";
import store from "@/store";
import { StepPhotoCapture } from "./components/StepPhotoCapture";
import { StepExtras } from "./components/StepExtras";
import { StepStyle } from "./components/StepStyle";
import { ProgressOverlay } from "./components/ProgressOverlay";
import { ResultScreen } from "./components/ResultScreen";
import { ChatIcon } from "@chakra-ui/icons";
import { BadgePaws } from "./components/BadgePaws";
import { TabBar } from "./components/TabBar";

interface PhotoFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

import { useRef } from "react";

export const PhotoFlowModal = ({ isOpen, onClose }: PhotoFlowModalProps) => {
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { flowStep } = useStore(store, (state) => state.photoSong);

  const handleClose = () => {
    if (flowStep !== 'result' && flowStep !== 'error') {
      onAlertOpen();
    } else {
      onClose();
    }
  };

  const confirmClose = () => {
    onAlertClose();
    onClose();
  };


  const renderStep = () => {
    switch (flowStep) {
      case "photo":
        return <StepPhotoCapture />;
      case "extras":
        return <StepExtras />;
      case "style":
        return <StepStyle />;
      case "progress":
        return <ProgressOverlay />;
      case "result":
        return <ResultScreen />;
      default:
        return null;
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <Modal isOpen={isOpen} onClose={handleClose} size="full">
            <ModalOverlay />
            <motion.div
              style={{
                display: "flex",
                width: "100%",
                height: "100%",
              }}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
            >
              <ModalContent bg="#0F0F11">
                <ModalHeader>
                  <Flex justify="space-between" align="center">
                    <Text>ТРЕКОПЁС</Text>
                  <Flex align="center">
                    <ChatIcon mr={4} />
                    <BadgePaws />
                  </Flex>
                  </Flex>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  {renderStep()}
                </ModalBody>
                <TabBar onNavigate={handleClose} />
              </ModalContent>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Закрыть без сохранения?
            </AlertDialogHeader>

            <AlertDialogBody>
              Весь ваш прогресс будет потерян.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                Отмена
              </Button>
              <Button colorScheme="red" onClick={confirmClose} ml={3}>
                Закрыть
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
