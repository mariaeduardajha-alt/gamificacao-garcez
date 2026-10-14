import { requireSession } from "@/lib/auth";
import { ComingSoon } from "@/components/ComingSoon";

export default async function BonsValoresPage() {
  await requireSession();
  return <ComingSoon title="Resgatando os Bons Valores" subtitle="Valores que nos unem como equipe" />;
}
