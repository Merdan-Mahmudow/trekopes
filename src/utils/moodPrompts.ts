import type { GenerationParams } from "../types/generation";

export type MoodOption = {
  value: string;
  label: string;
  description: string;
};

export const moodOptions: MoodOption[] = [
  {
    value: "love",
    label: "❤️ Любовь",
    description:
      "MOOD: Warm romantic song with soft acoustic guitar, gentle synth pads, and light percussion creating an intimate glow. Tender, breathy vocals float with subtle harmonies, capturing the fluttery feeling of falling in love. The arrangement builds softly, like a quiet heartbeat filled with sweetness and anticipation.",
  },
  {
    value: "pain",
    label: "💔 Боль",
    description:
      "MOOD: A slow emotional ballad built on muted piano, distant atmospheric pads, and a hollow reverb that creates a sense of emptiness. Fragile vocals break slightly on high notes, carrying heartbreak and unresolved memories. The instrumentation stays minimal, letting the silence hurt as much as the melody.",
  },
  {
    value: "joy",
    label: "😄 Радость",
    description:
      "MOOD: Bright upbeat song with glittering synths, lively claps, and a bouncing bassline that radiates happiness. Energetic vocals smile through every phrase, supported by light harmonies and vibrant rhythmic accents. The whole track feels like sunshine — carefree, celebratory, and full of life.",
  },
  {
    value: "sadness",
    label: "😢 Грусть",
    description:
      "MOOD: A soft melancholic indie arrangement with lo-fi textures, gentle guitar picking, and a distant, slightly detuned piano. The vocals are quiet and introspective, as if recorded late at night, carrying a tender, calm sorrow. Subtle ambience wraps the track like a warm blanket, letting the sadness flow gently rather than dramatically.",
  },
  {
    value: "power",
    label: "🔥 Мощность",
    description:
      "MOOD: A powerful anthemic blend with driving drums, bold electric guitars, and uplifting synth layers. Confident vocals push forward with determination, supported by strong harmonies and rising transitions. The track surges with adrenaline, embodying grit, motivation, and unstoppable momentum.",
  },
  {
    value: "rebellion",
    label: "⚡️ Бунт",
    description:
      "MOOD: Distorted guitars, aggressive drums, and a gritty, rebellious edge. Vocals are sharp and confrontational, cutting through the mix with unfiltered emotion. The arrangement hits hard, full of tension and explosive breaks, capturing the urge to push back against everything.",
  },
  {
    value: "relax",
    label: "🌿 Релакс",
    description:
      "MOOD: Chill atmospheric track with warm electric piano, soft lo-fi drums, and gentle ambient pads drifting like evening air. Smooth, laid-back vocals blend into the mix, creating a cozy sense of rest and comfort. The sound flows effortlessly, perfect for unwinding, breathing out, and letting tension dissolve.",
  },
  {
    value: "soulful",
    label: "🕯 Душевность",
    description:
      "MOOD: A soft, melancholic indie-ballad with gentle piano chords, airy pads, and warm lo-fi textures. Slow buildup, intimate atmosphere, and delicate reverb create a tender, reflective sadness.",
  },
  {
    value: "dance",
    label: "💃 Танцевальное",
    description:
      "MOOD: Energetic song with punchy beats, bright synth leads, and a lively festival feel. Vocals are catchy and playful, riding on a rhythm that makes you move instantly. Sparkling effects and dynamic drops bring the vibe of friends laughing, dancing, and living in the moment.",
  },
  {
    value: "success",
    label: "💎 Успех",
    description:
      "MOOD: A sleek, confident song fusion with deep bass, glossy synths, and sharp rhythmic accents. Vocals sound charismatic and self-assured, showcasing status and ambition. The track carries a luxurious, high-end vibe — bold, stylish, and unapologetically successful.",
  },
  {
    value: "bold",
    label: "😎 Дерзость",
    description:
      "MOOD: A sleek, confident song fusion with deep bass, glossy synths, and sharp rhythmic accents. Vocals sound charismatic and self-assured, showcasing status and ambition. The track carries a luxurious, high-end vibe — bold, stylish, and unapologetically successful.",
  },
];

export const resolveMoodDescription = (value: string | null | undefined): string | null =>
  moodOptions.find((option) => option.value === value)?.description ?? null;

export const withMoodDescription = (
  params: GenerationParams | null | undefined
): GenerationParams | null => {
  if (!params) return null;

  const description = resolveMoodDescription(params.mood ?? null);

  if (!description) {
    return { ...params };
  }

  return {
    ...params,
    mood: description,
  };
};

