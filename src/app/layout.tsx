import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { ToasterProvider } from "@/components/layout/ToasterProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "900"],
});

export const metadata: Metadata = {
  title: "Bingo Dieciochero",
  description:
    "Aplicación para administrar y proyectar un bingo presencial con estética de Fiestas Patrias.",
};

export const viewport: Viewport = {
  themeColor: "#102A43",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CL">
      <body className={`${inter.variable} ${fraunces.variable} antialiased`}>
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
