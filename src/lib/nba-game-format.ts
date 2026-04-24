import { NbaGame } from "@/lib/nba-api";

const DEFAULT_BROADCAST_LABEL = "NBA League Pass";

export function formatGameDateShort(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC"
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatGameDateLong(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatLiveClock(period: number, clock: string) {
  const periodLabel = period > 0 ? `${period}o quarto` : "Ao vivo";
  const match = clock.match(/PT(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);

  if (!match) {
    return periodLabel;
  }

  const minutes = Number(match[1] ?? 0);
  const seconds = Math.floor(Number(match[2] ?? 0));

  if (minutes === 0 && seconds === 0) {
    return periodLabel;
  }

  return `${periodLabel} ${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function getGameStatusLabel(game: NbaGame) {
  if (game.status === "live") {
    return formatLiveClock(game.period, game.clock);
  }

  if (game.status === "final") {
    return "Finalizado";
  }

  return `${game.timeBr} BRT`;
}

export function getLiveDashboardStatusLabel(game: NbaGame) {
  if (game.status === "live") {
    return formatLiveClock(game.period, game.clock);
  }

  if (game.status === "final") {
    return "Final";
  }

  return `${game.timeBr} BRT`;
}

export function getGameDetailTimeLabel(game: NbaGame) {
  if (game.status === "scheduled") {
    return `Horario: ${game.timeBr} BRT`;
  }

  if (game.status === "live") {
    return formatLiveClock(game.period, game.clock);
  }

  return "Partida encerrada";
}

export function getBroadcastLabel(broadcastsBrazil: string[]) {
  if (broadcastsBrazil.length > 0) {
    return broadcastsBrazil.join(" + ");
  }

  return DEFAULT_BROADCAST_LABEL;
}
