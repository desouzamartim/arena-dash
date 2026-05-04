import { getGameStatusLabel } from "@/lib/nba-game-format";
import { NbaGame, getTeamLogo } from "@/lib/nba-api";

export type HomeGameFeedItem = {
  id: string;
  href: string;
  leagueName: string;
  leagueSlug: string;
  status: NbaGame["status"];
  statusLabel: string;
  startLabel: string;
  stage: string;
  awayTeam: string;
  awayTeamLogo: string;
  homeTeam: string;
  homeTeamLogo: string;
  awayScore: number;
  homeScore: number;
  broadcasts: string[];
};

function getGameStartTimestamp(game: NbaGame) {
  const [hours = "0", minutes = "0"] = game.timeBr.split(":");
  const gameDate = new Date(`${game.date}T00:00:00-03:00`);

  gameDate.setHours(Number(hours), Number(minutes), 0, 0);

  return gameDate.getTime();
}

function sortGamesByStartTime(games: NbaGame[]) {
  return [...games].sort((firstGame, secondGame) => {
    return getGameStartTimestamp(firstGame) - getGameStartTimestamp(secondGame);
  });
}

export function getHomeGameFeedItems(todayGames: NbaGame[]) {
  const finalGames = sortGamesByStartTime(todayGames.filter((g) => g.status === "final"));
  const activeGames = sortGamesByStartTime(todayGames.filter((g) => g.status !== "final"));

  const recentFinals = finalGames.slice(-2);
  const upcomingActive = activeGames.slice(0, 6);

  return [...recentFinals, ...upcomingActive].map((game) => ({
    id: game.id,
    href: `/nba-${game.id}`,
    leagueName: "NBA",
    leagueSlug: "nba",
    status: game.status,
    statusLabel: game.status === "scheduled" ? "Agendado" : getGameStatusLabel(game),
    startLabel: `${game.timeBr} BRT`,
    stage: game.stage,
    awayTeam: game.awayTeam.abbreviation,
    awayTeamLogo: getTeamLogo(game.awayTeam.id),
    homeTeam: game.homeTeam.abbreviation,
    homeTeamLogo: getTeamLogo(game.homeTeam.id),
    awayScore: game.awayTeam.score,
    homeScore: game.homeTeam.score,
    broadcasts: game.broadcastsBrazil
  }));
}
