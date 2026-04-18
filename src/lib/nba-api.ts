import { getBroadcastsBrazil } from "@/data/broadcasts-br";

export type NbaTeam = {
  id: number;
  city: string;
  name: string;
  abbreviation: string;
  seed?: number;
  score: number;
  color: string;
};

export type NbaGame = {
  id: string;
  date: string;
  status: "scheduled" | "live" | "final";
  statusText: string;
  timeBr: string;
  stage: string;
  seriesText: string;
  broadcastsBrazil: string[];
  period: number;
  clock: string;
  homeTeam: NbaTeam;
  awayTeam: NbaTeam;
};

type NbaApiTeam = {
  teamId: number;
  teamName: string;
  teamCity: string;
  teamTricode: string;
  score: number;
  seed?: number;
};

type NbaApiGame = {
  gameId: string;
  gameStatus: number;
  gameStatusText: string;
  gameTimeUTC: string;
  period: number;
  gameClock: string;
  gameLabel: string;
  gameSubLabel: string;
  seriesText: string;
  homeTeam: NbaApiTeam;
  awayTeam: NbaApiTeam;
};

type NbaScoreboardResponse = {
  scoreboard: {
    gameDate: string;
    games: NbaApiGame[];
  };
};

type NbaScheduleTeam = Partial<NbaApiTeam>;

type NbaScheduleGame = Partial<{
  gameId: string;
  gameStatus: number;
  gameStatusText: string;
  gameDateTimeUTC: string;
  gameTimeUTC: string;
  gameLabel: string;
  gameSubLabel: string;
  seriesText: string;
  homeTeam: NbaScheduleTeam;
  awayTeam: NbaScheduleTeam;
}>;

type NbaScheduleDate = {
  gameDate: string;
  games: NbaScheduleGame[];
};

type NbaScheduleResponse = {
  leagueSchedule: {
    gameDates: NbaScheduleDate[];
  };
};

const SCOREBOARD_URL =
  "https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json";
const SCHEDULE_URL =
  "https://cdn.nba.com/static/json/staticData/scheduleLeagueV2_1.json";

const TEAM_COLORS: Record<string, string> = {
  ATL: "#e03a3e",
  BOS: "#007a33",
  CHA: "#1d8cab",
  CLE: "#860038",
  DEN: "#fdb927",
  DET: "#1d42ba",
  GSW: "#1d428a",
  HOU: "#ce1141",
  LAC: "#c8102e",
  LAL: "#552583",
  MIA: "#98002e",
  MIN: "#0c2340",
  NYK: "#f58426",
  OKC: "#007ac1",
  ORL: "#0077c0",
  PHI: "#006bb6",
  PHX: "#e56020",
  POR: "#e03a3e",
  SAS: "#8a8d8f",
  TOR: "#ce1141",
  WAS: "#002b5c"
};

const FALLBACK_TODAY_GAMES: NbaGame[] = [
  {
    id: "0052500201",
    date: "2026-04-17",
    status: "scheduled",
    statusText: "7:30 pm ET",
    timeBr: "20:30",
    stage: "Play-In - Leste",
    seriesText: "Vencedor fica com a 8a vaga",
    broadcastsBrazil: ["Prime Video"],
    period: 0,
    clock: "",
    awayTeam: {
      id: 1610612766,
      city: "Charlotte",
      name: "Hornets",
      abbreviation: "CHA",
      seed: 9,
      score: 0,
      color: "#1d8cab"
    },
    homeTeam: {
      id: 1610612753,
      city: "Orlando",
      name: "Magic",
      abbreviation: "ORL",
      seed: 8,
      score: 0,
      color: "#0077c0"
    }
  },
  {
    id: "0052500211",
    date: "2026-04-17",
    status: "scheduled",
    statusText: "10:00 pm ET",
    timeBr: "23:00",
    stage: "Play-In - Oeste",
    seriesText: "Vencedor fica com a 8a vaga",
    broadcastsBrazil: ["Prime Video"],
    period: 0,
    clock: "",
    awayTeam: {
      id: 1610612744,
      city: "Golden State",
      name: "Warriors",
      abbreviation: "GSW",
      seed: 10,
      score: 0,
      color: "#1d428a"
    },
    homeTeam: {
      id: 1610612756,
      city: "Phoenix",
      name: "Suns",
      abbreviation: "PHX",
      seed: 7,
      score: 0,
      color: "#e56020"
    }
  }
];

