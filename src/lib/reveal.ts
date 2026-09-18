/**
 * Ritmo del revelado en el proyector. Las mismas cifras las usan la animación
 * (retardos en CSS) y el sonido, así el golpe se ve y se escucha a la vez.
 * Todo en segundos.
 */
export const REVELADO = {
  /** Rótulo «el veredicto es…». */
  rotulo: 0.1,
  /** Ícono o adorno previo al golpe. */
  adorno: 0.7,
  /** El golpe: la palabra grande (¡BINGO! / CARTÓN NO VÁLIDO). */
  golpe: 1.5,
  /** Explicación y datos de contexto. */
  detalle: 2.2,
  /** Cierre: premio, próxima ronda. */
  cierre: 2.8,
} as const;

/** Retardo listo para `style={{ animationDelay: ... }}`. */
export function retardo(segundos: number): string {
  return `${segundos}s`;
}
