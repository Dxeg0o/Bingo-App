/**
 * Sonidos generados con Web Audio: sin archivos externos ni licencias.
 */
export type SoundName = "number" | "review" | "winner" | "round" | "error";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };
  const Ctor =
    window.AudioContext ?? (window as WindowWithWebkit).webkitAudioContext ?? null;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  frequency: number,
  startOffset: number,
  duration: number,
  volume: number,
  type: OscillatorType = "sine",
) {
  const audio = getCtx();
  if (!audio) return;
  const start = audio.currentTime + startOffset;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

const PATTERNS: Record<SoundName, [number, number, number][]> = {
  // [frecuencia, retardo, duración]
  number: [
    [660, 0, 0.12],
    [880, 0.09, 0.16],
  ],
  review: [
    [520, 0, 0.1],
    [620, 0.1, 0.1],
    [720, 0.2, 0.16],
  ],
  winner: [
    [523.25, 0, 0.16],
    [659.25, 0.14, 0.16],
    [783.99, 0.28, 0.18],
    [1046.5, 0.44, 0.34],
  ],
  round: [
    [440, 0, 0.14],
    [587.33, 0.13, 0.2],
  ],
  error: [
    [220, 0, 0.18],
    [180, 0.12, 0.2],
  ],
};

export function playSound(name: SoundName, volume = 0.5): void {
  const pattern = PATTERNS[name];
  if (!pattern) return;
  for (const [freq, offset, duration] of pattern) {
    tone(freq, offset, duration, volume * 0.22, name === "error" ? "triangle" : "sine");
  }
}

/** Debe llamarse desde un gesto del usuario para desbloquear el audio. */
export function unlockAudio(): void {
  getCtx();
}
