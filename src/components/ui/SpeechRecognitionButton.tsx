import { IconButton, Float, Box } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import { MdMic } from 'react-icons/md';
import { motion } from 'framer-motion';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { COLOR } from './colors';

const MotionIconButton = motion(IconButton);
const MotionBox = motion(Box);

const Dictaphone = ({ onTranscript }: { onTranscript: (transcript: string) => void }) => {
    const {
        transcript,
        listening,
        browserSupportsSpeechRecognition,
        resetTranscript
    } = useSpeechRecognition();

    const previousTranscriptRef = useRef('');
    const isInitialMountRef = useRef(true);
    const onTranscriptRef = useRef(onTranscript);

    // Обновляем ref при изменении колбэка
    useEffect(() => {
        onTranscriptRef.current = onTranscript;
    }, [onTranscript]);

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
        return <span>Browser doesn't support speech recognition.</span>;
    }

    const toggleListening = () => {
        if (listening) {
            SpeechRecognition.stopListening();
        } else {
            resetTranscript();
            previousTranscriptRef.current = '';
            SpeechRecognition.startListening({ continuous: true, language: 'ru-RU' });
        }
    }

    return (
        <Float placement={"bottom-end"} offsetX={10} offsetY={10}>
            <Box position="relative" display="inline-block">

                    <>
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
                                aria-label="Toggle listening"
                                variant="ghost"
                                size="sm"
                                rounded={"full"}
                                w={"40px"}
                                h={"40px"}
                            >
                                {<MdMic size={20} />}
                            </MotionIconButton>
                        </MotionBox>
                    </>



            </Box>
        </Float>
    );
};
export { Dictaphone };