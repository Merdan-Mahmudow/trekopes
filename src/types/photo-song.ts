export type PhotoData = { dataUrl: string; w: number; h: number } | null;
export type Extras = { text: string };

export type StyleMode = 'artist' | 'params';
export type Artist = { id: string; name: string; avatarUrl: string };
export type ParamStyle = { genre?: string; mood?: string; bpm?: number; voice?: 'male'|'female'|'neutral' };

export type FlowStep = 'photo' | 'extras' | 'style' | 'progress' | 'result' | 'error';

export type GenerateState =
  | { status: 'idle' }
  | { status: 'progress'; stepIndex: number; pct: number }
  | { status: 'done'; track: MockTrack }
  | { status: 'error'; message: string };

export type MockTrack = { id: string; url: string; durationSec: number; coverDataUrl: string };

export type PawsBalance = number;
