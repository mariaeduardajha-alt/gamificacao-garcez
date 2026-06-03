import { NextRequest } from "next/server";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { resolveUploadAbsolute } from "@/lib/storage";
import { auth } from "@/lib/auth";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic"
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const session = await auth();
  if (!session) return new Response("unauthorized", { status: 401 });

  const { path } = await params;
  const rel = path.join("/");
  const abs = resolveUploadAbsolute(rel);

  try {
    const s = await stat(abs);
    if (!s.isFile()) return new Response("not found", { status: 404 });
  } catch {
    return new Response("not found", { status: 404 });
  }

  const ext = rel.split(".").pop()?.toLowerCase() || "";
  const mime = MIME[ext] || "application/octet-stream";

  const stream = createReadStream(abs);
  return new Response(stream as any, {
    headers: {
      "content-type": mime,
      "cache-control": "private, max-age=3600"
    }
  });
}
