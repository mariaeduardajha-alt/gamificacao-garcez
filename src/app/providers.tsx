"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { initAudioUnlock } from "@/lib/audio";

export function Providers({ children }: { children: React.ReactNode }) {
  // Destrava o áudio no primeiro gesto do usuário (necessário no mobile)
  useEffect(() => { initAudioUnlock(); }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
