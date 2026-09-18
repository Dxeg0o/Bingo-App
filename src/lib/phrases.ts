/** Frases cortas y amables para el "modo animador". */
const SPECIFIC: Record<number, string> = {
  1: "¡El primero!",
  2: "¡El patito!",
  5: "¡La manito!",
  7: "¡El de la suerte!",
  8: "¡El ocho, la guatita!",
  11: "¡Las banderas!",
  13: "¡El pituto!",
  15: "¡La quinceañera!",
  18: "¡El dieciocho, po!",
  20: "¡Veinte, la veinteañera!",
  22: "¡Los patitos!",
  25: "¡Un cuarto de siglo!",
  30: "¡La treintena!",
  33: "¡Las tres marías!",
  40: "¡La cuarentena!",
  44: "¡Las cuatro ruedas!",
  45: "¡Media hora!",
  50: "¡Media centena!",
  55: "¡Las dos cincos!",
  60: "¡La hora completa!",
  66: "¡Los dos tambores!",
  69: "¡El de cabeza!",
  70: "¡El setentón!",
  75: "¡El último de todos!",
};

const GENERIC = [
  "¡Atención al cartón!",
  "¡Ahí va!",
  "¡Revise bien!",
  "¡Que suene la tómbola!",
  "¡Con calma, que viene bueno!",
  "¡A marcar se ha dicho!",
];

export function getPhrase(value: number): string {
  if (SPECIFIC[value]) return SPECIFIC[value];
  return GENERIC[value % GENERIC.length];
}
