import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import "./product.css";
import { AppHydrator } from "@/components/app/app-hydrator";
import { AppShell } from "@/components/app/app-shell";

const display = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
  display: "swap",
});

const ui = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "PRO // Training", template: "%s · PRO // Training" },
  description: "A fictional, mobile-first PRO Goaltending athlete development product demo.",
  applicationName: "PRO Goaltending",
  appleWebApp: { capable: true, title: "PRO Training", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#07101d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${display.variable} ${ui.variable}`}>
      <body>
        <AppHydrator>
          <AppShell>{children}</AppShell>
        </AppHydrator>
      </body>
    </html>
  );
}
