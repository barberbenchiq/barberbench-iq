import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BarberBench IQ | Smarter barber business decisions",
  description: "Track performance, understand your numbers, and grow a stronger barber business.",
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
