import { Box, Button, Heading, Text, VStack, Input, Center, Icon, Flex, Image, Spinner } from "@chakra-ui/react";
import { useState, useCallback, useRef, useEffect } from "react";
import { ArtistParams } from "../ArtistParams";
import { FaFileUpload } from 'react-icons/fa';
import Webcam from "react-webcam";
import { MdCameraswitch, MdPhotoCamera } from 'react-icons/md';
import { Toaster, toaster } from "../../../components/ui/toaster"

const FACING_MODE_USER = "user";
const FACING_MODE_ENVIRONMENT = "environment";

// Улучшенные настройки для мобильных устройств
const getVideoConstraints = (facingMode: string) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        return {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
            aspectRatio: { ideal: 16/9 }
        };
    }
    
    return {
        facingMode: facingMode,
        width: { ideal: 1920 },
        height: { ideal: 1080 }
    };
};

export const PhotoGenerateScreen = ({ onClose }: { onClose: () => void }) => {
    const [screen, setScreen] = useState<"select" | "camera" | "preview" | "permission" | "artistParams">("select");
    const [isDragging, setIsDragging] = useState(false);
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState(FACING_MODE_USER);
    const [error, setError] = useState<string | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isCameraLoading, setIsCameraLoading] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const webcamRef = useRef<Webcam>(null);
    const inputRef = useRef<HTMLInputElement>(null);


    // Запрос разрешений камеры с пользовательским интерфейсом
    const requestCameraPermission = useCallback(async () => {
        setIsCameraLoading(true);
        setCameraError(null);
        
        try {
            // Запрашиваем разрешение с базовыми настройками
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });
            setHasPermission(true);
            setIsCameraLoading(false);
            // Останавливаем тестовый поток
            stream.getTracks().forEach(track => track.stop());
            // Переходим к камере после успешного получения разрешений
            setScreen("camera");
        } catch (err) {
            console.error('Camera permission error:', err);
            setHasPermission(false);
            setIsCameraLoading(false);
            
            if (err instanceof DOMException) {
                switch (err.name) {
                    case 'NotAllowedError':
                        setCameraError("Доступ к камере запрещен. Пожалуйста, разрешите использование камеры в настройках браузера и обновите страницу.");
                        break;
                    case 'NotFoundError':
                        setCameraError("Камера не найдена. Убедитесь, что камера подключена и не используется другим приложением.");
                        break;
                    case 'NotReadableError':
                        setCameraError("Камера недоступна. Возможно, она используется другим приложением.");
                        break;
                    case 'OverconstrainedError':
                        setCameraError("Камера не поддерживает запрашиваемые настройки. Попробуйте переключить камеру.");
                        break;
                    default:
                        setCameraError("Ошибка доступа к камере. Попробуйте обновить страницу или перезапустить браузер.");
                }
            } else {
                setCameraError("Неизвестная ошибка камеры. Попробуйте обновить страницу.");
            }
        }
    }, [facingMode]);

    // Обработка ошибок камеры
    const handleCameraError = useCallback((error: string | DOMException) => {
        console.error('Camera error:', error);
        setCameraError("Ошибка камеры. Попробуйте переключить камеру или обновить страницу.");
        setIsCameraLoading(false);
    }, []);

    // Обработка успешного запуска камеры
    const handleCameraLoad = useCallback(() => {
        setIsCameraLoading(false);
        setCameraError(null);
    }, []);

    // Запрос разрешений при переходе к камере
    useEffect(() => {
        if (screen === "camera" && hasPermission === null) {
            setScreen("permission");
        }
    }, [screen, hasPermission]);

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
        setIsCameraLoading(true);
        setCameraError(null);
        setFacingMode(prevState =>
            prevState === FACING_MODE_USER
                ? FACING_MODE_ENVIRONMENT
                : FACING_MODE_USER
        );
    }, []);


    const handleUsePhoto = () => {
        setScreen("artistParams");
    };
    if (screen === "artistParams") {
        return (
            <VStack gap={4} w="full" p={4}>
                <ArtistParams
                    onBack={() => setScreen("preview")}
                    onCancel={onClose}
                    onGenerate={onClose}
                />
            </VStack>
        );
    }

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

    if (screen === "permission") {
        return (
            <VStack gap={6} p={6} w="full" color="white">
                <Heading size="lg" textAlign="center">Доступ к камере</Heading>
                <Text color="#8A8A8A" textAlign="center" px={4}>
                    Для создания фото нам нужен доступ к вашей камере. 
                    Нажмите "Разрешить" в диалоге браузера или разрешите в настройках.
                </Text>
                
                <Box w="full" h="200px" bg="#1E1E20" borderRadius="24px" display="flex" alignItems="center" justifyContent="center">
                    <VStack gap={4}>
                        <Icon as={MdPhotoCamera} boxSize={16} color="#F59A0E" />
                        <Text color="#C6C6C6" textAlign="center">
                            Камера будет использоваться только для создания снимков
                        </Text>
                    </VStack>
                </Box>

                {cameraError && (
                    <VStack gap={2}>
                        <Text color="red.500" textAlign="center" px={4}>
                            {cameraError}
                        </Text>
                        <Text color="#8A8A8A" fontSize="sm" textAlign="center" px={4}>
                            Если диалог не появился, проверьте настройки браузера:
                            <br />• Chrome: Настройки → Конфиденциальность → Настройки сайта → Камера
                            <br />• Safari: Настройки → Веб-сайты → Камера
                            <br />• Firefox: Настройки → Конфиденциальность → Разрешения → Камера
                        </Text>
                    </VStack>
                )}

                <VStack gap={3} w="full">
                    <Button
                        w="full"
                        h="60px"
                        bg="#F59A0E"
                        color="white"
                        borderRadius="16px"
                        _hover={{ bg: "#D98B0C" }}
                        onClick={requestCameraPermission}
                        loading={isCameraLoading}
                        loadingText="Запрос разрешения..."
                    >
                        Разрешить доступ к камере
                    </Button>
                    
                    {cameraError && (
                        <Button
                            w="full"
                            h="60px"
                            variant="outline"
                            borderColor="#F59A0E"
                            color="#F59A0E"
                            borderRadius="16px"
                            _hover={{ bg: "#2A2A2D" }}
                            onClick={requestCameraPermission}
                            loading={isCameraLoading}
                        >
                            Попробовать снова
                        </Button>
                    )}
                    
                    <Button
                        w="full"
                        h="60px"
                        variant="outline"
                        borderColor="#2A2A2D"
                        borderRadius="16px"
                        _hover={{ bg: "#232325" }}
                        onClick={() => setScreen("select")}
                    >
                        Назад
                    </Button>
                </VStack>
            </VStack>
        );
    }

    if (screen === "camera") {
        return (
            <VStack gap={4} w="full" p={4}>
                <Box w="full" h="400px" bg="black" borderRadius="24px" overflow="hidden" position="relative">
                    {isCameraLoading && (
                        <Center position="absolute" top={0} left={0} right={0} bottom={0} bg="black" zIndex={1}>
                            <VStack>
                                <Spinner size="lg" color="#F59A0E" />
                                <Text color="white" fontSize="sm">Загрузка камеры...</Text>
                            </VStack>
                        </Center>
                    )}
                    
                    {cameraError ? (
                        <Center h="full" bg="black">
                            <VStack gap={4}>
                                <Text color="red.500" textAlign="center" px={4}>
                                    {cameraError}
                                </Text>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    borderColor="#F59A0E" 
                                    color="#F59A0E"
                                    onClick={requestCameraPermission}
                                    loading={isCameraLoading}
                                >
                                    Попробовать снова
                                </Button>
                            </VStack>
                        </Center>
                    ) : hasPermission === false ? (
                        <Center h="full" bg="black">
                            <VStack gap={4}>
                                <Text color="red.500" textAlign="center" px={4}>
                                    Нет доступа к камере
                                </Text>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    borderColor="#F59A0E" 
                                    color="#F59A0E"
                                    onClick={requestCameraPermission}
                                    loading={isCameraLoading}
                                >
                                    Запросить разрешение
                                </Button>
                            </VStack>
                        </Center>
                    ) : (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            width="100%"
                            height="100%"
                            videoConstraints={getVideoConstraints(facingMode)}
                            style={{ objectFit: 'cover' }}
                            onUserMedia={handleCameraLoad}
                            onUserMediaError={handleCameraError}
                        />
                    )}
                </Box>
                
                <Flex w="full" justify="space-around" alignItems="center">
                    <Button variant="ghost" onClick={() => setScreen("select")}>Назад</Button>
                    <Button 
                        onClick={capture} 
                        bg="#F59A0E" 
                        color="white" 
                        _hover={{ bg: "#D98B0C" }}
                        disabled={isCameraLoading || !!cameraError || hasPermission === false}
                    >
                        <Icon as={MdPhotoCamera} mr={2} />
                        Сделать снимок
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={handleSwitchCamera}
                        disabled={isCameraLoading || !!cameraError || hasPermission === false}
                    >
                        <Icon as={MdCameraswitch} boxSize={8} />
                    </Button>
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
              onClick={() => {
                  setCameraError(null);
                  setIsCameraLoading(false);
                  setScreen("camera");
              }}
            >
                Сделать снимок
            </Button>
            <Toaster />
        </VStack>
    );
};
