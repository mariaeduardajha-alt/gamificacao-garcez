/** Ícones SVG reutilizados em mais de um lugar. */

export function TrashIcon({ size = 13 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 18" width={size} height={Math.round(size * 1.15)} fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 4h14M6 4V2h4v2M5 4v10a1 1 0 001 1h4a1 1 0 001-1V4" />
      <line x1="7" y1="7" x2="7" y2="12" />
      <line x1="9" y1="7" x2="9" y2="12" />
    </svg>
  );
}

/** Seta para baixo; gira 180° quando `open`. */
export function ChevronIcon({ open = false, size = 9 }: { open?: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 10 10" width={size} height={size} fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
      <path d="M1.5 3.5l3 3 3-3" />
    </svg>
  );
}
