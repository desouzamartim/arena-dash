import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NBA Games",
  description: "Proximos e ultimos jogos da NBA"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
