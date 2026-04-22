"use client";

import { getTeamLogo, NbaGame, NbaTeam } from "@/lib/nba-api";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

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

function CompactGameCard({ game }: { game: NbaGame }) {
  const hasScore = game.status === "final";
  const broadcasts =
    game.broadcastsBrazil.length > 0
      ? game.broadcastsBrazil.join(" + ")
      : "NBA League Pass";

  return (
    <Link className="compactGameCard gameCardLink" href={`/jogos/${game.id}`}>
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
    </Link>
  );
}

function CompactGameSkeleton() {
  return (
    <article className="compactGameCard compactGameSkeleton" aria-hidden="true">
      <div className="skeletonLine short" />
      <div className="skeletonMatch">
        <div className="skeletonLogo" />
        <div className="skeletonLine medium" />
        <div className="skeletonLine tiny" />
        <div className="skeletonLine medium" />
        <div className="skeletonLogo" />
      </div>
      <div className="skeletonLine long" />
    </article>
  );
}

export function AdvancedGamesFilter({ initialGames, teams }: AdvancedGamesFilterProps) {
  const [games, setGames] = useState(initialGames);
  const [teamId, setTeamId] = useState("");
  const [date, setDate] = useState("");
  const [broadcastScope, setBroadcastScope] = useState<"all" | "br">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [hasActiveFilter, setHasActiveFilter] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    const params = new URLSearchParams();

    if (teamId) {
      params.set("teamId", teamId);
    }

    if (date) {
      params.set("date", date);
    }

    if (broadcastScope === "br") {
      params.set("broadcastScope", "br");
    }

    const filtered = Boolean(teamId || date || broadcastScope === "br");
    const timeoutId = window.setTimeout(() => {
      fetchGames(params, filtered);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [teamId, date, broadcastScope]);

  function handleClear() {
    setTeamId("");
    setDate("");
    setBroadcastScope("all");
    fetchGames(new URLSearchParams(), false);
  }

  function openDatePicker() {
    const input = dateInputRef.current;

    if (!input) {
      return;
    }

    try {
      input.showPicker?.();
    } catch {
      // Fallback para navegadores que bloqueiam showPicker.
    }

    input.focus();
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

      <div className="filterBar">
        <label className="filterField">
          <span>Time</span>
          <select value={teamId} onChange={(event) => setTeamId(event.target.value)}>
            <option value="">Todos os times</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.city} {team.name} ({team.abbreviation})
              </option>
            ))}
          </select>
        </label>

        <label className="filterField">
          <span>Data</span>
          <div
            className="dateInputWrap"
            onClick={openDatePicker}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openDatePicker();
              }
            }}
            role="button"
            tabIndex={0}
          >
            <input
              ref={dateInputRef}
              type="date"
              className={date ? "" : "is-empty"}
              aria-label="Escolha uma data"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
            {!date ? <small>Escolha uma data</small> : null}
          </div>
        </label>

        <fieldset className="broadcastToggle">
          <legend>Onde assistir</legend>
          <div>
            <label>
              <input
                type="radio"
                name="broadcastScope"
                value="all"
                checked={broadcastScope === "all"}
                onChange={() => setBroadcastScope("all")}
              />
              <span>Todas</span>
            </label>
            <label>
              <input
                type="radio"
                name="broadcastScope"
                value="br"
                checked={broadcastScope === "br"}
                onChange={() => setBroadcastScope("br")}
              />
              <span>BR</span>
            </label>
          </div>
        </fieldset>

        <div className="filterActions">
          <button type="button" onClick={handleClear} disabled={isLoading}>
            Limpar filtros
          </button>
        </div>
      </div>

      <div className="resultsHeader">
        <span>{resultLabel}</span>
      </div>

      {isLoading ? (
        <div className="compactGamesGrid">
          {Array.from({ length: 4 }).map((_, index) => (
            <CompactGameSkeleton key={index} />
          ))}
        </div>
      ) : games.length > 0 ? (
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
