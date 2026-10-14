import Image from "next/image";
import { requireSession } from "@/lib/auth";
import { BrandFrame } from "@/components/BrandFrame";

/** Página de entrada do site de Pessoas e Cultura: a marca da Garcez. */
export default async function HomePage() {
  await requireSession();

  return (
    <main className="min-h-[calc(100vh-3.5rem)] lg:min-h-screen flex p-4 sm:p-8">
      <BrandFrame variant="outline" className="flex-1 flex flex-col">
        <div className="h-full flex flex-col items-center justify-center text-center px-6 py-16">
          <Image
            src="/garcez-logo-escuro.png"
            alt="Garcez Consultoria Jurídica"
            width={1082}
            height={322}
            priority
            className="w-full max-w-[460px] h-auto object-contain"
          />
          <div className="mt-10 flex items-center gap-4">
            <span className="h-px w-8 sm:w-12 bg-brand-title/50" />
            <span className="font-serif italic font-semibold text-brand-title text-2xl sm:text-3xl whitespace-nowrap">Pessoas e Cultura</span>
            <span className="h-px w-8 sm:w-12 bg-brand-title/50" />
          </div>
        </div>
      </BrandFrame>
    </main>
  );
}
