import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ArenaDash",
    template: "%s | ArenaDash"
  },
  description: "Dashboard em tempo real para acompanhar jogos da NBA.",
  icons: {
    icon: "/arena-dash-icon.svg",
    shortcut: "/arena-dash-icon.svg",
    apple: "/arena-dash-icon.svg"
  }
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
