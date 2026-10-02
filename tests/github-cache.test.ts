import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

test("server cache keeps current-year activity fresh and preserves GitHub levels", () => {
  const output = execFileSync(process.execPath, ["--conditions=react-server", "--import", "tsx", fileURLToPath(new URL("./fixtures/github-cache.ts", import.meta.url))], { encoding: "utf8" });
  assert.match(output, /UTC rollover and past-year caching verified/);
});
