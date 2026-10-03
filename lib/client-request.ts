// Use AbortController so request timeouts also work without AbortSignal.timeout.
export async function withRequestTimeout<T>(request: (signal: AbortSignal) => Promise<T>, milliseconds = 35_000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new DOMException("The request took too long.", "TimeoutError")), milliseconds);
  try {
    return await request(controller.signal);
  } catch (error) {
    if (controller.signal.aborted) throw controller.signal.reason;
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
