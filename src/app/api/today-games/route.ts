import { getTodayGames } from "@/lib/nba-api";
import { NextResponse } from "next/server";

export async function GET() {
  const games = await getTodayGames();

  return NextResponse.json({ games });
}
