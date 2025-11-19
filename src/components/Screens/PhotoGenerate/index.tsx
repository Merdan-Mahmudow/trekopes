import {
    Box, Button, Heading, Text, VStack, Icon, Flex, Image,
    FileUpload
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { MdCameraswitch, MdPhotoCamera } from "react-icons/md";
import { Toaster } from "../../../components/ui/toaster";
import { LuUpload } from "react-icons/lu";
import { ProPayScreen } from "../ProPay";
import { useIsPro } from "../../../store/user";
import { GenerationParamsAccordion } from "../GenerationParamsAccordion";
import {
    setGenerationScenario,
    updateGenerationScenario,
    useGenerationScenario,
} from "../../../store/generation";
import {
    createPhotoGenerationDraft,
    type GenerationDraftPhoto,
    type PhotoGenerationDraft,
} from "../../../types/generation";
import { logError } from "../../../utils/logger";

const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });

export const PhotoGenerateScreen = ({ onClose }: { onClose: () => void }) => {
    const [screen, setScreen] = useState<
        "select" | "camera" | "preview" | "params" | "pro"
    >("select");

    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user"); // ✅ новое состояние
    const isPro = useIsPro();
    const scenarioState = useGenerationScenario();

    const webcamRef = useRef<Webcam>(null);

    const videoConstraints = {
        width: 420,
        height: 420,
        facingMode,
    };

    useEffect(() => {
        if (!scenarioState || scenarioState.mode !== "photo") {
            setGenerationScenario(createPhotoGenerationDraft());
        }
    }, [scenarioState]);

    useEffect(() => {
        if (
            scenarioState &&
            scenarioState.mode === "photo" &&
            scenarioState.photo?.dataUrl &&
            !imgSrc
        ) {
            setImgSrc(scenarioState.photo.dataUrl);
            setScreen((prev) => (prev === "select" ? "preview" : prev));
        }
    }, [scenarioState, imgSrc]);

    const patchPhotoScenario = useCallback(
        (updater: (draft: PhotoGenerationDraft) => PhotoGenerationDraft) => {
            updateGenerationScenario((scenario) => {
                const base =
                    scenario && scenario.mode === "photo"
                        ? { ...scenario }
                        : createPhotoGenerationDraft();
                return updater(base);
            });
        },
        [updateGenerationScenario]
    );

    const updatePhotoDraft = useCallback(
        (photo: GenerationDraftPhoto | null) => {
            patchPhotoScenario((draft) => ({
                ...draft,
                photo,
            }));
        },
        [patchPhotoScenario]
    );

    const handleFileAccept = useCallback(
        async (event: { files: Array<File | Promise<File>> }) => {
            const first = event?.files?.[0];
            if (!first) return;
            const file = first instanceof File ? first : await first;
            if (!file) return;

            try {
                const dataUrl = await readFileAsDataUrl(file);
                setImgSrc(dataUrl);
                setScreen("preview");
                updatePhotoDraft({
                    source: "upload",
                    dataUrl,
                    mimeType: file.type,
                    fileName: file.name,
                });
            } catch (error) {
                logError("Failed to read file", error, { fileName: file.name, fileType: file.type });
            }
        },
        [updatePhotoDraft]
    );

    // ✅ Снимок
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setImgSrc(imageSrc);
            setScreen("preview");
            updatePhotoDraft({
                source: "camera",
                dataUrl: imageSrc,
                mimeType: "image/jpeg",
            });
        }
    }, [updatePhotoDraft]);

    // ✅ Переключение между камерами
    const toggleCamera = () => {
        setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    };

    // ✅ Параметры генерации
    if (screen === "params") {
        return (
            <VStack gap={4} w="full" p={4}>
                <GenerationParamsAccordion
                    onBack={() => setScreen("preview")}
                    onCancel={onClose}
                    onGenerate={() => {
                        if (!isPro) {
                            setScreen("pro");
                            return false;
                        }
                        return true;
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
                    onClick={() => setScreen("params")}
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
                        updatePhotoDraft(null);
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
        return <ProPayScreen onBack={() => setScreen("params")} onPay={onClose} />
    }

    // ✅ Главный экран
    return (
        <VStack gap={4} p={6} w="full" color="white">
            <Heading size="lg">Песня по фото</Heading>
            <Text color="#8A8A8A">Загрузите фото, чтобы создать трек</Text>
            <FileUpload.Root maxW="xl" alignItems="stretch" onFileAccept={handleFileAccept} accept={["image/*"]}>
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
