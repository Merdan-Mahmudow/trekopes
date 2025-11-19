import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpeechRecognitionOptions {
    onResult?: (text: string) => void;
    onError?: (error: string) => void;
    language?: string;
    continuous?: boolean;
    interimResults?: boolean;
}

interface UseSpeechRecognitionReturn {
    isListening: boolean;
    isSupported: boolean;
    startListening: () => void;
    stopListening: () => void;
    error: string | null;
}

// Проверка поддержки Web Speech API
function checkSpeechRecognitionSupport(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Проверяем наличие SpeechRecognition API
    const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    return !!SpeechRecognition;
}

// Проверка поддержки getUserMedia для доступа к микрофону
async function checkMicrophoneAccess(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
        return false;
    }

    try {
        // Проверяем доступность микрофона
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Немедленно останавливаем поток, так как мы только проверяем доступность
        stream.getTracks().forEach(track => track.stop());
        return true;
    } catch (err) {
        console.warn('Microphone access check failed:', err);
        return false;
    }
}

export function useSpeechRecognition({
    onResult,
    onError,
    language = 'ru-RU',
    continuous = false,
    interimResults = true,
}: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const onResultRef = useRef<UseSpeechRecognitionOptions['onResult']>(null);
    const onErrorRef = useRef<UseSpeechRecognitionOptions['onError']>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // всегда держим актуальные коллбэки
    useEffect(() => {
        onResultRef.current = onResult;
    }, [onResult]);

    useEffect(() => {
        onErrorRef.current = onError;
    }, [onError]);

    // Проверка поддержки при монтировании
    useEffect(() => {
        const hasSupport = checkSpeechRecognitionSupport();
        setIsSupported(hasSupport);

        if (!hasSupport) {
            setError('Распознавание речи не поддерживается в вашем браузере');
            return;
        }

        // Проверяем доступ к микрофону (не блокируем, просто проверяем)
        checkMicrophoneAccess().catch(() => {
            // Игнорируем ошибки при проверке, разрешение запросим при старте
        });
    }, []);

    // Инициализация SpeechRecognition
    useEffect(() => {
        if (!isSupported) {
            return;
        }

        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            return;
        }

        const recognition: SpeechRecognition = new SpeechRecognition();
        recognition.lang = language;
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            const text = (finalTranscript || interimTranscript).trim();
            if (text && onResultRef.current) {
                onResultRef.current(text);
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            setIsListening(false);
            let errorMessage = 'Ошибка распознавания речи';

            switch (event.error) {
                case 'no-speech':
                    // Не считаем это критической ошибкой, просто нет речи
                    errorMessage = 'Речь не обнаружена';
                    break;
                case 'audio-capture':
                    errorMessage = 'Микрофон недоступен. Проверьте разрешения в настройках.';
                    break;
                case 'not-allowed':
                    errorMessage = 'Доступ к микрофону запрещен. Разрешите доступ в настройках браузера.';
                    break;
                case 'network':
                    errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
                    break;
                case 'aborted':
                    // Пользователь остановил запись - не ошибка
                    return;
                case 'service-not-allowed':
                    errorMessage = 'Сервис распознавания недоступен';
                    break;
                default:
                    errorMessage = `Ошибка: ${event.error}`;
            }

            setError(errorMessage);
            if (onErrorRef.current && event.error !== 'aborted') {
                onErrorRef.current(errorMessage);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognition) {
                try {
                    recognition.onresult = null!;
                    recognition.onerror = null!;
                    recognition.onstart = null!;
                    recognition.onend = null!;
                    recognition.abort();
                } catch (e) {
                    // Игнорируем ошибки при очистке
                }
            }
            recognitionRef.current = null;
            
            // Останавливаем поток микрофона, если он был создан
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, [language, continuous, interimResults, isSupported]);

    const startListening = useCallback(async () => {
        if (!isSupported || !recognitionRef.current) {
            const msg = 'Распознавание речи не поддерживается';
            setError(msg);
            onErrorRef.current?.(msg);
            return;
        }

        // Запрашиваем доступ к микрофону перед началом записи
        // Это важно для Telegram Mini App на iOS и Android
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    }
                });
                streamRef.current = stream;
            }
        } catch (err: any) {
            const errorName = err?.name || '';
            let errorMsg = 'Не удалось получить доступ к микрофону';
            
            if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
                errorMsg = 'Доступ к микрофону запрещен. Разрешите доступ в настройках браузера или приложения Telegram.';
            } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
                errorMsg = 'Микрофон не найден';
            } else if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
                errorMsg = 'Микрофон используется другим приложением';
            }
            
            setError(errorMsg);
            onErrorRef.current?.(errorMsg);
            return;
        }

        // Запускаем распознавание
        try {
            recognitionRef.current.start();
        } catch (err: any) {
            const message = err?.message || '';
            // если уже запущено — молча игнорируем
            if (message.toLowerCase().includes('already started') || 
                message.toLowerCase().includes('recognitionstart')) {
                return;
            }
            const msg = 'Не удалось начать распознавание';
            setError(msg);
            onErrorRef.current?.(msg);
        }
    }, [isSupported]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            try {
                recognitionRef.current.stop();
            } catch (err) {
                // Игнорируем ошибки при остановке
            }
        }
        
        // Останавливаем поток микрофона
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, [isListening]);

    return {
        isListening,
        isSupported,
        startListening,
        stopListening,
        error,
    };
}
