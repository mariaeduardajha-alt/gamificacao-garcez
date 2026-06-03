export function PlayerAvatar({
  name,
  url,
  size = 40,
  rank
}: {
  name: string;
  url?: string | null;
  size?: number;
  rank?: number;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const rankColor =
    rank === 1 ? "border-val-gold shadow-[0_0_12px_rgba(228,200,110,0.6)]" :
    rank === 2 ? "border-val-line" :
    rank === 3 ? "border-[#D88757]" : "border-val-line/40";

  return (
    <div
      className={`relative flex items-center justify-center bg-val-bgDark border-2 ${rankColor} clip-notch-both overflow-hidden`}
      style={{ width: size, height: size }}
    >
      {url ? (
        <img src={url} alt={name} className="w-full h-full object-cover" style={{ objectPosition: "center 15%" }} />
      ) : (
        <span
          className="font-display uppercase text-val-cream"
          style={{ fontSize: size * 0.4, letterSpacing: "0.05em" }}
        >
          {initials || "?"}
        </span>
      )}
    </div>
  );
}
