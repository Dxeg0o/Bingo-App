/**
 * Sonidos generados con Web Audio: sin archivos externos ni licencias.
 */
export type SoundName =
  | "number"
  | "review"
  | "winner"
  | "round"
  | "error"
  | "suspense"
  | "success"
  | "fail"
  | "applause";

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

/** Golpes de madera, pandero y palmas: ruido filtrado, no melodías MIDI. */
function percussion(startOffset: number, duration: number, volume: number, brightness: number) {
  const audio = getCtx();
  if (!audio) return;
  const buffer = audio.createBuffer(1, Math.max(1, Math.ceil(audio.sampleRate * duration)), audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
  const source = audio.createBufferSource(); const filter = audio.createBiquadFilter(); const gain = audio.createGain();
  const start = audio.currentTime + startOffset;
  filter.type = "bandpass"; filter.frequency.value = brightness; filter.Q.value = 1.2;
  gain.gain.setValueAtTime(volume, start); gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.buffer = buffer; source.connect(filter).connect(gain).connect(audio.destination); source.start(start);
}

/**
 * Ovación: decenas de palmas al azar con una envolvente que sube rápido y se
 * apaga de a poco. Es ruido filtrado, no un sample: no hay archivo que cargar.
 */
function applause(volume: number, duration = 3, delay = 0) {
  for (let index = 0; index < 120; index += 1) {
    // Raíz cuadrada: se amontonan al principio, como un aplauso real.
    const at = Math.sqrt(Math.random()) * duration;
    const subida = Math.min(1, at / 0.35);
    const caida = 1 - Math.max(0, (at - duration * 0.5) / (duration * 0.5)) * 0.8;
    percussion(
      delay + at,
      0.03 + Math.random() * 0.035,
      volume * (0.03 + Math.random() * 0.045) * subida * caida,
      1300 + Math.random() * 2800,
    );
  }
}

/** Redoble que acelera: el suspenso mientras se revisa el cartón. */
function drumroll(volume: number, duration: number, delay = 0) {
  let at = 0;
  let gap = 0.085;
  while (at < duration) {
    percussion(delay + at, 0.05, volume * (0.04 + 0.05 * (at / duration)), 240 + Math.random() * 160);
    at += gap;
    gap = Math.max(0.03, gap * 0.962);
  }
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
  suspense: [],
  success: [
    [659.25, 0, 0.14],
    [880, 0.12, 0.18],
    [1174.66, 0.26, 0.3],
  ],
  fail: [
    [392, 0, 0.2],
    [311.13, 0.16, 0.24],
    [233.08, 0.34, 0.42],
  ],
  applause: [],
};

/**
 * `delay` corre el sonido entero: sirve para que el golpe caiga junto con la
 * animación del veredicto en vez de adelantarse.
 */
export function playSound(
  name: SoundName,
  volume = 0.5,
  options: { duration?: number; delay?: number } = {},
): void {
  const pattern = PATTERNS[name];
  if (!pattern) return;
  const delay = options.delay ?? 0;
  for (const [freq, offset, duration] of pattern) {
    tone(
      freq,
      delay + offset,
      duration,
      volume * 0.22,
      name === "error" ? "triangle" : "sine",
    );
  }
  if (name === "number") percussion(delay, 0.06, volume * 0.13, 520);
  if (name === "round") { percussion(delay, 0.11, volume * 0.14, 4200); percussion(delay + 0.12, 0.08, volume * 0.1, 900); }
  if (name === "review") { percussion(delay + 0.05, 0.045, volume * 0.08, 2100); percussion(delay + 0.16, 0.045, volume * 0.08, 2100); }
  if (name === "winner") {
    [0, .22, .44, .68, .92, 1.18].forEach((offset, index) =>
      percussion(delay + offset, .07, volume * .11, index % 2 ? 3900 : 1700),
    );
    applause(volume, options.duration ?? 3.4, delay);
  }
  if (name === "applause") applause(volume, options.duration ?? 3, delay);
  if (name === "suspense") drumroll(volume, options.duration ?? 3, delay);
  if (name === "success") applause(volume, options.duration ?? 2.2, delay);
  if (name === "fail") percussion(delay + 0.34, 0.5, volume * 0.06, 180);
}

/** Debe llamarse desde un gesto del usuario para desbloquear el audio. */
export function unlockAudio(): void {
  getCtx();
}
