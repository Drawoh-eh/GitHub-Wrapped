import { WrappedError } from "./input";

export function errorResponse(error: unknown) {
  const known = error instanceof WrappedError;
  return Response.json({ error: known ? error.message : "Something went wrong. Please try again." }, {
    status: known ? error.status : 500,
    headers: { "Cache-Control": "no-store" },
  });
}
