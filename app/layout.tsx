import type { Metadata } from "next";
import { bootScript } from "@/lib/boot";
import "@fontsource-variable/archivo/wdth.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arthur Gonçalves | Security Engineering & AI Security",
  description:
    "Portfólio de Arthur Gonçalves: Security Engineering, AI Security, automação, SIEM, EDR e pesquisa aplicada.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/icon.png?v=2",
    shortcut: "/icon.png?v=2",
    apple: "/icon.png?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The boot script sets data-mode, data-webgl and lang on <html> before hydration.
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
