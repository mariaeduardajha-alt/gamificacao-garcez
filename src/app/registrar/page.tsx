import { requireSession } from "@/lib/auth";
import { getActiveChallenge } from "@/lib/challenge";
import { toInputValue } from "@/lib/format";
import { ActivityForm } from "./ActivityForm";

export const dynamic = "force-dynamic";

export default async function RegistrarPage() {
  await requireSession();
  const challenge = await getActiveChallenge();

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="val-heading text-2xl sm:text-3xl">Registrar atividade</h1>
          <p className="font-mono text-val-line text-xs uppercase tracking-wider2 mt-1">
            Registre seus dados · print opcional
          </p>
        </div>
        <ActivityForm minDate={toInputValue(challenge.startDate)} />
      </main>
    </>
  );
}
