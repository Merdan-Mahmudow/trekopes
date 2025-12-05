import { Float, Box, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { MdMic, MdStop } from 'react-icons/md';
import { motion } from 'framer-motion';
import { COLOR } from './colors';
import { logError, debugLog } from '../../utils/logger';
import { transcribeAudio } from '../../api/webapp';
import { useStore } from '@tanstack/react-store';
import store from '../../store';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const MotionBox = motion(Box);

type RecordingState = 'idle' | 'recording' | 'processing';

interface VoiceRecorderProps {
    onTranscript: (transcript: string) => void;
    maxDuration?: number;
}

/**
 * Компонент для распознавания речи в реальном времени
 * Использует react-speech-recognition (Web Speech API) где поддерживается
 * Fallback на MediaRecorder + серверное распознавание для iOS и других браузеров
 */
export const VoiceRecorder = ({ 
    onTranscript, 
    maxDuration = 60 
}: VoiceRecorderProps) => {
    const [state, setState] = useState<RecordingState>('idle');
    const [error, setError] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);
    const [useFallback, setUseFallback] = useState(false);
    
    // Refs для MediaRecorder fallback
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const onTranscriptRef = useRef(onTranscript);
    
    const token = useStore(store, (state) => state.auth.token);

    // react-speech-recognition hooks
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
        isMicrophoneAvailable,
    } = useSpeechRecognition();

    // Обновляем ref при изменении колбэка
    useEffect(() => {
        onTranscriptRef.current = onTranscript;
    }, [onTranscript]);

    // Определяем, нужен ли fallback
    useEffect(() => {
        const checkSupport = () => {
            // Проверяем поддержку Web Speech API
            if (!browserSupportsSpeechRecognition) {
                debugLog('[VoiceRecorder] Web Speech API not supported, using fallback');
                setUseFallback(true);
                return;
            }

            // Проверяем iOS - Web Speech API не работает стабильно
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            if (isIOS) {
                debugLog('[VoiceRecorder] iOS detected, using fallback');
                setUseFallback(true);
                return;
            }

            debugLog('[VoiceRecorder] Using Web Speech API');
            setUseFallback(false);
        };

        checkSupport();
    }, [browserSupportsSpeechRecognition]);

    // Синхронизируем состояние с listening
    useEffect(() => {
        if (!useFallback) {
            if (listening) {
                setState('recording');
            } else if (state === 'recording') {
                setState('idle');
            }
        }
    }, [listening, useFallback, state]);

    // Таймер для Web Speech API
    useEffect(() => {
        if (!useFallback && listening) {
            timerRef.current = setInterval(() => {
                setDuration(prev => {
                    if (prev >= maxDuration) {
                        stopRecording();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
        } else if (!useFallback && !listening) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [listening, useFallback, maxDuration]);

    // Очистка при размонтировании
    useEffect(() => {
        return () => {
            if (!useFallback) {
                SpeechRecognition.abortListening();
            }
            stopMediaRecorder();
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [useFallback]);

    const stopMediaRecorder = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    // === Web Speech API методы ===
    const startWebSpeech = useCallback(async () => {
        setError(null);
        resetTranscript();
        setDuration(0);

        try {
            await SpeechRecognition.startListening({
                continuous: true,
                language: 'ru-RU',
                interimResults: true,
            });
            debugLog('[VoiceRecorder] Web Speech started');
        } catch (err: any) {
            logError('Failed to start Web Speech', err);
            setError('Не удалось начать запись');
        }
    }, [resetTranscript]);

    const stopWebSpeech = useCallback(() => {
        SpeechRecognition.stopListening();
        setDuration(0);
        
        // Отправляем финальный транскрипт
        if (transcript.trim()) {
            debugLog('[VoiceRecorder] Sending transcript', { length: transcript.length });
            onTranscriptRef.current(transcript.trim());
            resetTranscript();
        }
    }, [transcript, resetTranscript]);

    // === MediaRecorder Fallback методы ===
    const startFallbackRecording = useCallback(async () => {
        setError(null);
        audioChunksRef.current = [];
        setDuration(0);

        try {
            debugLog('[VoiceRecorder] Requesting microphone access (fallback)');
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 16000
                }
            });
            
            streamRef.current = stream;

            // Определяем поддерживаемый MIME-тип
            let mimeType = 'audio/webm;codecs=opus';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'audio/webm';
            }
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'audio/mp4';
            }
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = '';
            }

            debugLog('[VoiceRecorder] Using MIME type', { mimeType });

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: mimeType || undefined
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                debugLog('[VoiceRecorder] Recording stopped, processing audio');
                
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }

                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }

                if (audioChunksRef.current.length > 0) {
                    setState('processing');
                    
                    const audioBlob = new Blob(audioChunksRef.current, { 
                        type: mimeType || 'audio/webm' 
                    });
                    
                    debugLog('[VoiceRecorder] Audio blob created', { 
                        size: audioBlob.size, 
                        type: audioBlob.type 
                    });

                    try {
                        if (!token) {
                            throw new Error('Нет токена авторизации');
                        }

                        const result = await transcribeAudio(token, audioBlob);
                        
                        if (result.data.text) {
                            debugLog('[VoiceRecorder] Transcription successful', { 
                                textLength: result.data.text.length 
                            });
                            onTranscriptRef.current(result.data.text);
                        } else {
                            setError('Не удалось распознать речь');
                        }
                    } catch (err: any) {
                        logError('Failed to transcribe audio', err);
                        
                        if (err?.response?.status === 404) {
                            setError('Сервис распознавания недоступен');
                        } else if (err?.response?.status === 413) {
                            setError('Аудио слишком длинное');
                        } else {
                            setError('Ошибка распознавания речи');
                        }
                    }
                }

                setState('idle');
                setDuration(0);
            };

            mediaRecorder.onerror = (event: any) => {
                logError('MediaRecorder error', event.error);
                setError('Ошибка записи');
                setState('idle');
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start(1000);
            setState('recording');

            timerRef.current = setInterval(() => {
                setDuration(prev => {
                    if (prev >= maxDuration) {
                        stopMediaRecorder();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);

            debugLog('[VoiceRecorder] Recording started (fallback)');

        } catch (err: any) {
            logError('Failed to start recording', err);
            
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('Доступ к микрофону запрещён');
            } else if (err.name === 'NotFoundError') {
                setError('Микрофон не найден');
            } else if (err.name === 'NotReadableError') {
                setError('Микрофон занят');
            } else {
                setError('Не удалось начать запись');
            }
            
            setState('idle');
        }
    }, [token, maxDuration, stopMediaRecorder]);

    // === Общие методы ===
    const startRecording = useCallback(() => {
        if (useFallback) {
            startFallbackRecording();
        } else {
            startWebSpeech();
        }
    }, [useFallback, startFallbackRecording, startWebSpeech]);

    const stopRecording = useCallback(() => {
        if (useFallback) {
            stopMediaRecorder();
        } else {
            stopWebSpeech();
        }
    }, [useFallback, stopMediaRecorder, stopWebSpeech]);

    const toggleRecording = useCallback(() => {
        if (state === 'recording' || listening) {
            stopRecording();
        } else if (state === 'idle') {
            startRecording();
        }
    }, [state, listening, startRecording, stopRecording]);

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Проверяем общую поддержку
    const isSupported = useFallback 
        ? (typeof window !== 'undefined' && 'MediaRecorder' in window && navigator.mediaDevices?.getUserMedia)
        : browserSupportsSpeechRecognition;

    if (!isSupported) {
        return null;
    }

    const isRecording = state === 'recording' || listening;
    const isProcessing = state === 'processing';

    return (
        <Float placement="bottom-end" offsetX={10} offsetY={10}>
            <Box position="relative" display="inline-block">
                {/* Ошибка */}
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

                {/* Транскрипция в реальном времени (только для Web Speech API) */}
                {!useFallback && listening && transcript && (
                    <Box
                        position="absolute"
                        bottom="100%"
                        right={0}
                        mb={2}
                        p={2}
                        bg={COLOR.kit.darkGray}
                        color="white"
                        borderRadius="md"
                        fontSize="xs"
                        zIndex={1000}
                        border={`1px solid ${COLOR.kit.orange}`}
                    >
                        <Text 
                            opacity={0.9}
                            overflowY="auto"
                            overflowX="auto"
                            whiteSpace="nowrap"
                            textOverflow="ellipsis"
                            maxW="200px"
                            maxH="100px"
                            css={{
                                '&::-webkit-scrollbar': {
                                    display: 'none',
                                },
                            }}
                        >
                            {transcript}
                        </Text>
                    </Box>
                )}

                {/* Индикатор времени при записи */}
                {isRecording && (
                    <Box
                        position="absolute"
                        bottom="100%"
                        right={!useFallback && transcript ? "auto" : 0}
                        left={!useFallback && transcript ? 0 : "auto"}
                        mb={!useFallback && transcript ? 14 : 2}
                        px={2}
                        py={1}
                        bg={COLOR.kit.orange}
                        color="white"
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="bold"
                    >
                        {formatDuration(duration)}
                    </Box>
                )}

                {/* Микрофон недоступен */}
                {!useFallback && !isMicrophoneAvailable && (
                    <Box
                        position="absolute"
                        bottom="100%"
                        right={0}
                        mb={2}
                        p={2}
                        bg="orange.700"
                        color="white"
                        borderRadius="md"
                        fontSize="xs"
                        maxW="200px"
                        zIndex={1000}
                    >
                        Разрешите доступ к микрофону
                    </Box>
                )}

                <MotionBox
                    rounded="full"
                    bg={isRecording ? 'red.500' : (isProcessing ? 'gray.600' : COLOR.kit.darkGray)}
                    w="40px"
                    h="40px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor={isProcessing ? 'wait' : 'pointer'}
                    animate={{
                        scale: isRecording ? [1, 1.15, 1] : 1
                    }}
                    transition={{
                        duration: 1,
                        repeat: isRecording ? Infinity : 0,
                        ease: "easeInOut"
                    }}
                    onClick={toggleRecording}
                >
                    {isProcessing ? (
                        <Spinner size="sm" color="white" />
                    ) : (
                        <Box as={isRecording ? MdStop : MdMic} fontSize={20} color="white" />
                    )}
                </MotionBox>
            </Box>
        </Float>
    );
};

export default VoiceRecorder;
