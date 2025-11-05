import {
    Box, Button, Heading, Text, VStack, Icon, Flex, Image,
    FileUpload
} from "@chakra-ui/react";
import { useState, useCallback, useRef } from "react";
import { ArtistParams } from "../ArtistParams";
import Webcam from "react-webcam";
import { MdCameraswitch, MdPhotoCamera } from "react-icons/md";
import { Toaster } from "../../../components/ui/toaster";
import { LuUpload } from "react-icons/lu";
import { ProPayScreen } from "../ProPay";
import { useIsPro } from "../../../store/user";

export const PhotoGenerateScreen = ({ onClose }: { onClose: () => void }) => {
    const [screen, setScreen] = useState<
        "select" | "camera" | "preview" | "artistParams" | "pro"
    >("select");

    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user"); // ✅ новое состояние
    const isPro = useIsPro();

    const webcamRef = useRef<Webcam>(null);

    const videoConstraints = {
        width: 420,
        height: 420,
        facingMode,
    };


    // ✅ Снимок
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setImgSrc(imageSrc);
            setScreen("preview");
        }
    }, []);

    // ✅ Переключение между камерами
    const toggleCamera = () => {
        setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    };

    // ✅ ArtistParams
    if (screen === "artistParams") {
        return (
            <VStack gap={4} w="full" p={4}>
                <ArtistParams
                    onBack={() => setScreen("preview")}
                    onCancel={onClose}
                    onGenerate={() => {
                        if (isPro) onClose();
                        else setScreen("pro");
                    }}
                />
            </VStack>
        );
    }

    // ✅ Preview
    if (screen === "preview") {
        return (
            <VStack gap={6} p={6} w="full">
                {imgSrc && <Image src={imgSrc} borderRadius="24px" />}
                <Button
                    w="full"
                    h="60px"
                    bg="#F59A0E"
                    color="white"
                    borderRadius="16px"
                    _hover={{ bg: "#D98B0C" }}
                    onClick={() => setScreen("artistParams")}
                >
                    Использовать это фото
                </Button>
                <Button
                    w="full"
                    h="60px"
                    variant="outline"
                    borderColor="#2A2A2D"
                    borderRadius="16px"
                    _hover={{ bg: "#232325" }}
                    onClick={() => {
                        setImgSrc(null);
                        setScreen("select");
                    }}
                >
                    Выбрать другое
                </Button>
            </VStack>
        );
    }

    // ✅ Камера
    if (screen === "camera") {
        return (
            <VStack gap={4} w="full" p={4}>
                <Box
                    w="full"
                    h="400px"
                    bg="black"
                    borderRadius="24px"
                    overflow="hidden"
                    position="relative"
                >
                    <Webcam
                        audio={false}
                        mirrored={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                </Box>

                <Flex w="full" justify="space-around" alignItems="center">
                    <Button variant="ghost" onClick={() => setScreen("select")}>
                        Назад
                    </Button>
                    <Button
                        onClick={capture}
                        bg="#F59A0E"
                        color="white"
                        _hover={{ bg: "#D98B0C" }}
                    >
                        <Icon as={MdPhotoCamera} mr={2} />
                        Сделать снимок
                    </Button>
                    <Button variant="ghost" onClick={toggleCamera}>
                        <Icon as={MdCameraswitch} boxSize={8} />
                    </Button>
                </Flex>
            </VStack>
        );
    }

    if (screen === "pro" && !isPro) {
        return <ProPayScreen onBack={() => setScreen("artistParams")} onPay={onClose} />
    }

    // ✅ Главный экран
    return (
        <VStack gap={4} p={6} w="full" color="white">
            <Heading size="lg">Песня по фото</Heading>
            <Text color="#8A8A8A">Загрузите фото, чтобы создать трек</Text>
            <FileUpload.Root maxW="xl" alignItems="stretch" onFileAccept={async (e) => {setImgSrc(URL.createObjectURL(await e.files[0])); setScreen("preview")}} accept={["image/*"]}>
                <FileUpload.HiddenInput />
                <FileUpload.Dropzone>
                    <Icon size="md" color="fg.muted">
                        <LuUpload />
                    </Icon>
                    <FileUpload.DropzoneContent>
                        <Box>Выберите фото</Box>
                        <Box color="fg.muted">.png, .jpg до 5MB</Box>
                    </FileUpload.DropzoneContent>
                </FileUpload.Dropzone>
            </FileUpload.Root>
            <Button
                w="full"
                h="60px"
                variant="outline"
                borderColor="#2A2A2D"
                borderRadius="16px"
                _hover={{ bg: "#232325" }}
                onClick={() => setScreen("camera")}
            >
                Сделать снимок
            </Button>

            <Toaster />
        </VStack>
    );
};