const FALLBACK_GAME_WINDOW: NbaGame[] = [
  {
    id: "0052500101",
    date: "2026-04-14",
    status: "final",
    statusText: "Final",
    timeBr: "20:30",
    stage: "Play-In - Leste",
    seriesText: "Charlotte avancou",
    broadcastsBrazil: ["Prime Video"],
    period: 4,
    clock: "",
    awayTeam: {
      id: 1610612748,
      city: "Miami",
      name: "Heat",
      abbreviation: "MIA",
      seed: 10,
      score: 126,
      color: "#98002e"
    },
    homeTeam: {
      id: 1610612766,
      city: "Charlotte",
      name: "Hornets",
      abbreviation: "CHA",
      seed: 9,
      score: 127,
      color: "#1d8cab"
    }
  },
  {
    id: "0052500111",
    date: "2026-04-14",
    status: "final",
    statusText: "Final",
    timeBr: "23:00",
    stage: "Play-In - Oeste",
    seriesText: "Portland ficou com a 7a vaga",
    broadcastsBrazil: ["Prime Video"],
    period: 4,
    clock: "",
    awayTeam: {
      id: 1610612757,
      city: "Portland",
      name: "Trail Blazers",
      abbreviation: "POR",
      seed: 8,
      score: 114,
      color: "#e03a3e"
    },
    homeTeam: {
      id: 1610612756,
      city: "Phoenix",
      name: "Suns",
      abbreviation: "PHX",
      seed: 7,
      score: 110,
      color: "#e56020"
    }
  },
  {
    id: "0052500102",
    date: "2026-04-15",
    status: "final",
    statusText: "Final",
    timeBr: "20:30",
    stage: "Play-In - Leste",
    seriesText: "Philadelphia ficou com a 7a vaga",
    broadcastsBrazil: ["Prime Video"],
    period: 4,
    clock: "",
    awayTeam: {
      id: 1610612753,
      city: "Orlando",
      name: "Magic",
      abbreviation: "ORL",
      seed: 8,
      score: 97,
      color: "#0077c0"
    },
    homeTeam: {
      id: 1610612755,
      city: "Philadelphia",
      name: "76ers",
      abbreviation: "PHI",
      seed: 7,
      score: 109,
      color: "#006bb6"
    }
  },
  {
    id: "0052500112",
    date: "2026-04-15",
    status: "final",
    statusText: "Final",
    timeBr: "23:00",
    stage: "Play-In - Oeste",
    seriesText: "Golden State avancou",
    broadcastsBrazil: ["Prime Video"],
    period: 4,
    clock: "",
    awayTeam: {
      id: 1610612744,
      city: "Golden State",
      name: "Warriors",
      abbreviation: "GSW",
      seed: 10,
      score: 126,
      color: "#1d428a"
    },
    homeTeam: {
      id: 1610612746,
      city: "LA",
      name: "Clippers",
      abbreviation: "LAC",
      seed: 9,
      score: 121,
      color: "#c8102e"
    }
  },
  ...FALLBACK_TODAY_GAMES,
  {
    id: "0042500101",
    date: "2026-04-18",
    status: "scheduled",
    statusText: "1:00 pm ET",
    timeBr: "14:00",
    stage: "Playoffs - Leste",
    seriesText: "Jogo 1",
    broadcastsBrazil: ["Prime Video"],
    period: 0,
    clock: "",
    awayTeam: {
      id: 1610612761,
      city: "Toronto",
      name: "Raptors",
      abbreviation: "TOR",
      score: 0,
      color: "#ce1141"
    },
    homeTeam: {
      id: 1610612739,
      city: "Cleveland",
      name: "Cavaliers",
      abbreviation: "CLE",
      score: 0,
      color: "#860038"
    }
  },
  {
    id: "0042500161",
    date: "2026-04-18",
    status: "scheduled",
    statusText: "3:30 pm ET",
    timeBr: "16:30",
    stage: "Playoffs - Oeste",
    seriesText: "Jogo 1",
    broadcastsBrazil: ["Prime Video"],
    period: 0,
    clock: "",
    awayTeam: {
      id: 1610612750,
      city: "Minnesota",
      name: "Timberwolves",
      abbreviation: "MIN",
      score: 0,
      color: "#0c2340"
    },
    homeTeam: {
      id: 1610612743,
      city: "Denver",
      name: "Nuggets",
      abbreviation: "DEN",
      score: 0,
      color: "#fdb927"
    }
  },
  {
    id: "0042500131",
    date: "2026-04-18",
    status: "scheduled",
    statusText: "6:00 pm ET",
    timeBr: "19:00",
    stage: "Playoffs - Leste",
    seriesText: "Jogo 1",
    broadcastsBrazil: ["Prime Video"],
    period: 0,
    clock: "",
    awayTeam: {
      id: 1610612737,
      city: "Atlanta",
      name: "Hawks",
      abbreviation: "ATL",
      score: 0,
      color: "#e03a3e"
    },
    homeTeam: {
      id: 1610612752,
      city: "New York",
      name: "Knicks",
      abbreviation: "NYK",
      score: 0,
      color: "#f58426"
    }
  },
  {
    id: "0042500141",
    date: "2026-04-18",
    status: "scheduled",
    statusText: "8:30 pm ET",
    timeBr: "21:30",
    stage: "Playoffs - Oeste",
    seriesText: "Jogo 1",
    broadcastsBrazil: ["ABC"],
    period: 0,
    clock: "",
    awayTeam: {
      id: 1610612745,
      city: "Houston",
      name: "Rockets",
      abbreviation: "HOU",
      score: 0,
      color: "#ce1141"
    },
    homeTeam: {
      id: 1610612747,
      city: "Los Angeles",
      name: "Lakers",
      abbreviation: "LAL",
      score: 0,
      color: "#552583"
    }
  }
];

