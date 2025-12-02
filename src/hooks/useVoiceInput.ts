// useVoiceInput.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { logError } from '../utils/logger';

type VoiceInputMode = 'web-speech' | 'telegram-voice-only' | 'unsupported';

interface UseVoiceInputOptions {
  onText?: (text: string) => void;
  language?: string;
  continuous?: boolean;
}

interface UseVoiceInputResult {
  mode: VoiceInputMode;
  listening: boolean;
  error: string | null;
  start: () => void;
  stop: () => void;
  supportsWebSpeech: boolean;
}

export function useVoiceInput({
  onText,
}: UseVoiceInputOptions = {}): UseVoiceInputResult {
  const [error, setError] = useState<string | null>(null);
  const previousListeningRef = useRef(false);

  // базовый хук из react-speech-recognition
  // Примечание: useSpeechRecognition() НЕ принимает language/continuous
  // Эти параметры передаются в startListening()
  const {
    transcript,
    listening,
    browserSupportsSpeechRecognition,
    resetTranscript
  } = useSpeechRecognition();

  // детект платформы
  const [mode, setMode] = useState<VoiceInputMode>('unsupported');

  useEffect(() => {
    if (typeof window === 'undefined') {
      setMode('unsupported');
      return;
    }

    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isTgWebApp = !!(window as any).Telegram?.WebApp;

    if (!browserSupportsSpeechRecognition) {
      if (isTgWebApp) {
        setMode('telegram-voice-only');
      } else {
        setMode('unsupported');
      }
      return;
    }

    // Web Speech есть, но в Telegram на iOS мы ему не верим
    if (isIOS && isTgWebApp) {
      setMode('telegram-voice-only');
      return;
    }

    setMode('web-speech');
  }, [browserSupportsSpeechRecognition]);

  // когда запись останавливается — отдаём текст наверх
  useEffect(() => {
    if (
      mode === 'web-speech' &&
      previousListeningRef.current &&
      !listening &&
      transcript
    ) {
      const finalText = transcript.trim();
      if (finalText && onText) {
        onText(finalText);
      }
      resetTranscript();
    }

    previousListeningRef.current = listening;
  }, [mode, listening, transcript, onText, resetTranscript]);

  const start = useCallback(async () => {
    setError(null);

    if (mode === 'web-speech') {
      let isIOS = false;
      try {
        // чуть аккуратнее, чем жёстко везде дёргать getUserMedia
        if (
          typeof navigator !== 'undefined' &&
          navigator.mediaDevices?.getUserMedia
        ) {
          const ua = navigator.userAgent.toLowerCase();
          isIOS = /iphone|ipad|ipod/.test(ua);

          // на iOS/WebView всё равно бесполезно, лишний раз не дёргаем
          if (!isIOS) {
            await navigator.mediaDevices.getUserMedia({ audio: true });
          }
        }
      } catch (err) {
        logError('Failed to get microphone access', err, { isIOS });
        setError('Нет доступа к микрофону');
        return;
      }

      SpeechRecognition.startListening({ continuous: true, language: 'ru-RU' });
      return;
    }

    if (mode === 'telegram-voice-only') {
      // тут микрофона в WebApp мы не трогаем,
      // ты в UI показываешь подсказку «запиши голосовое сообщением»
      setError(
        'В Telegram Mini App на iOS голосовой ввод через микрофон недоступен. Используй голосовые сообщения.'
      );
      return;
    }

    setError('Голосовой ввод не поддерживается в этом окружении');
  }, [mode]);

  const stop = useCallback(() => {
    if (mode === 'web-speech') {
        SpeechRecognition.stopListening();
    }
    // в telegram-voice-only и unsupported нечего останавливать
    return;
  }, [mode]);

  return {
    mode,
    listening,
    error,
    start,
    stop,
    supportsWebSpeech: browserSupportsSpeechRecognition,
  };
}
