import { requireSession } from "@/lib/auth";
import { ComingSoon } from "@/components/ComingSoon";

export default async function CampanhasPage() {
  await requireSession();
  return <ComingSoon title="Campanhas" subtitle="Calendário de campanhas de conscientização" />;
}
