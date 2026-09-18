import { ScanLine, XCircle } from "lucide-react";
import { REVELADO, retardo } from "@/lib/reveal";
import type { VerificationState } from "@/lib/types";

/**
 * Revisión de un cartón en el proyector: primero el suspenso, que dura lo que
 * el operador tarde, y después —si decide mostrarlo— el veredicto negativo,
 * que entra por partes en vez de aparecer de golpe.
 */
export function CardCheck({ verification }: { verification: VerificationState }) {
  if (verification.status === "checking") return <Revisando verification={verification} />;
  return <NoValido verification={verification} />;
}

function Revisando({ verification }: { verification: VerificationState }) {
  return (
    <div className="escena">
      <div className="relative flex items-center justify-center">
        <span
          aria-hidden
          className="sin-movimiento-ocultar absolute h-[14vh] w-[14vh] animate-[destello_1.8s_ease-out_infinite] rounded-full bg-dorado/20"
        />
        <ScanLine
          className="relative h-[9vh] w-[9vh] animate-[latido_1.4s_ease-in-out_infinite] text-dorado"
          aria-hidden
        />
      </div>

      <p className="escena-rotulo">Momento de tensión</p>
      <h2 className="escena-titulo text-crema">Revisando cartón</h2>

      {/* Barra indeterminada: el pulso visual mientras se comprueba. */}
      <div className="h-[1vh] w-[min(55vw,860px)] overflow-hidden rounded-full bg-white/10">
        <span
          aria-hidden
          className="sin-movimiento-ocultar block h-full w-2/5 animate-[escaner_1.5s_ease-in-out_infinite] rounded-full bg-dorado"
        />
      </div>

      <p className="escena-nota">Un momento… estamos comprobando número por número</p>

      <Contexto verification={verification} />
    </div>
  );
}

function NoValido({ verification }: { verification: VerificationState }) {
  const falta = verification.missingCount;
  return (
    <div className="escena rounded-[2rem] border-4 border-rojo/70 bg-rojo/10">
      <p className="escena-rotulo revelar" style={{ animationDelay: retardo(REVELADO.rotulo) }}>
        El veredicto es…
      </p>

      <div
        className="revelar relative flex items-center justify-center"
        style={{ animationDelay: retardo(REVELADO.adorno) }}
      >
        <span
          aria-hidden
          className="sin-movimiento-ocultar absolute h-[16vh] w-[16vh] rounded-full bg-rojo/40 animate-[halo_1.1s_ease-out_both]"
          style={{ animationDelay: retardo(REVELADO.golpe) }}
        />
        <XCircle className="relative h-[11vh] w-[11vh] text-rojo-claro" aria-hidden />
      </div>

      <h2
        className="escena-titulo animate-[veredicto-golpe_0.75s_cubic-bezier(0.2,0.9,0.3,1)_backwards] text-crema"
        style={{ animationDelay: retardo(REVELADO.golpe) }}
      >
        Cartón no válido
      </h2>

      {verification.cardLabel && (
        <p
          className="escena-dato revelar"
          style={{ animationDelay: retardo(REVELADO.detalle) }}
        >
          {verification.cardLabel}
        </p>
      )}

      <p
        className="escena-nota revelar max-w-[min(60ch,90%)]"
        style={{ animationDelay: retardo(REVELADO.detalle) }}
      >
        {falta > 0
          ? `Le ${falta === 1 ? "falta" : "faltan"} ${falta} ${
              falta === 1 ? "número" : "números"
            } para completar ${verification.patternName.toLowerCase()}.`
          : "El cartón no cumple la modalidad de esta ronda."}
      </p>

      <p
        className="escena-dato revelar text-dorado"
        style={{ animationDelay: retardo(REVELADO.cierre) }}
      >
        ¡Seguimos jugando!
      </p>

      <Contexto verification={verification} delay={REVELADO.cierre} />
    </div>
  );
}

/** Pie común: qué se está jugando y por qué premio. */
function Contexto({
  verification,
  delay = 0,
}: {
  verification: VerificationState;
  delay?: number;
}) {
  return (
    <dl
      className={`flex flex-wrap items-end justify-center gap-x-[4vw] gap-y-[1.5vh] ${
        delay ? "revelar" : ""
      }`}
      style={delay ? { animationDelay: retardo(delay) } : undefined}
    >
      <div className="shrink-0">
        <dt className="escena-rotulo">Modalidad</dt>
        <dd className="escena-dato text-[clamp(1rem,3vh,2.1rem)] uppercase">
          {verification.patternName}
        </dd>
      </div>
      <div className="h-[4.5vh] w-px shrink-0 bg-crema/20" aria-hidden />
      <div className="shrink-0">
        <dt className="escena-rotulo">Premio en juego</dt>
        <dd className="escena-dato text-[clamp(1rem,3vh,2.1rem)]">{verification.prize}</dd>
      </div>
    </dl>
  );
}
