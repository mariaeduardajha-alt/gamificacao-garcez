import { requireSession } from "@/lib/auth";
import { ComingSoon } from "@/components/ComingSoon";

export default async function MuralDosSonhosPage() {
  await requireSession();
  return <ComingSoon title="Mural dos Sonhos" subtitle="Os sonhos de cada pessoa da equipe" />;
}
