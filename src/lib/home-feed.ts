import { getGameStatusLabel } from "@/lib/nba-game-format";
import { NbaGame } from "@/lib/nba-api";

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
  homeTeam: string;
  awayScore: number;
  homeScore: number;
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

export function getHomeGameFeedItems(todayGames: NbaGame[], limit = 8) {
  const activeGames = todayGames.filter((game) => game.status !== "final");
  const sourceGames = activeGames.length > 0 ? activeGames : todayGames;

  return sortGamesByStartTime(sourceGames).slice(0, limit).map((game) => ({
    id: game.id,
    href: `/nba-${game.id}`,
    leagueName: "NBA",
    leagueSlug: "nba",
    status: game.status,
    statusLabel: getGameStatusLabel(game),
    startLabel: `${game.timeBr} BRT`,
    stage: game.stage,
    awayTeam: game.awayTeam.abbreviation,
    homeTeam: game.homeTeam.abbreviation,
    awayScore: game.awayTeam.score,
    homeScore: game.homeTeam.score
  }));
}
