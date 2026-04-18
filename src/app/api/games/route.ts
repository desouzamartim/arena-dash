import { getDefaultGameWindow, searchScheduleGames } from "@/lib/nba-api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const teamIdParam = searchParams.get("teamId");
  const date = searchParams.get("date") ?? undefined;
  const teamId = teamIdParam ? Number(teamIdParam) : undefined;
  const hasFilters = Boolean(teamId || date);

  const games = hasFilters
    ? await searchScheduleGames({ teamId, date })
    : await getDefaultGameWindow();

  return NextResponse.json({ games });
}
