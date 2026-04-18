"use client";

import { getTeamLogo, NbaGame, NbaTeam } from "@/lib/nba-api";
import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";

type AdvancedGamesFilterProps = {
  initialGames: NbaGame[];
  teams: NbaTeam[];
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC"
  }).format(new Date(`${date}T00:00:00Z`));
}

function getGameStatus(game: NbaGame) {
  if (game.status === "final") {
    return "Finalizado";
  }

  if (game.status === "live") {
    return formatLiveClock(game.period, game.clock);
  }

  return `${game.timeBr} BRT`;
}

function formatLiveClock(period: number, clock: string) {
  const periodLabel = period > 0 ? `${period}º quarto` : "Ao vivo";
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

function CompactGameCard({ game }: { game: NbaGame }) {
  const hasScore = game.status !== "scheduled";
  const broadcasts =
    game.broadcastsBrazil.length > 0
      ? game.broadcastsBrazil.join(" + ")
      : "Transmissao a confirmar";

  return (
    <article className="compactGameCard">
      <div className="compactGameTop">
        <span className={`compactStatus ${game.status}`}>{getGameStatus(game)}</span>
        <span>{formatDate(game.date)}</span>
      </div>

      <div className="compactMatch">
        <div className="compactTeam">
          <Image
            src={getTeamLogo(game.awayTeam.id)}
            alt={`Logo ${game.awayTeam.city} ${game.awayTeam.name}`}
            width={34}
            height={34}
          />
          <strong>{game.awayTeam.abbreviation}</strong>
          {hasScore ? <span>{game.awayTeam.score}</span> : null}
        </div>

        <div className="compactDivider">x</div>

        <div className="compactTeam compactTeamRight">
          {hasScore ? <span>{game.homeTeam.score}</span> : null}
          <strong>{game.homeTeam.abbreviation}</strong>
          <Image
            src={getTeamLogo(game.homeTeam.id)}
            alt={`Logo ${game.homeTeam.city} ${game.homeTeam.name}`}
            width={34}
            height={34}
          />
        </div>
      </div>

      <div className="compactMeta">
        <span>{game.stage}</span>
        <strong>{broadcasts}</strong>
      </div>
    </article>
  );
}

export function AdvancedGamesFilter({ initialGames, teams }: AdvancedGamesFilterProps) {
  const [games, setGames] = useState(initialGames);
  const [teamId, setTeamId] = useState("");
  const [date, setDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasActiveFilter, setHasActiveFilter] = useState(false);

  const resultLabel = useMemo(() => {
    if (hasActiveFilter) {
      return `${games.length} jogo${games.length === 1 ? "" : "s"} encontrado${
        games.length === 1 ? "" : "s"
      }`;
    }

    return "Padrao: 6 finalizados e 4 proximos";
  }, [games.length, hasActiveFilter]);

  async function fetchGames(params: URLSearchParams, filtered: boolean) {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/games?${params.toString()}`);
      const data = (await response.json()) as { games: NbaGame[] };

      setGames(data.games);
      setHasActiveFilter(filtered);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (teamId) {
      params.set("teamId", teamId);
    }

    if (date) {
      params.set("date", date);
    }

    fetchGames(params, Boolean(teamId || date));
  }

  function handleClear() {
    setTeamId("");
    setDate("");
    fetchGames(new URLSearchParams(), false);
  }

  return (
    <section className="advancedGames">
      <div className="sectionHeader">
        <div>
          <span className="eyebrow">Busca</span>
          <h2>Filtro avancado</h2>
        </div>
        <p>
          Busque jogos por time e data. Ao limpar, a lista volta para o padrao
          com 10 partidas: 6 finalizadas e os proximos 4 jogos.
        </p>
      </div>

      <form className="filterBar" onSubmit={handleSubmit}>
        <label>
          <span>Time</span>
          <select value={teamId} onChange={(event) => setTeamId(event.target.value)}>
            <option value="">Todos os times</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.city} {team.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Data</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>

        <div className="filterActions">
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Buscando..." : "Buscar"}
          </button>
          <button type="button" onClick={handleClear} disabled={isLoading}>
            Limpar filtros
          </button>
        </div>
      </form>

      <div className="resultsHeader">
        <span>{resultLabel}</span>
      </div>

      {games.length > 0 ? (
        <div className="compactGamesGrid">
          {games.map((game) => (
            <CompactGameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="emptyResults">
          Nenhum jogo encontrado para os filtros selecionados.
        </div>
      )}
    </section>
  );
}
