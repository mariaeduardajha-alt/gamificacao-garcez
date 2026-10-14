import { BrandFrame } from "./BrandFrame";

/** Página institucional reservada para uma seção que ainda será construída. */
export function ComingSoon({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <header className="mb-8">
        <h1 className="font-serif font-semibold text-brand-title text-4xl sm:text-5xl leading-tight">{title}</h1>
        <div className="mt-3 h-px w-16 bg-brand-title/50" />
        <p className="font-brand font-bold text-brand-title text-sm sm:text-base mt-3">{subtitle}</p>
      </header>
      <BrandFrame>
        <div className="text-center py-14 px-4">
          <div className="font-serif italic font-semibold text-brand-title text-2xl">Em construção</div>
          <p className="font-brand text-brand-ink text-sm mt-2">Esta seção estará disponível em breve.</p>
        </div>
      </BrandFrame>
    </main>
  );
}
