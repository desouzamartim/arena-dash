import { getDefaultGameWindow, searchScheduleGames } from "@/lib/nba-api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const teamIdParam = searchParams.get("teamId");
  const date = searchParams.get("date") ?? undefined;
  const broadcastScope =
    searchParams.get("broadcastScope") === "br" ? "br" : "all";
  const teamId = teamIdParam ? Number(teamIdParam) : undefined;
  const hasFilters = Boolean(teamId || date || broadcastScope === "br");

  const games = hasFilters
    ? await searchScheduleGames({ teamId, date, broadcastScope })
    : await getDefaultGameWindow();

  return NextResponse.json({ games });
}
