import { mkdir, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { randomBytes } from "crypto";

/**
 * Storage local simples em filesystem.
 * - Dev: grava em ./uploads (servido via rota /uploads/[...path])
 * - Coolify: apontar UPLOADS_DIR pra um volume persistente (ex: /data/uploads)
 */
const UPLOADS_DIR = process.env.UPLOADS_DIR || join(process.cwd(), "uploads");
const PUBLIC_PATH = "/uploads";

export async function saveProof(userId: string, file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const id = randomBytes(8).toString("hex");
  const rel = `${userId}/${Date.now()}-${id}.${ext}`;
  const abs = join(UPLOADS_DIR, rel);
  const dir = dirname(abs);

  await mkdir(dir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(abs, buf);

  return `${PUBLIC_PATH}/${rel}`;
}

export function resolveUploadAbsolute(relPath: string): string {
  return join(UPLOADS_DIR, relPath);
}
