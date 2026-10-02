import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/api/card": ["./node_modules/@fontsource/noto-sans-sc/files/*-400-normal.woff", "./node_modules/@fontsource/noto-sans-sc/files/*-700-normal.woff", "./node_modules/@fontsource/arimo/files/*-400-normal.woff", "./node_modules/@fontsource/arimo/files/*-700-normal.woff", "./node_modules/@fontsource/libre-baskerville/files/*-400-italic.woff"],
    "/api/og": ["./node_modules/@fontsource/noto-sans-sc/files/*-400-normal.woff", "./node_modules/@fontsource/noto-sans-sc/files/*-700-normal.woff", "./node_modules/@fontsource/arimo/files/*-400-normal.woff", "./node_modules/@fontsource/arimo/files/*-700-normal.woff", "./node_modules/@fontsource/libre-baskerville/files/*-400-italic.woff"],
  },
  outputFileTracingExcludes: {
    "/api/card": ["./node_modules/@fontsource/noto-sans-sc/files/*.woff2", ...[100, 200, 300, 500, 600, 800, 900].map(weight => `./node_modules/@fontsource/noto-sans-sc/files/*-${weight}-normal.woff`)],
    "/api/og": ["./node_modules/@fontsource/noto-sans-sc/files/*.woff2", ...[100, 200, 300, 500, 600, 800, 900].map(weight => `./node_modules/@fontsource/noto-sans-sc/files/*-${weight}-normal.woff`)],
  },
};

export default config;
