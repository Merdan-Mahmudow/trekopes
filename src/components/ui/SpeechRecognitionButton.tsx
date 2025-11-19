import { IconButton } from '@chakra-ui/react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import IconMicrophone from '../../assets/svg/microphone';
import { COLOR } from './colors';
import { useRef, useEffect } from 'react';

interface SpeechRecognitionButtonProps {
    onTranscript: (text: string) => void;
    disabled?: boolean;
}

export function SpeechRecognitionButton({
    onTranscript,
    disabled = false,
}: SpeechRecognitionButtonProps) {
    const transcriptRef = useRef('');

    const { isListening, isSupported, startListening, stopListening, error } =
        useSpeechRecognition({
            onResult: (text) => {
                transcriptRef.current = text;
            },
            onError: (err) => {
                console.error('Speech recognition error:', err);
            },
            language: 'ru-RU',
            continuous: true,
            interimResults: true,
        });

    // Отправляем финальный результат при остановке
    useEffect(() => {
        if (!isListening && transcriptRef.current) {
            const finalText = transcriptRef.current.trim();
            if (finalText) {
                onTranscript(finalText);
                transcriptRef.current = '';
            }
        }
    }, [isListening, onTranscript]);

    const handleToggle = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    if (!isSupported) {
        return null;
    }

    return (
        <IconButton
            aria-label={error || (isListening ? 'Остановить запись' : 'Начать запись')}
            onClick={handleToggle}
            disabled={disabled}
            size="sm"
            borderRadius="full"
            bg={isListening ? COLOR.kit.orange : 'rgba(255, 255, 255, 0.1)'}
            color={COLOR.kit.white}
            _hover={{
                bg: isListening ? COLOR.brand.orange700 : 'rgba(255, 255, 255, 0.2)',
            }}
            _active={{
                bg: isListening ? COLOR.brand.orange700 : 'rgba(255, 255, 255, 0.3)',
            }}
            position="absolute"
            bottom="8px"
            right="8px"
            zIndex={10}
            minW="32px"
            h="32px"
            transition="all 0.2s"
        >
            <IconMicrophone width={20} height={20} fillColor={COLOR.kit.white} />
        </IconButton>
    );
}

