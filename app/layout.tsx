import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TopNav } from "@/components/top-nav";
import { SiteFooter } from "@/components/site-footer";
import { Providers } from "@/components/providers";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "ZenCrates - Synthetic Exposure & Strategy Vaults",
  description:
    "Non-custodial synthetic exposure tokens and open-data proxy indices with rules-based strategy crates on Horizen L3.",
  icons: {
    icon: "/zkGold-250.png",
    apple: "/zkGold-250.png",
  },
  openGraph: {
    title: "ZenCrates - Synthetic Exposure & Strategy Vaults",
    description:
      "Non-custodial synthetic exposure tokens and open-data proxy indices with rules-based strategy crates on Horizen L3.",
    images: [
      {
        url: "/zkGold.png",
        width: 1024,
        height: 1024,
        alt: "ZenCrates Logo",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0c1222",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <TopNav />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
