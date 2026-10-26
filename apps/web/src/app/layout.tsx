import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Mon-Foyer", template: "%s · Mon-Foyer" },
  description: "Dépenses et revenus personnels et du foyer, au même endroit.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider
      localization={frFR}
      appearance={{
        variables: {
          colorPrimary: "var(--primary)",
          colorBackground: "var(--surface)",
          colorForeground: "var(--foreground)",
          colorMutedForeground: "var(--muted)",
          colorDanger: "var(--danger)",
          borderRadius: "0.75rem",
          fontFamily: "var(--font-geist-sans)",
        },
      }}
    >
      <html lang="fr" className={`${geistSans.variable} h-full antialiased`}>
        <body className="flex min-h-full flex-col font-sans">{children}</body>
      </html>
    </ClerkProvider>
  );
}
