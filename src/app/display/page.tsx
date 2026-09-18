"use client";

import { useEffect } from "react";
import { ProjectionScreen } from "@/components/bingo/ProjectionScreen";
import { useFullscreen, useInitGame } from "@/lib/hooks";
import { useGameStore } from "@/lib/store";

export default function DisplayPage() {
  const hydrated = useInitGame();
  const game = useGameStore((s) => s.game);
  const { toggle } = useFullscreen();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        void toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  if (!hydrated) {
    return (
      <main className="textura-noche flex h-dvh items-center justify-center text-crema">
        <p className="font-display text-3xl">Preparando el bingo…</p>
      </main>
    );
  }

  return <ProjectionScreen game={game} />;
}
