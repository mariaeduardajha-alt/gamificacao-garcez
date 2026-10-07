import { NextRequest } from "next/server";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
import { resolveUploadAbsolute, IMAGE_MIME } from "@/lib/storage";
import { requireAuth } from "@/lib/api-auth";

/** Serve um arquivo enviado (print ou foto) — apenas para usuários logados. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  // Esta rota serve arquivos binários com corpo de texto simples em caso de erro
  // (não o envelope JSON `{error}` das demais rotas) — por isso não usa
  // apiError()/withApiHandler() aqui, só reaproveita a checagem de sessão.
  const authResult = await requireAuth();
  if (!authResult.ok) return new Response("unauthorized", { status: 401 });

  const { path } = await params;
  const rel = path.join("/");
  const abs = resolveUploadAbsolute(rel);
  if (!abs) return new Response("not found", { status: 404 });

  try {
    const s = await stat(abs);
    if (!s.isFile()) return new Response("not found", { status: 404 });
  } catch {
    return new Response("not found", { status: 404 });
  }

  const ext = rel.split(".").pop()?.toLowerCase() || "";
  const stream = Readable.toWeb(createReadStream(abs)) as ReadableStream;
  return new Response(stream, {
    headers: {
      "content-type": IMAGE_MIME[ext] || "application/octet-stream",
      "cache-control": "private, max-age=3600"
    }
  });
}
