import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitHub Wrapped — Your year in code",
  description: "Turn your GitHub year into a story. Explore your commits, languages and streaks, then download a shareable recap.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
