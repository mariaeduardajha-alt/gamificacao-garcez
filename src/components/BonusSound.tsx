"use client";

import { useEffect } from "react";

function playVictoryFanfare() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const play = (
      freq: number,
      start: number,
      dur: number,
      type: OscillatorType = "square",
      vol = 0.13
    ) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.05);
    };

    // Arpejo ascendente estilo RPG → nota final sustentada
    play(261.63, 0.00, 0.12, "square",   0.10); // C4
    play(329.63, 0.10, 0.12, "square",   0.11); // E4
    play(392.00, 0.20, 0.12, "square",   0.12); // G4
    play(523.25, 0.30, 0.14, "square",   0.13); // C5
    play(659.25, 0.42, 0.14, "square",   0.13); // E5
    play(783.99, 0.54, 0.55, "square",   0.14); // G5  ← sustentado
    play(1046.5, 0.62, 0.70, "triangle", 0.16); // C6  ← topo brilhante
    // acorde final (harmonia)
    play(523.25, 0.62, 0.70, "triangle", 0.08); // C5 junto
    play(659.25, 0.62, 0.70, "triangle", 0.07); // E5 junto
  } catch {
    // Navegador sem Web Audio API — ignora silenciosamente
  }
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
