import { getWrapped } from "@/lib/github";
import { parseInput } from "@/lib/input";
import { errorResponse } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const { username, year } = parseInput(params.get("username"), params.get("year"));
    const stats = await getWrapped(username, year, params.get("demo") === "1");
    return Response.json(stats, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
