import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/common/ToastProvider";
import TopBar from "@/components/layout/TopBar";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Poli Júnior - NTEC",
  description: "Plataforma de Gestão de Projetos da Poli Júnior",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${rubik.variable} antialiased`}>
        {}
        <TopBar />
        {}
        <div className="pt-14">{children}</div>
        <ToastProvider />
      </body>
    </html>
  );
}
