import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AIbnb Studio — Automatiza tus alojamientos con IA",
  description:
    "Plataforma SaaS para anfitriones de Airbnb: mensajería con IA, generación de anuncios, imágenes y vídeos, automatizaciones y analítica.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
