"use client";

/**
 * Áudio compartilhado para as notificações sonoras (pontuação, bônus, conquista).
 *
 * Navegadores móveis (iOS Safari, Chrome Android) bloqueiam o AudioContext até
 * que haja um gesto do usuário. Como os sons do app disparam no carregamento da
 * página (não num toque direto), eles ficariam mudos no celular.
 *
 * Solução: um único AudioContext compartilhado, destravado no primeiro gesto do
 * usuário (toque/clique/tecla) e reaproveitado por todos os sons. Uma vez
 * "running", ele toca sons programáticos mesmo sem gesto direto.
 */

let ctx: AudioContext | null = null;
let unlockBound = false;

function createCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

/** Retorna o AudioContext compartilhado, tentando retomá-lo se estiver suspenso. */
export function getAudioCtx(): AudioContext | null {
  const c = createCtx();
  if (c && c.state === "suspended") c.resume().catch(() => {});
  return c;
}

/**
 * Liga o "destravamento" do áudio: no primeiro gesto do usuário, retoma o
 * contexto e toca um buffer silencioso (necessário no iOS). Chamar uma vez,
 * cedo (ex.: no Providers).
 */
export function initAudioUnlock() {
  if (unlockBound || typeof window === "undefined") return;
  unlockBound = true;

  const unlock = () => {
    const c = createCtx();
    if (!c) return;
    if (c.state === "suspended") c.resume().catch(() => {});
    try {
      const buf = c.createBuffer(1, 1, 22050);
      const src = c.createBufferSource();
      src.buffer = buf;
      src.connect(c.destination);
      src.start(0);
    } catch {
      /* ignore */
    }
  };

  ["pointerdown", "touchend", "click", "keydown"].forEach((ev) =>
    window.addEventListener(ev, unlock, { passive: true })
  );
}

/**
 * Toca uma sequência de tons. Cada tom: [frequência, atraso(s), duração(s), tipo?, volume?].
 * Usa o contexto compartilhado já destravado — funciona no mobile.
 */
export function playTones(
  notes: [number, number, number, OscillatorType?, number?][]
) {
  const c = getAudioCtx();
  if (!c) return;
  const t0 = c.currentTime;
  for (const [freq, start, dur, type = "square", vol = 0.13] of notes) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0 + start);
    gain.gain.setValueAtTime(vol, t0 + start);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + start + dur);
    osc.start(t0 + start);
    osc.stop(t0 + start + dur + 0.03);
  }
}
