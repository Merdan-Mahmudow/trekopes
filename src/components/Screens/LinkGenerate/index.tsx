import { Box, Heading, Text, VStack, Input, Icon, Flex, Grid } from "@chakra-ui/react";
import { useState } from "react";
import { FaLink } from 'react-icons/fa';
import { COLOR } from "../../../components/ui/colors";
import { BrandButton, GrayButton } from "../../../components/ui/button";
import { ArtistParams } from "../ArtistParams";

interface LinkGenerateProps {
    onClose?: () => void;
}

export function LinkGenerate({ onClose }: LinkGenerateProps) {
    const [link, setLink] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentScreen, setCurrentScreen] = useState<"link" | "artist" | "params">("link");
    // дальнейшие шаги выполняются в общем компоненте ArtistParams

    const validateVKLink = (url: string): boolean => {
        // Проверяем различные форматы ссылок ВКонтакте
        const vkPatterns = [
            /^https?:\/\/(www\.)?vk\.com\/[a-zA-Z0-9._-]+$/,
            /^https?:\/\/(www\.)?vkontakte\.ru\/[a-zA-Z0-9._-]+$/,
            /^https?:\/\/(www\.)?m\.vk\.com\/[a-zA-Z0-9._-]+$/,
            /^[a-zA-Z0-9._-]+$/ // Просто username без домена
        ];
        
        return vkPatterns.some(pattern => pattern.test(url.trim()));
    };

    const normalizeLink = (url: string): string => {
        const trimmed = url.trim();
        
        // Если это просто username, добавляем домен
        if (/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
            return `https://vk.com/${trimmed}`;
        }
        
        // Если ссылка без протокола, добавляем https
        if (!trimmed.startsWith('http')) {
            return `https://${trimmed}`;
        }
        
        return trimmed;
    };

    const handleLinkSubmit = async () => {
        if (!link.trim()) {
            setError("Пожалуйста, введите ссылку");
            return;
        }

        const normalizedLink = normalizeLink(link);
        
        if (!validateVKLink(normalizedLink)) {
            setError("Пожалуйста, введите корректную ссылку на профиль ВКонтакте");
            return;
        }

        setIsValidating(true);
        setError(null);

        try {
            // Имитация анализа ссылки
            await new Promise(resolve => setTimeout(resolve, 1500));
            setCurrentScreen("artist");
        } catch (err) {
            setError("Ошибка при анализе профиля. Попробуйте еще раз.");
        } finally {
            setIsValidating(false);
        }
    };

    const handleGenerate = async () => {
        setIsValidating(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            onClose && onClose();
        } catch (err) {
            setError("Ошибка при генерации трека. Попробуйте еще раз.");
        } finally {
            setIsValidating(false);
        }
    };

    const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLink(e.target.value);
        if (error) {
            setError(null);
        }
    };

    // Экран ввода ссылки
    if (currentScreen === "link") {
        return (
            <VStack gap={6} w="full" color="white">
                <VStack gap={2} textAlign="center">
                    <Heading size="lg">Песня по ссылке</Heading>
                    <Text color="#8A8A8A" fontSize="sm">
                        Вставьте ссылку на профиль ВКонтакте, и мы создадим персональный трек
                    </Text>
                </VStack>

                {error && (
                    <Box 
                        w="full" 
                        p={3} 
                        bg="red.500" 
                        borderRadius="12px" 
                        color="white"
                        fontSize="sm"
                    >
                        {error}
                    </Box>
                )}

                <VStack gap={4} w="full">
                    <Input
                        placeholder="https://vk.com/username или просто username"
                        value={link}
                        onChange={handleLinkChange}
                        p={"12px 24px"}
                        rounded={"3xl"}
                        height={"58px"}
                        fontSize={"16px"}
                        border={{ _focus: `${COLOR.kit.orange} 2px solid` }}
                        outline={"none"}
                        lineHeight={"130%"}
                    />

                    <Box 
                        w="full" 
                        p={4} 
                        bg="#1E1E20" 
                        borderRadius="16px" 
                        border="1px solid #2A2A2D"
                    >
                        <Flex gap={3} alignItems="center" mb={2}>
                            <Icon as={FaLink} color="#F59A0E" />
                            <Text fontSize="sm" fontWeight="medium" color="white">
                                Поддерживаемые форматы:
                            </Text>
                        </Flex>
                        <VStack gap={1} align="start" fontSize="xs" color="#8A8A8A">
                            <Text>• https://vk.com/username</Text>
                            <Text>• https://m.vk.com/username</Text>
                            <Text>• просто username</Text>
                        </VStack>
                    </Box>
                </VStack>

                <Grid templateColumns="1fr 1fr" gap={3} w="full">
                    <GrayButton 
                        onClick={onClose}
                        disabled={isValidating}
                        w="full"
                    >
                        Отмена
                    </GrayButton>
                    <BrandButton 
                        onClick={handleLinkSubmit}
                        disabled={!link.trim() || isValidating}
                        w="full"
                    >
                        {isValidating ? "Анализируем профиль..." : "Далее"}
                    </BrandButton>
                </Grid>

            </VStack>
        );
    }

    // Экран после ссылки: используем общий компонент ArtistParams
    return (
        <VStack gap={4} w="full" color="white">
            <Flex gap={2} alignItems="center" p={3} bg={COLOR.kit.darkGray} borderRadius="12px" w="full">
                <Icon as={FaLink} color="#4CAF50" />
                <Text fontSize="sm" color="#4CAF50">Ссылка: ⚡ загружена</Text>
            </Flex>

            <ArtistParams
                onBack={() => setCurrentScreen("link")}
                onCancel={() => onClose && onClose()}
                onGenerate={() => handleGenerate()}
            />
        </VStack>
    );
}