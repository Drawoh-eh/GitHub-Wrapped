import test from "node:test";
import assert from "node:assert/strict";
import { withRequestTimeout } from "../lib/client-request";

test("stalled requests abort with an identifiable timeout", async () => {
  await assert.rejects(withRequestTimeout(signal => new Promise((_, reject) => {
    signal.addEventListener("abort", () => reject(signal.reason), { once: true });
  }), 10), { name: "TimeoutError" });
});

test("successful requests cancel their timeout and preserve the result", async () => {
  let requestSignal: AbortSignal | undefined;
  assert.equal(await withRequestTimeout(async signal => { requestSignal = signal; return "ready"; }, 10), "ready");
  await new Promise(resolve => setTimeout(resolve, 25));
  assert.equal(requestSignal?.aborted, false);
});

test("network errors remain distinguishable from timeouts", async () => {
  const error = new TypeError("Failed to fetch");
  await assert.rejects(withRequestTimeout(async () => { throw error; }), caught => caught === error);
});
