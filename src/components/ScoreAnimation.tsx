"use client";

import { useEffect, useState, useRef } from "react";
import { playTones } from "@/lib/audio";

/* ── Sons (contexto de áudio compartilhado p/ funcionar no mobile) ── */
function playDaySound() {
  playTones([
    [783.99, 0.00, 0.10, "square", 0.12],
    [987.77, 0.10, 0.10, "square", 0.12],
    [1318.5, 0.20, 0.10, "square", 0.12],
    [1567.9, 0.30, 0.45, "square", 0.12],
  ]);
}

function playBonusSound() {
  // Fanfarra mais épica para o bônus
  playTones([
    [523.25, 0.00, 0.10, "square",   0.11],
    [659.25, 0.10, 0.10, "square",   0.11],
    [783.99, 0.20, 0.10, "square",   0.11],
    [1046.5, 0.30, 0.12, "square",   0.11],
    [1318.5, 0.40, 0.65, "square",   0.11],
    [1046.5, 0.42, 0.63, "triangle", 0.11],
    [783.99, 0.44, 0.61, "triangle", 0.11],
  ]);
}

/* ── Contador ─────────────────────────────────────────────────── */
function useCountUp(from: number, to: number, active: boolean) {
  const [val, setVal] = useState(from);
  useEffect(() => {
    if (!active || from === to) { setVal(to); return; }
    let cur = from;
    const t = setInterval(() => {
      cur = Math.min(cur + 1, to);
      setVal(cur);
      if (cur >= to) clearInterval(t);
    }, 55);
    return () => clearInterval(t);
  }, [active, from, to]);
  return val;
}

/* ── Card de pontuação do dia ─────────────────────────────────── */
function DayCard({
  points, totalPoints, prevTotal, onEnd,
}: { points: number; totalPoints: number; prevTotal: number; onEnd: () => void }) {
  const total = useCountUp(prevTotal, totalPoints, true);
  return (
    <div
      onAnimationEnd={onEnd}
      style={{
        background: "linear-gradient(135deg,rgba(8,12,28,.98),rgba(16,24,52,.98))",
        border: "1px solid rgba(240,192,48,0.50)",
        boxShadow: "0 0 24px rgba(240,192,48,0.20)",
        padding: "1rem 1.5rem",
        minWidth: 190,
        clipPath: "polygon(0 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%)",
        animation: "score-popup 1.2s ease-out forwards",
        position: "relative",
      }}
    >
      <div style={{ position:"absolute",top:0,left:0,right:0,height:2,
        background:"linear-gradient(90deg,transparent,#F0C040,transparent)" }} />
      <div style={{ fontFamily:"var(--font-mono),monospace", fontSize:9,
        letterSpacing:"0.2em", textTransform:"uppercase", color:"#2DD4BF", marginBottom:5 }}>
        ✦ Dia ativo
      </div>
      <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
        <span style={{ fontFamily:"var(--font-display),Impact,sans-serif",
          fontSize:38, fontWeight:900, lineHeight:1, color:"#F0C040",
          textShadow:"0 0 16px rgba(240,192,48,0.9)" }}>
          +{points}
        </span>
        <span style={{ fontFamily:"var(--font-mono),monospace", fontSize:11,
          color:"rgba(240,192,48,0.7)", textTransform:"uppercase", letterSpacing:"0.15em" }}>
          pts
        </span>
      </div>
      <div style={{ height:1, margin:"6px 0", background:"rgba(61,127,255,0.2)" }} />
      <div style={{ fontFamily:"var(--font-mono),monospace", fontSize:9,
        color:"rgba(212,220,240,0.5)", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:2 }}>
        Total
      </div>
      <div style={{ display:"flex", alignItems:"baseline", gap:3 }}>
        <span style={{ fontFamily:"var(--font-display),Impact,sans-serif",
          fontSize:22, fontWeight:700, color:"#A78BFA",
          textShadow:"0 0 10px rgba(167,139,250,0.5)" }}>
          {total}
        </span>
        <span style={{ fontFamily:"var(--font-mono),monospace", fontSize:9,
          color:"rgba(167,139,250,0.6)", textTransform:"uppercase", letterSpacing:"0.1em" }}>
          pts
        </span>
      </div>
    </div>
  );
}

