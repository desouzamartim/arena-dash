import { NbaGame, NbaTeam } from "@/lib/nba-api";

export type WinProbability = {
  away: number;
  home: number;
  source: "odds" | "estimativa";
};

type OddsOutcome = {
  name: string;
  price: number;
};

type OddsMarket = {
  key: string;
  outcomes: OddsOutcome[];
};

type OddsBookmaker = {
  key: string;
  title: string;
  markets: OddsMarket[];
};

type OddsEvent = {
  id: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsBookmaker[];
};

const ODDS_API_URL = "https://api.the-odds-api.com/v4/sports/basketball_nba/odds";

const TEAM_NAME_ALIASES: Record<string, string> = {
  LAC: "Los Angeles Clippers",
  LAL: "Los Angeles Lakers",
  NYK: "New York Knicks",
  GSW: "Golden State Warriors",
  SAS: "San Antonio Spurs",
  OKC: "Oklahoma City Thunder",
  PHX: "Phoenix Suns"
};

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getTeamName(team: NbaTeam) {
  return TEAM_NAME_ALIASES[team.abbreviation] ?? `${team.city} ${team.name}`;
}

function matchTeam(apiName: string, team: NbaTeam) {
  const normalizedApiName = normalizeName(apiName);
  const fullName = normalizeName(getTeamName(team));
  const nickname = normalizeName(team.name);

  return normalizedApiName === fullName || normalizedApiName.endsWith(nickname);
}

function decimalToRawProbability(price: number) {
  return price > 0 ? 1 / price : 0;
}

function roundProbability(value: number) {
  return Math.round(value * 100);
}

function getFallbackPrediction(game: NbaGame): WinProbability {
  const awaySeed = game.awayTeam.seed;
  const homeSeed = game.homeTeam.seed;

  if (!awaySeed || !homeSeed || awaySeed === homeSeed) {
    return {
      away: 50,
      home: 50,
      source: "estimativa"
    };
  }

  const seedGap = Math.min(Math.abs(awaySeed - homeSeed), 6);
  const favoriteProbability = Math.min(64, 52 + seedGap * 2);
  const awayIsFavorite = awaySeed < homeSeed;

  return {
    away: awayIsFavorite ? favoriteProbability : 100 - favoriteProbability,
    home: awayIsFavorite ? 100 - favoriteProbability : favoriteProbability,
    source: "estimativa"
  };
}

function findMatchingEvent(game: NbaGame, events: OddsEvent[]) {
  return events.find(
    (event) =>
      matchTeam(event.away_team, game.awayTeam) &&
      matchTeam(event.home_team, game.homeTeam)
  );
}

function getOddsPrediction(game: NbaGame, event: OddsEvent): WinProbability | null {
  const probabilities = event.bookmakers
    .map((bookmaker) => bookmaker.markets.find((market) => market.key === "h2h"))
    .filter((market): market is OddsMarket => Boolean(market))
    .map((market) => {
      const awayOutcome = market.outcomes.find((outcome) =>
        matchTeam(outcome.name, game.awayTeam)
      );
      const homeOutcome = market.outcomes.find((outcome) =>
        matchTeam(outcome.name, game.homeTeam)
      );

      if (!awayOutcome || !homeOutcome) {
        return null;
      }

      const rawAway = decimalToRawProbability(awayOutcome.price);
      const rawHome = decimalToRawProbability(homeOutcome.price);
      const total = rawAway + rawHome;

      if (!total) {
        return null;
      }

      return {
        away: rawAway / total,
        home: rawHome / total
      };
    })
    .filter((probability): probability is { away: number; home: number } =>
      Boolean(probability)
    );

  if (!probabilities.length) {
    return null;
  }

  const average = probabilities.reduce(
    (acc, probability) => ({
      away: acc.away + probability.away,
      home: acc.home + probability.home
    }),
    { away: 0, home: 0 }
  );

  const away = roundProbability(average.away / probabilities.length);
  const home = 100 - away;

  return {
    away,
    home,
    source: "odds"
  };
}

export async function getWinProbabilities(games: NbaGame[]) {
  const predictions = new Map<string, WinProbability>();
  const apiKey = process.env.ODDS_API_KEY;

  games.forEach((game) => {
    predictions.set(game.id, getFallbackPrediction(game));
  });

  if (!apiKey) {
    return predictions;
  }

  try {
    const params = new URLSearchParams({
      apiKey,
      regions: "us",
      markets: "h2h",
      oddsFormat: "decimal"
    });

    const response = await fetch(`${ODDS_API_URL}?${params.toString()}`, {
      next: {
        revalidate: 5 * 60
      }
    });

    if (!response.ok) {
      return predictions;
    }

    const events = (await response.json()) as OddsEvent[];

    games.forEach((game) => {
      const event = findMatchingEvent(game, events);
      const prediction = event ? getOddsPrediction(game, event) : null;

      if (prediction) {
        predictions.set(game.id, prediction);
      }
    });
  } catch {
    return predictions;
  }

  return predictions;
}
