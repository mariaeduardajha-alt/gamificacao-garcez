export function SectionHeader({
  icon, title, subtitle, color
}: { icon: string; title: string; subtitle: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-1 h-8 rounded-full" style={{ background: color }} />
      <div>
        <h2 className="val-heading text-2xl md:text-3xl">
          <span className="mr-2 text-xl">{icon}</span>{title}
        </h2>
        <p className="font-mono text-rpg-textDim text-xs uppercase tracking-wider2 mt-0.5">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
