import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BarberBench IQ",
  description: "Your barber business coach — simple numbers, clear actions.",
  manifest: "/manifest.webmanifest",
  applicationName: "BarberBench IQ",
};

export const viewport: Viewport = {
  themeColor: "#111317",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NZ">
      <body>{children}</body>
    </html>
  );
}
