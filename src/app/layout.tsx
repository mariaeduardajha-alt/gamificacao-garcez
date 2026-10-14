import type { Metadata } from "next";
import { Tomorrow, Rajdhani, JetBrains_Mono, Cormorant_Garamond, Lato } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppShell } from "@/components/AppShell";

const display = Tomorrow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display"
});

const sans = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans"
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono"
});

// Fontes institucionais (fora da área de jogos), na linha do logo da Garcez
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif"
});

const brand = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-brand"
});

export const metadata: Metadata = {
  title: "Pessoas e Cultura · Garcez Consultoria",
  description: "Plataforma de indicadores e gamificação da equipe Garcez Consultoria Jurídica",
  icons: { icon: "/favicon.svg" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable} ${mono.variable} ${serif.variable} ${brand.variable}`}>
      <body className="font-brand">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
