"use client";

import { useEffect, useRef, useState } from "react";
import type { MedalTier } from "@/lib/scoring";
import { playTones } from "@/lib/audio";

const TIER_RANK: Record<MedalTier, number> = {
  NONE: 0, BRONZE: 1, SILVER: 2, GOLD: 3,
};

const TIER_LABEL: Record<MedalTier, string> = {
  NONE: "", BRONZE: "Escudo Bronze", SILVER: "Escudo Prata", GOLD: "Escudo Ouro",
};

const TIER_COLOR: Record<MedalTier, string> = {
  NONE:   "#A78BFA",
  BRONZE: "#C07030",
  SILVER: "#8FA8C8",
  GOLD:   "#F0C040",
};

/* ── Som de conquista de escudo (contexto compartilhado p/ mobile) ── */
function playConquestSound(tier: MedalTier) {
  if (tier === "BRONZE") {
    // Conquista Bronze — fanfarra simples
    playTones([
      [392.00, 0.00, 0.12, "square",   0.13],
      [523.25, 0.12, 0.12, "square",   0.13],
      [659.25, 0.24, 0.12, "square",   0.13],
      [783.99, 0.36, 0.50, "square",   0.15],
      [659.25, 0.44, 0.42, "triangle", 0.10],
    ]);
  } else if (tier === "SILVER") {
    // Conquista Prata — mais elaborada
    playTones([
      [392.00, 0.00, 0.10, "square",   0.13],
      [523.25, 0.10, 0.10, "square",   0.13],
      [659.25, 0.20, 0.10, "square",   0.13],
      [783.99, 0.30, 0.10, "square",   0.13],
      [1046.5, 0.40, 0.60, "square",   0.15],
      [783.99, 0.46, 0.54, "triangle", 0.10],
      [659.25, 0.52, 0.48, "triangle", 0.07],
    ]);
  } else if (tier === "GOLD") {
    // Conquista Ouro — épica máxima
    playTones([
      [261.63, 0.00, 0.10, "square",   0.13],
      [392.00, 0.10, 0.10, "square",   0.13],
      [523.25, 0.20, 0.10, "square",   0.13],
      [659.25, 0.30, 0.10, "square",   0.13],
      [783.99, 0.40, 0.10, "square",   0.13],
      [1046.5, 0.50, 0.12, "square",   0.13],
      [1318.5, 0.60, 0.80, "square",   0.16],
      [1046.5, 0.65, 0.75, "triangle", 0.12],
      [783.99, 0.70, 0.70, "triangle", 0.08],
      [523.25, 0.75, 0.65, "triangle", 0.06],
    ]);
  }
}

/* ── Componente ───────────────────────────────────────────────── */
export function MedalAchievement({
  tier,
  userId,
}: {
  tier: MedalTier;
  userId: string;
}) {
  const [show,     setShow]     = useState(false);
  const [achieved, setAchieved] = useState<MedalTier>("NONE");
  const done = useRef(false);

  useEffect(() => {
    if (done.current || tier === "NONE") return;

    const key      = `medal-tier-${userId}`;
    const lastRank = parseInt(localStorage.getItem(key) || "0", 10);
    const currRank = TIER_RANK[tier];

    if (currRank > lastRank) {
      done.current = true;
      localStorage.setItem(key, String(currRank));
      setAchieved(tier);
      setShow(true);
      playConquestSound(tier);
    }
  }, [tier, userId]);

  if (!show) return null;

  const color = TIER_COLOR[achieved];

  return (
    <div
      onAnimationEnd={() => setShow(false)}
      style={{
        position: "fixed",
        bottom: 110,
        right: 40,
        zIndex: 9999,
        pointerEvents: "none",
        animation: "score-popup 2.8s ease-out forwards",
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, rgba(8,6,20,.98), rgba(20,14,40,.98))`,
          border: `1px solid ${color}80`,
          boxShadow: `0 0 40px ${color}30, 0 0 12px ${color}18`,
          padding: "1.2rem 1.8rem",
          minWidth: 220,
          clipPath: "polygon(0 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%)",
          position: "relative",
        }}
      >
        {/* Linha topo */}
        <div style={{ position:"absolute",top:0,left:0,right:0,height:2,
          background:`linear-gradient(90deg,transparent,${color},transparent)` }} />

        {/* Label */}
        <div style={{ fontFamily:"var(--font-mono),monospace", fontSize:9,
          letterSpacing:"0.22em", textTransform:"uppercase",
          color: `${color}99`, marginBottom:6 }}>
          🏆 Conquista desbloqueada
        </div>

        {/* Nome do escudo */}
        <div style={{
          fontFamily:"var(--font-display),Impact,sans-serif",
          fontSize: 28, fontWeight:900, lineHeight:1,
          color,
          textShadow:`0 0 20px ${color}CC`,
        }}>
          {TIER_LABEL[achieved]}
        </div>

        {/* Sub */}
        <div style={{ fontFamily:"var(--font-mono),monospace", fontSize:9,
          color:"rgba(212,220,240,0.5)", textTransform:"uppercase",
          letterSpacing:"0.12em", marginTop:6 }}>
          Classificação Completa · Movimento em Jogo
        </div>
      </div>
    </div>
  );
}
