declare module '*.png' {
    const src: string;
    export default src;
}

declare module 'react-speech-recognition' {
    export interface SpeechRecognitionOptions {
        language?: string;
        continuous?: boolean;
        interimResults?: boolean;
    }

    export interface UseSpeechRecognitionReturn {
        transcript: string;
        finalTranscript: string;
        interimTranscript: string;
        listening: boolean;
        resetTranscript: () => void;
        browserSupportsSpeechRecognition: boolean;
        isMicrophoneAvailable: boolean;
    }

    export function useSpeechRecognition(
        options?: SpeechRecognitionOptions
    ): UseSpeechRecognitionReturn;

    interface SpeechRecognitionStatic {
        startListening: (options?: SpeechRecognitionOptions) => void;
        stopListening: () => void;
        abortListening: () => void;
        getRecognition: () => any;
        applyPolyfill: (SpeechRecognition: any) => void;
        browserSupportsSpeechRecognition: () => boolean;
    }

    declare const SpeechRecognition: SpeechRecognitionStatic;
    export default SpeechRecognition;
}

// Web Speech API types
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

interface Window {
    SpeechRecognition: {
        new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
        new (): SpeechRecognition;
    };
}