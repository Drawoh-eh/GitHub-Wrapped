import type { Metadata } from "next";
import { socialMetadata } from "@/lib/social";
import { SITE_URL } from "@/lib/links";
import "./globals.css";
import "@fontsource/arimo/400.css";
import "@fontsource/arimo/700.css";
import "@fontsource/libre-baskerville/latin-400-italic.css";
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/700.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...socialMetadata(),
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
