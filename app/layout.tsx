import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumo — Landing pages e automação de processos",
  description: "Design, desenvolvimento e automação para empresas que querem ir mais longe. Conte sua ideia à Lumo.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
