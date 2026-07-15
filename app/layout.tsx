import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BarberBench IQ",
  description: "Know your numbers. Grow your business.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
