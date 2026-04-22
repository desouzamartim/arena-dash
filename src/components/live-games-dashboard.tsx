"use client";

import { WinProbability } from "@/lib/odds-api";
import { getTeamLogo, NbaGame, NbaTeam } from "@/lib/nba-api";
import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";

const REFRESH_INTERVAL_MS = 90_000;

function TeamLogo({ team, size = 56 }: { team: NbaTeam; size?: number }) {
  return (
    <div
      className="teamLogo"
      style={{ "--team-color": team.color } as React.CSSProperties}
      title={`${team.city} ${team.name}`}
    >
      <Image
        src={getTeamLogo(team.id)}
        alt={`Logo ${team.city} ${team.name}`}
        width={size}
        height={size}
      />
    </div>
  );
}

function TeamBlock({
  team,
  align = "left"
}: {
  team: NbaTeam;
  align?: "left" | "right";
}) {
  return (
    <div className={`gameTeam team-${align}`}>
      <TeamLogo team={team} />
      <div>
        <strong>{team.abbreviation}</strong>
        <span className="teamCity">{team.city}</span>
        <span className="teamName">{team.name}</span>
        {team.seed ? <small>Classif. {team.seed}</small> : null}
      </div>
    </div>
  );
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

function getStatusLabel(game: NbaGame) {
  if (game.status === "live") {
    return formatLiveClock(game.period, game.clock);
  }

  if (game.status === "final") {
    return "Final";
  }

  return `${game.timeBr} BRT`;
}

function getGameDetailLabel(game: NbaGame) {
  if (game.status === "scheduled") {
    return `Horario: ${game.timeBr} BRT`;
  }

  if (game.status === "live") {
    return formatLiveClock(game.period, game.clock);
  }

  return "Partida encerrada";
}

function ScoreBlock({ game }: { game: NbaGame }) {
  if (game.status === "scheduled") {
    return <div className="versus">vs</div>;
  }

  const awayWon = game.awayTeam.score > game.homeTeam.score;
  const homeWon = game.homeTeam.score > game.awayTeam.score;

  return (
    <div className="score">
      <span className={awayWon ? "winner" : ""}>{game.awayTeam.score}</span>
      <small>x</small>
      <span className={homeWon ? "winner" : ""}>{game.homeTeam.score}</span>
    </div>
  );
}

function WinProbabilityBar({
  game,
  prediction
}: {
  game: NbaGame;
  prediction: WinProbability;
}) {
  return (
    <div
      className="winProbability"
      style={
        {
          "--away-color": game.awayTeam.color,
          "--home-color": game.homeTeam.color,
          "--away-width": `${prediction.away}%`,
          "--home-width": `${prediction.home}%`
        } as React.CSSProperties
      }
    >
      <div className="winProbabilityTop">
        <span>Chance de vitoria</span>
        <strong>{prediction.source === "odds" ? "Odds" : "Estimativa"}</strong>
      </div>
      <div className="winBar" aria-label="Probabilidade de vitoria por time">
        <div className="winBarSide awaySide">
          <span>{game.awayTeam.abbreviation}</span>
          <strong>{prediction.away}%</strong>
        </div>
        <div className="winBarSide homeSide">
          <strong>{prediction.home}%</strong>
          <span>{game.homeTeam.abbreviation}</span>
        </div>
      </div>
    </div>
  );
}

function Ticker({ games }: { games: NbaGame[] }) {
  const liveGames = games.filter((game) => game.status === "live");
  const tickerGames = liveGames.length > 0 ? liveGames : games;
  const items = tickerGames.length > 0 ? [...tickerGames, ...tickerGames] : [];

  return (
    <section className="liveTicker" aria-label="Jogos acontecendo agora">
      <div className="tickerLabel">
        <span className={liveGames.length > 0 ? "liveDot isLive" : "liveDot"} />
        <strong>{liveGames.length > 0 ? "Ao vivo" : "Sem jogos ao vivo agora"}</strong>
      </div>
      <div className="tickerTrackWrap">
        <div className="tickerTrack">
          {items.map((game, index) => (
            <div className="tickerItem" key={`${game.id}-${index}`}>
              <Image src={getTeamLogo(game.awayTeam.id)} alt="" width={26} height={26} />
              <span>{game.awayTeam.abbreviation}</span>
              <strong>
                {game.status === "scheduled"
                  ? game.timeBr
                  : `${game.awayTeam.score}-${game.homeTeam.score}`}
              </strong>
              <span>{game.homeTeam.abbreviation}</span>
              <Image src={getTeamLogo(game.homeTeam.id)} alt="" width={26} height={26} />
              {game.broadcastsBrazil.length > 0 ? (
                <em>{game.broadcastsBrazil.join(" + ")}</em>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SportNav() {
  return (
    <nav className="sportNav" aria-label="Navegacao de esportes">
      <div className="sportNavInner">
        <strong>ArenaDash</strong>
        <div>
          <a aria-disabled="true">NBA</a>
          <a aria-disabled="true">NFL</a>
          <a aria-disabled="true">NHL</a>
          <a aria-disabled="true">MLB</a>
        </div>
      </div>
    </nav>
  );
}

function FeaturedGame({
  game,
  prediction
}: {
  game: NbaGame;
  prediction: WinProbability;
}) {
  const broadcasts =
    game.broadcastsBrazil.length > 0
      ? game.broadcastsBrazil.join(" + ")
      : "NBA League Pass";

  return (
    <article className="featuredGame">
      <div className="featuredTop">
        <span className={`status ${game.status}`}>{getStatusLabel(game)}</span>
        <span>{game.stage}</span>
      </div>
      <div className="matchup">
        <TeamBlock team={game.awayTeam} />
        <div className="scoreColumn">
          <ScoreBlock game={game} />
          <span className="time">{getGameDetailLabel(game)}</span>
        </div>
        <TeamBlock team={game.homeTeam} align="right" />
      </div>
      <WinProbabilityBar game={game} prediction={prediction} />
      <div className="featuredMeta">
        <span>{broadcasts}</span>
        {game.seriesText ? <span>{game.seriesText}</span> : null}
      </div>
    </article>
  );
}

function TodayHighlights({
  games,
  predictions
}: {
  games: NbaGame[];
  predictions: Record<string, WinProbability>;
}) {
  return (
    <section className="todayHighlights">
      <div className="sectionHeader">
        <div>
          <span className="eyebrow">Hoje</span>
          <h2>Jogos em destaque</h2>
        </div>
        <p>
          Dados da NBA CDN gratuita, com horario de Brasilia, placar ao vivo e
          transmissao no Brasil cruzada por jogo.
        </p>
      </div>
      <div className="featuredCarousel">
        {games.map((game) => {
          const prediction =
            predictions[game.id] ??
            ({
              away: 50,
              home: 50,
              source: "estimativa"
            } satisfies WinProbability);

          return <FeaturedGame key={game.id} game={game} prediction={prediction} />;
        })}
      </div>
    </section>
  );
}

export function LiveGamesDashboard({
  initialGames,
  predictions,
  children
}: {
  initialGames: NbaGame[];
  predictions: Record<string, WinProbability>;
  children: ReactNode;
}) {
  const [games, setGames] = useState(initialGames);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function refreshGames() {
      try {
        setIsRefreshing(true);
        const response = await fetch("/api/today-games", {
          cache: "no-store"
        });
        const data = (await response.json()) as { games: NbaGame[] };

        if (isMounted) {
          setGames(data.games);
        }
      } catch {
        // Mantem o ultimo estado valido.
      } finally {
        if (isMounted) {
          setIsRefreshing(false);
        }
      }
    }

    const intervalId = window.setInterval(refreshGames, REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <>
      <Ticker games={games} />
      <SportNav />
      <div className="contentContainer">
        {isRefreshing ? <div className="refreshSkeleton" aria-hidden="true" /> : null}
        <TodayHighlights games={games} predictions={predictions} />
        {children}
      </div>
    </>
  );
}
