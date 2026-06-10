"use client";

import { useEffect } from "react";
import { playTones } from "@/lib/audio";

function playVictoryFanfare() {
  // Arpejo ascendente estilo RPG → nota final sustentada + acorde
  // (usa o contexto de áudio compartilhado para funcionar no mobile)
  playTones([
    [261.63, 0.00, 0.12, "square",   0.10], // C4
    [329.63, 0.10, 0.12, "square",   0.11], // E4
    [392.00, 0.20, 0.12, "square",   0.12], // G4
    [523.25, 0.30, 0.14, "square",   0.13], // C5
    [659.25, 0.42, 0.14, "square",   0.13], // E5
    [783.99, 0.54, 0.55, "square",   0.14], // G5 sustentado
    [1046.5, 0.62, 0.70, "triangle", 0.16], // C6 topo brilhante
    [523.25, 0.62, 0.70, "triangle", 0.08], // C5 acorde
    [659.25, 0.62, 0.70, "triangle", 0.07], // E5 acorde
  ]);
}

/**
 * Toca o som de vitória uma vez por novo bônus conquistado.
 * Usa localStorage para não repetir em recargas.
 */
export function BonusSound({
  weeksHitGoal,
  userId,
}: {
  weeksHitGoal: number;
  userId: string;
}) {
  useEffect(() => {
    if (weeksHitGoal <= 0) return;

    const key          = `bonus-announced-${userId}`;
    const lastAnnounced = parseInt(localStorage.getItem(key) || "0", 10);

    if (weeksHitGoal > lastAnnounced) {
      // Pequeno delay para a página carregar primeiro
      const t = setTimeout(() => {
        playVictoryFanfare();
        localStorage.setItem(key, String(weeksHitGoal));
      }, 600);
      return () => clearTimeout(t);
    }
  }, [weeksHitGoal, userId]);

  return null;
}