/* ── Card de bônus semanal (maior / mais épico) ───────────────── */
function BonusCard({ points, onEnd }: { points: number; onEnd: () => void }) {
  return (
    <div
      onAnimationEnd={onEnd}
      style={{
        background: "linear-gradient(135deg,rgba(10,6,28,.99),rgba(24,10,52,.99))",
        border: "1px solid rgba(167,139,250,0.65)",
        boxShadow: "0 0 36px rgba(167,139,250,0.30), 0 0 12px rgba(240,192,48,0.15)",
        padding: "1.2rem 1.8rem",
        minWidth: 210,
        clipPath: "polygon(0 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%)",
        animation: "score-popup 1.6s ease-out forwards",
        animationDelay: "0.25s",
        opacity: 0,
        position: "relative",
      }}
    >
      <div style={{ position:"absolute",top:0,left:0,right:0,height:2,
        background:"linear-gradient(90deg,transparent,#A78BFA,#F0C040,transparent)" }} />
      <div style={{ fontFamily:"var(--font-mono),monospace", fontSize:9,
        letterSpacing:"0.22em", textTransform:"uppercase",
        color:"#A78BFA", marginBottom:6 }}>
        ⚡ Bônus semanal
      </div>
      <div style={{ display:"flex", alignItems:"baseline", gap:5 }}>
        <span style={{ fontFamily:"var(--font-display),Impact,sans-serif",
          fontSize:58, fontWeight:900, lineHeight:1,
          background:"linear-gradient(135deg,#F0C040,#A78BFA)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          backgroundClip:"text",
          filter:"drop-shadow(0 0 14px rgba(167,139,250,0.8))" }}>
          +{points}
        </span>
        <span style={{ fontFamily:"var(--font-mono),monospace", fontSize:13,
          color:"rgba(167,139,250,0.8)", textTransform:"uppercase", letterSpacing:"0.15em" }}>
          pts
        </span>
      </div>
      <div style={{ fontFamily:"var(--font-mono),monospace", fontSize:9,
        color:"rgba(240,192,48,0.6)", textTransform:"uppercase",
        letterSpacing:"0.14em", marginTop:4 }}>
        ≥ 3 dias ativos na semana
      </div>
    </div>
  );
}

/* ── Componente principal ─────────────────────────────────────── */
export function ScoreAnimation({ currentPoints }: { currentPoints: number }) {
  const [dayVisible,   setDayVisible]   = useState(false);
  const [bonusVisible, setBonusVisible] = useState(false);
  const [dayPts,   setDayPts]   = useState(0);
  const [bonusPts, setBonusPts] = useState(0);
  const [prevPts,  setPrevPts]  = useState(currentPoints);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    const raw = sessionStorage.getItem("justRegistered");
    if (!raw) return;
    sessionStorage.removeItem("justRegistered");
    done.current = true;

    try {
      const { dayPointsGained = 0, bonusGained = 0, ts } = JSON.parse(raw);
      if (Date.now() - ts > 30_000) return;
      if (dayPointsGained <= 0 && bonusGained <= 0) return;

      setPrevPts(currentPoints - dayPointsGained - bonusGained);
      setDayPts(dayPointsGained);
      setBonusPts(bonusGained);

      if (dayPointsGained > 0) {
        setDayVisible(true);
        playDaySound();
      }
      if (bonusGained > 0) {
        // Toca o som do bônus com pequeno delay para sequenciar
        setTimeout(() => {
          setBonusVisible(true);
          playBonusSound();
        }, 300);
      }
    } catch { /* parse error */ }
  }, []);

  if (!dayVisible && !bonusVisible) return null;

  return (
    <div style={{
      position: "fixed", bottom: 40, right: 40,
      zIndex: 9999, pointerEvents: "none",
      display: "flex", flexDirection: "column",
      alignItems: "flex-end", gap: 10,
    }}>
      {bonusVisible && (
        <BonusCard
          points={bonusPts}
          onEnd={() => setBonusVisible(false)}
        />
      )}
      {dayVisible && (
        <DayCard
          points={dayPts}
          totalPoints={currentPoints}
          prevTotal={prevPts}
          onEnd={() => setDayVisible(false)}
        />
      )}
    </div>
  );
}
