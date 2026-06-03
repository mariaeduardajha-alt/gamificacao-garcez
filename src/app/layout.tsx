import type { Metadata } from "next";
import { Tomorrow, Rajdhani, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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

export const metadata: Metadata = {
  title: "INDICADORES GARCEZ CONSULTORIA",
  description: "Plataforma de indicadores e gamificação da equipe Garcez Consultoria Jurídica",
  icons: { icon: "/favicon.svg" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
