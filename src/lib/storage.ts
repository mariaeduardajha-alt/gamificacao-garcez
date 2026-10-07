import { mkdir, writeFile } from "fs/promises";
import { join, dirname, resolve, sep } from "path";
import { randomBytes } from "crypto";

/**
 * Storage local simples em filesystem (prints de atividade/demanda e fotos de perfil).
 * - Dev: grava em ./uploads (servido pela rota protegida /uploads/[...path])
 * - Coolify: apontar UPLOADS_DIR para um volume persistente (ex: /data/uploads)
 */
const UPLOADS_DIR = resolve(process.env.UPLOADS_DIR || join(process.cwd(), "uploads"));
const PUBLIC_PATH = "/uploads";

/** Extensões aceitas → content-type servido. */
export const IMAGE_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
};

function extensionOf(name: string): string {
  return (name.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function isAllowedImage(file: File): boolean {
  return extensionOf(file.name) in IMAGE_MIME;
}

/** Salva o arquivo em `<UPLOADS_DIR>/<userId>/` e devolve a URL pública `/uploads/...`. */
export async function saveUpload(userId: string, file: File): Promise<string> {
  const id = randomBytes(8).toString("hex");
  const rel = `${userId}/${Date.now()}-${id}.${extensionOf(file.name)}`;
  const abs = join(UPLOADS_DIR, rel);

  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, Buffer.from(await file.arrayBuffer()));

  return `${PUBLIC_PATH}/${rel}`;
}

/** Caminho absoluto de um upload, ou null se o caminho tentar sair da pasta de uploads. */
export function resolveUploadAbsolute(relPath: string): string | null {
  const abs = resolve(UPLOADS_DIR, relPath);
  return abs.startsWith(UPLOADS_DIR + sep) ? abs : null;
}
