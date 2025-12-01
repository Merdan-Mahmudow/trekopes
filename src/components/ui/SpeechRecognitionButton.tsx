import { IconButton, Float, Box } from '@chakra-ui/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { MdMic } from 'react-icons/md';
import { motion } from 'framer-motion';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { COLOR } from './colors';
import { logError } from '../../utils/logger';

const MotionIconButton = motion(IconButton);
const MotionBox = motion(Box);

const Dictaphone = ({ onTranscript }: { onTranscript: (transcript: string) => void }) => {
    const [error, setError] = useState<string | null>(null);
    
    const {
        transcript,
        listening,
        browserSupportsSpeechRecognition,
        resetTranscript
    } = useSpeechRecognition({ 
        language: 'ru-RU',
        continuous: true,
        interimResults: true
    });

    const previousTranscriptRef = useRef('');
    const isInitialMountRef = useRef(true);
    const onTranscriptRef = useRef(onTranscript);

    // Обновляем ref при изменении колбэка
    useEffect(() => {
        onTranscriptRef.current = onTranscript;
    }, [onTranscript]);

    // Обработка ошибок распознавания речи
    useEffect(() => {
        if (!browserSupportsSpeechRecognition) return;

        const recognition = SpeechRecognition.getRecognition();
        if (!recognition) return;

        const handleError = (event: any) => {
            logError('Speech recognition error', event.error, { 
                error: event.error,
                message: event.message 
            });
            
            let errorMessage = 'Ошибка распознавания речи';
            if (event.error === 'not-allowed') {
                errorMessage = 'Доступ к микрофону запрещён. Разрешите доступ в настройках браузера.';
            } else if (event.error === 'no-speech') {
                errorMessage = 'Речь не обнаружена. Проверьте микрофон.';
            } else if (event.error === 'network') {
                errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
            }
            
            setError(errorMessage);
        };

        recognition.addEventListener('error', handleError);
        
        return () => {
            recognition.removeEventListener('error', handleError);
        };
    }, [browserSupportsSpeechRecognition]);

    // Передаём текст в реальном времени при изменении transcript
    useEffect(() => {
        if (listening && transcript !== previousTranscriptRef.current) {
            previousTranscriptRef.current = transcript;
            onTranscriptRef.current(transcript);
        }
    }, [transcript, listening]);

    // Сбрасываем предыдущий текст при остановке записи
    useEffect(() => {
        if (!listening && !isInitialMountRef.current) {
            previousTranscriptRef.current = '';
            resetTranscript();
        }
        if (isInitialMountRef.current) {
            isInitialMountRef.current = false;
        }
    }, [listening, resetTranscript]);

    if (!browserSupportsSpeechRecognition) {
        return null; // Скрываем кнопку, если браузер не поддерживает распознавание
    }

    const toggleListening = useCallback(async () => {
        if (listening) {
            try {
                SpeechRecognition.stopListening();
                setError(null);
            } catch (err) {
                logError('Failed to stop speech recognition', err);
                setError('Не удалось остановить распознавание');
            }
        } else {
            setError(null);
            
            // Запрашиваем разрешение на микрофон перед началом распознавания
            try {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    const ua = navigator.userAgent.toLowerCase();
                    const isIOS = /iphone|ipad|ipod/.test(ua);
                    
                    // На iOS в WebView getUserMedia может не работать, но пробуем
                    if (!isIOS) {
                        await navigator.mediaDevices.getUserMedia({ audio: true });
                    }
                }
            } catch (err: any) {
                logError('Failed to get microphone access', err);
                setError('Нет доступа к микрофону. Разрешите доступ в настройках браузера.');
                return;
            }
            
            try {
                resetTranscript();
                previousTranscriptRef.current = '';
                SpeechRecognition.startListening({ 
                    continuous: true, 
                    language: 'ru-RU',
                    interimResults: true
                });
            } catch (err) {
                logError('Failed to start speech recognition', err);
                setError('Не удалось запустить распознавание речи');
            }
        }
    }, [listening, resetTranscript]);

    return (
        <Float placement={"bottom-end"} offsetX={10} offsetY={10}>
            <Box position="relative" display="inline-block">
                {error && (
                    <Box
                        position="absolute"
                        bottom="100%"
                        right={0}
                        mb={2}
                        p={2}
                        bg="red.900"
                        color="white"
                        borderRadius="md"
                        fontSize="xs"
                        maxW="200px"
                        zIndex={1000}
                    >
                        {error}
                    </Box>
                )}
                <MotionBox
                    rounded={"full"}
                    bg={listening ? COLOR.kit.orange : COLOR.kit.darkGray}
                    w={"40px"}
                    h={"40px"}
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"center"}
                    animate={{
                        scale: listening ? [1, 1.15, 1] : 1
                    }}
                    transition={{
                        duration: 1,
                        repeat: listening ? Infinity : 0,
                        ease: "easeInOut"
                    }}
                >
                    <MotionIconButton
                        onClick={toggleListening}
                        aria-label={listening ? "Остановить распознавание" : "Начать распознавание"}
                        variant="ghost"
                        size="sm"
                        rounded={"full"}
                        w={"40px"}
                        h={"40px"}
                    >
                        <MdMic size={20} />
                    </MotionIconButton>
                </MotionBox>
            </Box>
        </Float>
    );
};
export { Dictaphone };