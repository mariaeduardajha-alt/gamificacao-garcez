export function ProgressBar({
  value,
  bronze,
  silver,
  gold,
  total
}: {
  value: number;
  bronze: number;
  silver: number;
  gold: number;
  total: number;
}) {
  const pct = (v: number) => Math.min(100, (v / gold) * 100);
  const bronzePct = (bronze / gold) * 100;
  const silverPct = (silver / gold) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="font-display uppercase tracking-wider2 text-val-line text-xs">Meta coletiva</div>
          <div className="font-display text-4xl text-val-cream">
            {total.toLocaleString("pt-BR")} <span className="text-val-red text-2xl">kcal</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-display uppercase tracking-wider2 text-val-line text-xs">Ouro</div>
          <div className="font-mono text-val-gold text-lg">{gold.toLocaleString("pt-BR")}</div>
        </div>
      </div>

      <div className="relative h-6 bg-val-bgDark border border-val-line/30 clip-notch overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-val-red to-val-gold transition-all duration-700"
          style={{ width: `${pct(value)}%` }}
        />
        {/* Marcos */}
        <div
          className="absolute inset-y-0 w-px bg-val-cream/60"
          style={{ left: `${bronzePct}%` }}
          title="Bronze"
        />
        <div
          className="absolute inset-y-0 w-px bg-val-cream/60"
          style={{ left: `${silverPct}%` }}
          title="Prata"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 font-mono text-[10px] uppercase tracking-wider2 text-val-line">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-[#B8734A]" />
          Bronze {bronze.toLocaleString("pt-BR")}
        </div>
        <div className="flex items-center gap-1 justify-center">
          <span className="w-2 h-2 bg-[#C5CAD1]" />
          Prata {silver.toLocaleString("pt-BR")}
        </div>
        <div className="flex items-center gap-1 justify-end">
          <span className="w-2 h-2 bg-val-gold" />
          Ouro {gold.toLocaleString("pt-BR")}
        </div>
      </div>
    </div>
  );
}
