import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const files = new Map<string, Promise<Buffer>>();
export function fontData(path: string) {
  if (!files.has(path)) files.set(path, readFile(path).catch(error => { files.delete(path); throw error; }));
  return files.get(path)!;
}

// Literal paths keep Next's file tracer from bundling entire font packages.
export async function socialFonts() {
  const [regular, bold, label, serif] = await Promise.all([
    fontData(join(process.cwd(), "node_modules/@fontsource/arimo/files/arimo-latin-400-normal.woff")),
    fontData(join(process.cwd(), "node_modules/@fontsource/arimo/files/arimo-latin-700-normal.woff")),
    fontData(join(process.cwd(), "node_modules/@fontsource/noto-sans-sc/files/noto-sans-sc-latin-700-normal.woff")),
    fontData(join(process.cwd(), "node_modules/@fontsource/libre-baskerville/files/libre-baskerville-latin-400-italic.woff")),
  ]);
  return {
    fonts: [
      { name: "WrappedSans", data: regular, weight: 400 as const, style: "normal" as const },
      { name: "WrappedSans", data: bold, weight: 700 as const, style: "normal" as const },
      { name: "WrappedLabel", data: label, weight: 700 as const, style: "normal" as const },
      { name: "WrappedSerif", data: serif, weight: 400 as const, style: "italic" as const },
    ],
    fontFamily: "WrappedSans", labelFontFamily: "WrappedLabel", serifFontFamily: "WrappedSerif",
  };
}
