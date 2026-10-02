import type { Metadata } from "next";
import "./globals.css";
import "@fontsource/arimo/400.css";
import "@fontsource/arimo/700.css";
import "@fontsource/libre-baskerville/latin-400-italic.css";
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/700.css";

export const metadata: Metadata = {
  title: "GitHub Wrapped — Your year in code",
  description: "Turn your GitHub year into a story. Explore your commits, languages and streaks, then download a shareable recap.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
