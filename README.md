# Bingo Dieciochero 🇨🇱

Aplicación web para **administrar y proyectar un bingo presencial de 75 números**, con
estética inspirada en las Fiestas Patrias chilenas.

Pensada para usarse en vivo: una persona ingresa por teclado los números que salen de la
tómbola y el público ve una pantalla grande (proyector o televisor) siempre sincronizada.

## Cómo se usa

| Ruta       | Para qué sirve                                                |
| ---------- | ------------------------------------------------------------- |
| `/`        | Portada: continuar partida, nueva partida, demo, proyector     |
| `/setup`   | Asistente de configuración (nombre, rondas, ajustes)           |
| `/control` | Panel del operador (privado)                                   |
| `/display` | Pantalla de proyección (pública, sin controles)                |

Flujo recomendado para un bingo real:

1. Abre `/` en el notebook y elige **Nueva partida** (o **Usar demo** para probar).
2. Configura rondas, premios y modalidades.
3. Pulsa **Abrir proyector**: se abre `/display` en otra ventana, que arrastras al
   televisor/proyector conectado por HDMI y pones en **pantalla completa** (tecla `F`).
4. Trabaja desde `/control`: escribe el número y presiona `Enter`. Nada más.

Ambas pantallas se sincronizan por `BroadcastChannel` (con `localStorage` + evento
`storage` como respaldo) dentro del mismo navegador. Todo se guarda automáticamente: si
el navegador se refresca, la partida no se pierde.

## Atajos de teclado

| Tecla            | Acción                          |
| ---------------- | ------------------------------- |
| `Enter`          | Registrar el número escrito     |
| `Ctrl` / `Cmd` + `Z` | Deshacer el último número    |
| `C`              | Corregir el último número       |
| `R`              | Iniciar / salir del repaso      |
| `P`              | Pausar / reanudar               |
| `F`              | Pantalla completa (en `/display`) |
| `Escape`         | Limpiar el input o cerrar una ventana |

## Funcionalidades

- Tablero BINGO completo (B 1–15, I 16–30, N 31–45, G 46–60, O 61–75) con letra
  automática, último número destacado y marca ✓ (no depende solo del color).
- Ingreso rápido por teclado + teclado numérico en pantalla para uso táctil.
- Bloqueo de números repetidos e inválidos, deshacer y corregir manteniendo el orden
  cronológico.
- Historial completo con hora, buscador «¿salió este número?» y contador de progreso.
- Rondas con nombre, modalidad, premio, descripción y opción de **reiniciar o continuar**
  los números al comenzar cada ronda.
- 18 modalidades predefinidas (líneas, filas, columnas, diagonales, X, esquinas, centro,
  marco, cartón lleno, primeros N) + **constructor de patrones personalizados**.
- Repasos manuales y automáticos (cada 5/10/15 números), en orden de sorteo o numérico.
- Pausa, pantalla previa con cuenta regresiva, verificación manual de cartones 5x5 con
  centro libre configurable y celebración de ganador con confeti.
- Sonidos opcionales generados con Web Audio (sin archivos con copyright) y «modo
  animador» con frases cortas.
- Accesible: contraste alto, foco visible, aria-labels y `prefers-reduced-motion`.

## Desarrollo

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build de producción
npm run lint
```

Stack: Next.js 15 (App Router), React 19, TypeScript estricto, Tailwind CSS 4, Zustand,
Lucide Icons y Sonner. Sin backend ni base de datos: todo vive en `localStorage`.

Desplegable en Vercel sin configuración adicional.
