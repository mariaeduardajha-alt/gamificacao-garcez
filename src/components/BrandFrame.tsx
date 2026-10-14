/**
 * Moldura institucional com filete interno (como o fundo do LightForms).
 * - "card": cartão claro, onde fica o corpo de texto (#2F4159 legível).
 * - "outline": só o filete, direto sobre o fundo (ex.: página inicial).
 */
export function BrandFrame({
  children, className = "", variant = "card",
}: { children: React.ReactNode; className?: string; variant?: "card" | "outline" }) {
  const isCard = variant === "card";
  return (
    <div
      className={`relative rounded-sm p-3 sm:p-4 ${isCard ? "bg-brand-surface" : ""} ${className}`}
      style={isCard ? { boxShadow: "0 12px 40px rgba(40,30,5,0.25)" } : undefined}
    >
      <div className={`h-full flex-1 border ${isCard ? "border-brand-line" : "border-brand-line"}`}>{children}</div>
    </div>
  );
}
