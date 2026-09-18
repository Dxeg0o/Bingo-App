export type BingoLetter = "B" | "I" | "N" | "G" | "O";

export type BingoNumber = {
  value: number;
  letter: BingoLetter;
  drawnAt: string;
  sequence: number;
};

export type PatternType =
  | "first-n"
  | "any-line"
  | "row"
  | "column"
  | "diagonal"
  | "x"
  | "corners"
  | "center"
  | "frame"
  | "full-card"
  | "custom";

/** cells[fila][columna] — columna 0 = B ... columna 4 = O */
export type PatternCells = boolean[][];

export type BingoPattern = {
  id: string;
  name: string;
  type: PatternType;
  /** Requerido para los patrones geométricos y personalizados. */
  cells?: PatternCells;
  /** first-n: cantidad de números; any-line: cantidad de líneas. */
  targetCount?: number;
  description?: string;
};

export type BingoRound = {
  id: string;
  name: string;
  patternId: string;
  prize: string;
  description?: string;
  resetNumbersOnStart: boolean;
};

export type RevealDuration = 3 | 5 | 8 | "manual";
export type ReviewOrder = "draw" | "numeric";

export type GameSettings = {
  revealDuration: RevealDuration;
  autoReviewEvery: number | null;
  reviewOrder: ReviewOrder;
  reviewDuration: number;
  soundsEnabled: boolean;
  volume: number;
  freeCenter: boolean;
  hostMode: boolean;
  countdownSeconds: number | null;
};

export type GameStatus = "setup" | "pregame" | "playing" | "paused";

export type RevealState = {
  value: number;
  letter: BingoLetter;
  sequence: number;
  startedAt: number;
  /** null = manual, se mantiene hasta que el operador lo cierre. */
  endsAt: number | null;
  phrase?: string;
};

export type ReviewState = {
  order: ReviewOrder;
  startedAt: number;
  /** null = repaso manual, hasta que el operador salga. */
  endsAt: number | null;
  auto: boolean;
};

export type WinnerState = {
  prize: string;
  roundName: string;
  patternName: string;
  winnerName?: string;
  startedAt: number;
};

export type CountdownState = {
  endsAt: number;
};

export type BingoGameState = {
  version: number;
  eventName: string;
  status: GameStatus;
  drawnNumbers: BingoNumber[];
  rounds: BingoRound[];
  currentRoundIndex: number;
  settings: GameSettings;
  customPatterns: BingoPattern[];
  reveal: RevealState | null;
  review: ReviewState | null;
  winner: WinnerState | null;
  countdown: CountdownState | null;
  setupCompleted: boolean;
  updatedAt: number;
};

/** Estados explícitos de la pantalla de proyección. */
export type DisplayState =
  | "PRE_GAME"
  | "PLAYING"
  | "NUMBER_REVEAL"
  | "REVIEW"
  | "PAUSED"
  | "WINNER";

export type CardGrid = (number | null)[][];

export type ValidationResult = {
  valid: boolean;
  /** Mensaje corto y legible con el resultado. */
  message: string;
  /** Casillas del patrón que aún no han salido. */
  missing: { row: number; col: number; value: number; letter: BingoLetter }[];
  /** Problemas de formato del cartón (números fuera de rango, repetidos, vacíos). */
  cardIssues: string[];
  /** Progreso 0..1 para patrones por cantidad. */
  progress?: { current: number; target: number };
};

export type AddNumberResult =
  | { ok: true; number: BingoNumber }
  | { ok: false; reason: "invalid" | "duplicate" | "paused"; message: string };
