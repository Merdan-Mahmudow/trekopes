import { Box, Button, Heading, Text, VStack, Input, Center, Icon, Flex, Image } from "@chakra-ui/react";
import { useState, useCallback, useRef } from "react";
import { FaFileUpload } from 'react-icons/fa';
import Webcam from "react-webcam";
import { MdCameraswitch, MdPhotoCamera } from 'react-icons/md';
import { Toaster, toaster } from "../../../components/ui/toaster"

const FACING_MODE_USER = "user";
const FACING_MODE_ENVIRONMENT = "environment";

const videoConstraints = {
    facingMode: FACING_MODE_USER,
};

export const PhotoGenerateScreen = ({ onClose }: { onClose: () => void }) => {
    const [screen, setScreen] = useState<"select" | "camera" | "preview">("select");
    const [isDragging, setIsDragging] = useState(false);
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState(FACING_MODE_USER);
    const [error, setError] = useState<string | null>(null);
    const webcamRef = useRef<Webcam>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileValidation = (file: File) => {
        if (!file) return;
        setError(null);

        const allowedTypes = ["image/png", "image/jpeg"];
        if (!allowedTypes.includes(file.type)) {
            setError("Неверный тип файла. Пожалуйста, выберите .png или .jpg");
            toaster.create({
                description: error,
                type: "error"
            })
            return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setError("Файл слишком большой. Пожалуйста, выберите файл размером до 5 МБ.");
            toaster.create({
                description: error,
                type: "error"
            })
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setImgSrc(reader.result as string);
            setScreen("preview");
        };
        reader.readAsDataURL(file);
    };

    const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            handleFileValidation(event.dataTransfer.files[0]);
        }
    }, []);

    const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            handleFileValidation(event.target.files[0]);
        }
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setImgSrc(imageSrc);
            setScreen("preview");
        }
    }, [webcamRef, setImgSrc]);

    const handleSwitchCamera = useCallback(() => {
        setFacingMode(prevState =>
            prevState === FACING_MODE_USER
                ? FACING_MODE_ENVIRONMENT
                : FACING_MODE_USER
        );
    }, []);

    const handleUsePhoto = () => {
        // TODO: Send to API
        onClose();
    };

    if (screen === "preview") {
        return (
            <VStack gap={6} p={6} w="full">
                {imgSrc && <Image src={imgSrc} borderRadius="24px" />}
                <Button w="full" h="60px" bg="#F59A0E" color="white" borderRadius="16px" _hover={{ bg: "#D98B0C" }} onClick={handleUsePhoto}>
                    Использовать это фото
                </Button>
                <Button w="full" h="60px" variant="outline" borderColor="#2A2A2D" borderRadius="16px" _hover={{ bg: "#232325" }} onClick={() => { setImgSrc(null); setScreen("select"); }}>
                    Выбрать другой
                </Button>
            </VStack>
        )
    }

    if (screen === "camera") {
        return (
            <VStack gap={4} w="full" p={4}>
                 <Box w="full" h="400px" bg="black" borderRadius="24px" overflow="hidden">
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        width="100%"
                        height="100%"
                        videoConstraints={{ ...videoConstraints, facingMode }}
                        style={{ objectFit: 'cover' }}
                    />
                </Box>
                <Flex w="full" justify="space-around" alignItems="center">
                    <Button variant="ghost" onClick={() => setScreen("select")}>Назад</Button>
                    <Button onClick={capture} bg="#F59A0E" color="white" _hover={{ bg: "#D98B0C" }}>
                        <Icon as={MdPhotoCamera} mr={2} />
                        Сделать снимок
                    </Button>
                    <Button variant="ghost" onClick={handleSwitchCamera}><Icon as={MdCameraswitch} boxSize={8} /></Button>
                </Flex>
            </VStack>
        );
    }

    return (
        <VStack gap={4} p={6} w="full" color="white">
            <Heading size="lg">Песня по фото</Heading>
            <Text color="#8A8A8A">Загрузите фото, чтобы создать трек</Text>

            {error && (
                <Text color="red.500">{error}</Text>
            )}

            <Center
                w="full"
                h="200px"
                bg={isDragging ? "#2A2A2D" : "#1E1E20"}
                border="2px dashed"
                borderColor={error ? "red.500" : "#2A2A2D"}
                borderRadius="24px"
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                position="relative"
                cursor="pointer"
                onClick={() => inputRef.current?.click()}
            >
                <Input
                    ref={inputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={onFileChange}
                    position="absolute"
                    width="full"
                    height="full"
                    opacity={0}
                    cursor="pointer"
                />
                <VStack>
                    <Icon as={FaFileUpload} boxSize={8} color="#8A8A8A" />
                    <Text color="#C6C6C6">Перетащите фото сюда</Text>
                    <Text fontSize="sm" color="#8A8A8A">или выберите файл</Text>
                </VStack>
            </Center>

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