function mapStatus(gameStatus: number): NbaGame["status"] {
  if (gameStatus === 2) {
    return "live";
  }

  if (gameStatus === 3) {
    return "final";
  }

  return "scheduled";
}

function formatTimeBr(gameTimeUTC: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo"
  }).format(new Date(gameTimeUTC));
}

function parseScheduleDate(gameDate: string) {
  const [datePart] = gameDate.split(" ");
  const [month, day, year] = datePart.split("/");

  if (!month || !day || !year) {
    return gameDate;
  }

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function normalizeTeam(team: NbaApiTeam): NbaTeam {
  return {
    id: team.teamId,
    city: team.teamCity,
    name: team.teamName,
    abbreviation: team.teamTricode,
    seed: team.seed,
    score: team.score,
    color: TEAM_COLORS[team.teamTricode] ?? "#1d428a"
  };
}

function normalizeScheduleTeam(team: NbaScheduleTeam): NbaTeam {
  const abbreviation = team.teamTricode ?? "NBA";

  return {
    id: team.teamId ?? 0,
    city: team.teamCity ?? "",
    name: team.teamName ?? "A definir",
    abbreviation,
    seed: team.seed,
    score: team.score ?? 0,
    color: TEAM_COLORS[abbreviation] ?? "#1d428a"
  };
}

function translateStage(stage: string) {
  return stage
    .replace("SoFi Play-In Tournament", "Play-In")
    .replace("Eastern Conference", "Conferencia Leste")
    .replace("Western Conference", "Conferencia Oeste")
    .replace("East", "Leste")
    .replace("West", "Oeste");
}

function translateSeries(seriesText: string) {
  return seriesText
    .replace("Winner earns 8 seed", "Vencedor fica com a 8a vaga")
    .replace("Winner earns 7 seed", "Vencedor fica com a 7a vaga")
    .replace("Series tied", "Serie empatada")
    .replace("leads series", "lidera a serie");
}

function normalizeGame(game: NbaApiGame, gameDate: string): NbaGame {
  const stage = [game.gameLabel, game.gameSubLabel].filter(Boolean).join(" - ");
  const awayTeam = normalizeTeam(game.awayTeam);
  const homeTeam = normalizeTeam(game.homeTeam);

  return {
    id: game.gameId,
    date: gameDate,
    status: mapStatus(game.gameStatus),
    statusText: game.gameStatusText,
    timeBr: formatTimeBr(game.gameTimeUTC),
    stage: translateStage(stage || "NBA"),
    seriesText: translateSeries(game.seriesText),
    broadcastsBrazil: getBroadcastsBrazil(
      game.gameId,
      awayTeam.abbreviation,
      homeTeam.abbreviation
    ),
    period: game.period,
    clock: game.gameClock,
    homeTeam,
    awayTeam
  };
}

function normalizeScheduleGame(game: NbaScheduleGame, gameDate: string): NbaGame | null {
  const gameId = game.gameId;
  const gameTimeUTC = game.gameDateTimeUTC ?? game.gameTimeUTC;
  const homeTeam = normalizeScheduleTeam(game.homeTeam ?? {});
  const awayTeam = normalizeScheduleTeam(game.awayTeam ?? {});

  if (!gameId || !gameTimeUTC || !homeTeam.id || !awayTeam.id) {
    return null;
  }

  const stage = [game.gameLabel, game.gameSubLabel].filter(Boolean).join(" - ");

  return {
    id: gameId,
    date: parseScheduleDate(gameDate),
    status: mapStatus(game.gameStatus ?? 1),
    statusText: game.gameStatusText ?? "",
    timeBr: formatTimeBr(gameTimeUTC),
    stage: translateStage(stage || "NBA"),
    seriesText: translateSeries(game.seriesText ?? ""),
    broadcastsBrazil: getBroadcastsBrazil(
      gameId,
      awayTeam.abbreviation,
      homeTeam.abbreviation
    ),
    period: 0,
    clock: "",
    homeTeam,
    awayTeam
  };
}

export function getTeamLogo(teamId: number) {
  return `https://cdn.nba.com/logos/nba/${teamId}/primary/L/logo.svg`;
}

export async function getTodayGames(): Promise<NbaGame[]> {
  try {
    const response = await fetch(SCOREBOARD_URL, {
      cache: "no-store",
      next: {
        revalidate: 0
      }
    });

    if (!response.ok) {
      return FALLBACK_TODAY_GAMES;
    }

    const data = (await response.json()) as NbaScoreboardResponse;

    return data.scoreboard.games.map((game) =>
      normalizeGame(game, data.scoreboard.gameDate)
    );
  } catch {
    return FALLBACK_TODAY_GAMES;
  }
}

export async function getScheduleGames(): Promise<NbaGame[]> {
  try {
    const response = await fetch(SCHEDULE_URL, {
      next: {
        revalidate: 60 * 60
      }
    });

    if (!response.ok) {
      return FALLBACK_GAME_WINDOW;
    }

    const data = (await response.json()) as NbaScheduleResponse;

    return data.leagueSchedule.gameDates
      .flatMap((date) =>
        date.games.map((game) => normalizeScheduleGame(game, date.gameDate))
      )
      .filter((game): game is NbaGame => Boolean(game))
      .sort((a, b) => `${a.date} ${a.timeBr}`.localeCompare(`${b.date} ${b.timeBr}`));
  } catch {
    return FALLBACK_GAME_WINDOW;
  }
}

export async function getDefaultGameWindow() {
  const games = await getScheduleGames();
  const now = new Date();

  const finished = games
    .filter(
      (game) =>
        game.status === "final" || new Date(`${game.date}T23:59:59`) < now
    )
    .slice(-6);

  const upcoming = games
    .filter(
      (game) =>
        game.status !== "final" && new Date(`${game.date}T23:59:59`) >= now
    )
    .slice(0, 4);

  return [...finished, ...upcoming].slice(0, 10);
}

export async function getScheduleTeams() {
  const games = await getScheduleGames();
  const teamMap = new Map<number, NbaTeam>();

  games.forEach((game) => {
    teamMap.set(game.awayTeam.id, game.awayTeam);
    teamMap.set(game.homeTeam.id, game.homeTeam);
  });

  return Array.from(teamMap.values())
    .filter((team) => team.id)
    .sort((a, b) => `${a.city} ${a.name}`.localeCompare(`${b.city} ${b.name}`));
}

export async function searchScheduleGames(filters: { teamId?: number; date?: string }) {
  const games = await getScheduleGames();

  return games
    .filter((game) => {
      const matchesTeam =
        !filters.teamId ||
        game.homeTeam.id === filters.teamId ||
        game.awayTeam.id === filters.teamId;
      const matchesDate = !filters.date || game.date === filters.date;

      return matchesTeam && matchesDate;
    })
    .slice(0, 40);
}
