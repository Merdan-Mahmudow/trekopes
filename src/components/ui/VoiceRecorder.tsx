import { Float, Box, Spinner } from '@chakra-ui/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { MdMic, MdStop } from 'react-icons/md';
import { motion } from 'framer-motion';
import { COLOR } from './colors';
import { logError, debugLog } from '../../utils/logger';
import { transcribeAudio } from '../../api/webapp';
import { useStore } from '@tanstack/react-store';
import store from '../../store';

const MotionBox = motion(Box);

type RecordingState = 'idle' | 'recording' | 'processing';

interface VoiceRecorderProps {
    onTranscript: (transcript: string) => void;
    maxDuration?: number; // Максимальная длительность записи в секундах
}

/**
 * Компонент для записи голоса через MediaRecorder API
 * Работает в Telegram WebApp (в отличие от Web Speech API)
 */
export const VoiceRecorder = ({ 
    onTranscript, 
    maxDuration = 60 
}: VoiceRecorderProps) => {
    const [state, setState] = useState<RecordingState>('idle');
    const [error, setError] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);
    const [isSupported, setIsSupported] = useState(true);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const onTranscriptRef = useRef(onTranscript);
    
    const token = useStore(store, (state) => state.auth.token);

    // Обновляем ref при изменении колбэка
    useEffect(() => {
        onTranscriptRef.current = onTranscript;
    }, [onTranscript]);

    // Проверяем поддержку MediaRecorder при монтировании
    useEffect(() => {
        const checkSupport = () => {
            if (typeof window === 'undefined') {
                setIsSupported(false);
                return;
            }
            
            const hasMediaRecorder = 'MediaRecorder' in window;
            const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
            
            debugLog('[VoiceRecorder] Support check', { hasMediaRecorder, hasGetUserMedia });
            
            setIsSupported(hasMediaRecorder && hasGetUserMedia);
        };
        
        checkSupport();
    }, []);

    // Очистка при размонтировании
    useEffect(() => {
        return () => {
            stopRecording();
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    // Автоматическая остановка при достижении maxDuration
    useEffect(() => {
        if (state === 'recording' && duration >= maxDuration) {
            stopRecording();
        }
    }, [duration, maxDuration, state]);

    const startRecording = useCallback(async () => {
        setError(null);
        audioChunksRef.current = [];
        setDuration(0);

        try {
            debugLog('[VoiceRecorder] Requesting microphone access');
            
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
                mimeType = ''; // Использовать дефолтный
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
                
                // Останавливаем таймер
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }

                // Останавливаем стрим
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }

                // Если есть данные, отправляем на распознавание
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
            mediaRecorder.start(1000); // Собираем данные каждую секунду
            setState('recording');

            // Запускаем таймер
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);

            debugLog('[VoiceRecorder] Recording started');

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
    }, [token, maxDuration]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
    }, []);

    const toggleRecording = useCallback(() => {
        if (state === 'recording') {
            stopRecording();
        } else if (state === 'idle') {
            startRecording();
        }
        // Если processing — игнорируем клик
    }, [state, startRecording, stopRecording]);

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Скрываем если MediaRecorder не поддерживается
    if (!isSupported) {
        return null;
    }

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

                {/* Индикатор времени при записи */}
                {state === 'recording' && (
                    <Box
                        position="absolute"
                        bottom="100%"
                        right={0}
                        mb={2}
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

                <MotionBox
                    rounded="full"
                    bg={state === 'recording' ? 'red.500' : (state === 'processing' ? 'gray.600' : COLOR.kit.darkGray)}
                    w="40px"
                    h="40px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor={state === 'processing' ? 'wait' : 'pointer'}
                    animate={{
                        scale: state === 'recording' ? [1, 1.15, 1] : 1
                    }}
                    transition={{
                        duration: 1,
                        repeat: state === 'recording' ? Infinity : 0,
                        ease: "easeInOut"
                    }}
                    onClick={toggleRecording}
                >
                    {state === 'processing' ? (
                        <Spinner size="sm" color="white" />
                    ) : (
                        <Box as={state === 'recording' ? MdStop : MdMic} fontSize={20} color="white" />
                    )}
                </MotionBox>
            </Box>
        </Float>
    );
};

export default VoiceRecorder;



