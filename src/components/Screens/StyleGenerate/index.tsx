import { Box, Text, VStack, Grid, Textarea } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { COLOR } from "../../ui/colors";
import { BrandButton, GrayButton } from "../../ui/button";
import { ProPayScreen } from "../ProPay";
import { useIsPro } from "../../../store/user";
import { ArtistParams } from "../ArtistParams";
import type { GenerationParams, Artist } from "../ArtistParams";
type StyleGenerateScreenProps = {
    onClose: () => void;
};

// delete button "Отмена"

export function StyleGenerateScreen({ onClose }: StyleGenerateScreenProps) {
    const [currentStep, setCurrentStep] = useState<"select" | "prompt">("select");
    const [proStep, setProStep] = useState(false);
    const isPro = useIsPro();
    const [prompt, setPrompt] = useState("");
    const [, setSelectedArtist] = useState<Artist | null>(null);
    const promptRef = useRef<HTMLTextAreaElement>(null);
    const [, setGenerationParams] = useState<GenerationParams | null>(null);

    const handleGenerate = async () => {
        if (isPro) onClose();
        else setProStep(true);
    };
    // focus if current step is "prompt" is active and not focused
    useEffect(() => {
        if (
            currentStep === "prompt" &&
            !promptRef.current?.contains(document.activeElement)
        ) {
            promptRef.current?.focus();
        }
    }, [currentStep]);

    if (proStep && !isPro) {
        return <ProPayScreen onBack={() => setProStep(false)} onPay={onClose} />
    }

    return (
        <VStack gap={4} w="full" color="white">
            {currentStep === "select" ? (
                <ArtistParams
                    onBack={onClose}
                    onCancel={onClose}
                    onGenerate={({ artist, params }) => {
                        setSelectedArtist(artist);
                        setGenerationParams(params);
                        setCurrentStep("prompt");
                    }}
                />
            ) : (
                <>
                    <Box w="full" bg={COLOR.kit.darkGray} borderRadius="24px" p={6}>
                        <VStack gap={4} w="full" alignItems="stretch" textAlign="center">
                            <Text
                                color={COLOR.kit.orangeWhite}
                                fontSize="24px"
                                lineHeight="130%"
                            >
                                Что должно быть в песне?
                            </Text>
                            <Textarea
                                value={prompt}
                                ref={promptRef}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Например: лирический трек о ночном городе и надежде"
                                fontSize="16px"
                                lineHeight="130%"
                                minH="160px"
                                bg="#1E1E20"
                                color={COLOR.kit.white}
                                borderRadius="3xl"
                                border="1px solid transparent"
                                resize="vertical"
                                _focus={{ borderColor: COLOR.kit.orange, boxShadow: "none" }}
                                _placeholder={{ color: COLOR.kit.smoke }}
                            />
                        </VStack>
                    </Box>
                    <Grid templateColumns="1fr 1fr" gap={3} w="full">
                        <GrayButton
                            color={COLOR.kit.white}
                            onClick={() => setCurrentStep("select")}
                            w="full"
                        >
                            Назад
                        </GrayButton>
                        <BrandButton
                            onClick={handleGenerate}
                            w="full"
                            disabled={!prompt.trim()}
                        >
                            Сгенерировать
                        </BrandButton>
                    </Grid>
                </>
            )}
        </VStack>
    );
}
