import { IconButton, Float, Box } from '@chakra-ui/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { MdMic } from 'react-icons/md';
import { motion } from 'framer-motion';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { COLOR } from './colors';
import { logError } from '../../utils/logger';

const MotionIconButton = motion(IconButton);
const MotionBox = motion(Box);

type VoiceInputStatus = 'available' | 'telegram-blocked' | 'no-https' | 'unsupported';

const Dictaphone = ({ onTranscript }: { onTranscript: (transcript: string) => void }) => {
    const [error, setError] = useState<string | null>(null);
    const [voiceStatus, setVoiceStatus] = useState<VoiceInputStatus>('available');
    
    // useSpeechRecognition НЕ принимает language/continuous/interimResults
    // Эти параметры передаются в startListening()
    const {
        transcript,
        listening,
        browserSupportsSpeechRecognition,
        resetTranscript
    } = useSpeechRecognition();

    // Определяем статус голосового ввода при монтировании
    useEffect(() => {
        if (typeof window === 'undefined') {
            setVoiceStatus('unsupported');
            return;
        }

        const isTgWebApp = !!(window as any).Telegram?.WebApp;
        const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
        
        // В Telegram WebApp микрофон заблокирован на обеих платформах (iOS и Android)
        if (isTgWebApp) {
            setVoiceStatus('telegram-blocked');
            return;
        }

        // Web Speech API требует HTTPS (кроме localhost)
        if (!isSecure) {
            setVoiceStatus('no-https');
            return;
        }

        if (!browserSupportsSpeechRecognition) {
            setVoiceStatus('unsupported');
            return;
        }

        setVoiceStatus('available');
    }, [browserSupportsSpeechRecognition]);

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

    const toggleListening = useCallback(async () => {
        // Показываем информативное сообщение для заблокированных режимов
        if (voiceStatus === 'telegram-blocked') {
            setError('Голосовой ввод недоступен в Telegram. Откройте приложение в браузере.');
            return;
        }
        
        if (voiceStatus === 'no-https') {
            setError('Голосовой ввод требует HTTPS соединения.');
            return;
        }
        
        if (voiceStatus === 'unsupported') {
            setError('Ваш браузер не поддерживает голосовой ввод.');
            return;
        }

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
                    await navigator.mediaDevices.getUserMedia({ audio: true });
                }
            } catch (err: any) {
                logError('Failed to get microphone access', err);
                
                // Более детальная диагностика ошибки
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setError('Доступ к микрофону запрещён. Разрешите в настройках браузера.');
                } else if (err.name === 'NotFoundError') {
                    setError('Микрофон не найден. Проверьте подключение устройства.');
                } else if (err.name === 'NotReadableError') {
                    setError('Микрофон занят другим приложением.');
                } else {
                    setError('Не удалось получить доступ к микрофону.');
                }
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
    }, [listening, resetTranscript, voiceStatus]);

    // Скрываем кнопку только если браузер совсем не поддерживает
    // В остальных случаях показываем кнопку, но с сообщением при клике
    if (voiceStatus === 'unsupported' && !browserSupportsSpeechRecognition) {
        return null;
    }

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
                    bg={listening ? COLOR.kit.orange : (voiceStatus !== 'available' ? 'gray.600' : COLOR.kit.darkGray)}
                    w={"40px"}
                    h={"40px"}
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"center"}
                    opacity={voiceStatus !== 'available' ? 0.6 : 1}
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