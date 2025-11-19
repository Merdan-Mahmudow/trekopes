import { IconButton } from '@chakra-ui/react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { COLOR } from './colors';
import { useEffect, useRef } from 'react';
import { TiMicrophoneOutline } from "react-icons/ti";

interface SpeechRecognitionButtonProps {
    onTranscript: (text: string) => void;
    disabled?: boolean;
}

export function SpeechRecognitionButton({
    onTranscript,
    disabled = false,
}: SpeechRecognitionButtonProps) {
    const previousListeningRef = useRef(false);

    const {
        finalTranscript,
        listening,
        browserSupportsSpeechRecognition,
        resetTranscript,
    } = useSpeechRecognition({
        language: 'ru-RU',
        continuous: true,
    });

    // Отправляем текст при остановке записи
    useEffect(() => {
        // Если запись только что остановилась и есть финальный текст
        if (previousListeningRef.current && !listening && finalTranscript) {
            const finalText = finalTranscript.trim();
            if (finalText) {
                onTranscript(finalText);
                resetTranscript();
            }
        }
        previousListeningRef.current = listening;
    }, [listening, finalTranscript, onTranscript, resetTranscript]);

    const handleToggle = async () => {
        if (listening) {
            SpeechRecognition.stopListening();
            console.log('stopListening');
        } else {
            try {
                // Запрашиваем доступ к микрофону перед началом записи
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    await navigator.mediaDevices.getUserMedia({ 
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true,
                        }
                    });
                }
                SpeechRecognition.startListening({ 
                    continuous: true, 
                    language: 'ru-RU' 
                });
                console.log('startListening');
            } catch (err: any) {
                console.error('Failed to get microphone access:', err);
            }
        }
    };

    if (!browserSupportsSpeechRecognition) {
        return null;
    }

    return (
        <IconButton
            aria-label={listening ? 'Остановить запись' : 'Начать запись'}
            onClick={handleToggle}
            disabled={disabled}
            size="sm"
            borderRadius="full"
            bg={listening ? COLOR.kit.orange : 'rgba(255, 255, 255, 0.1)'}
            color={COLOR.kit.white}
            _hover={{
                bg: listening ? COLOR.brand.orange700 : 'rgba(255, 255, 255, 0.2)',
            }}
            _active={{
                bg: listening ? COLOR.brand.orange700 : 'rgba(255, 255, 255, 0.3)',
            }}
            position="absolute"
            bottom="8px"
            right="8px"
            zIndex={10}
            minW="32px"
            h="32px"
            transition="all 0.2s"
        >
            <TiMicrophoneOutline width={20} height={20} />
        </IconButton>
    );
}

