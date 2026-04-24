"use client";

import { SiteHeader } from "@/components/site-header";
import {
  getBroadcastLabel,
  getGameDetailTimeLabel,
  getLiveDashboardStatusLabel
} from "@/lib/nba-game-format";
import { WinProbability } from "@/lib/odds-api";
import { getTeamLogo, NbaGame, NbaTeam } from "@/lib/nba-api";
import Image from "next/image";
import Link from "next/link";
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

function FeaturedGame({
  game,
  prediction
}: {
  game: NbaGame;
  prediction: WinProbability;
}) {
  const broadcasts = getBroadcastLabel(game.broadcastsBrazil);

  return (
    <Link className="featuredGame gameCardLink" href={`/nba-${game.id}`}>
      <div className="featuredTop">
        <span className={`status ${game.status}`}>{getLiveDashboardStatusLabel(game)}</span>
        <span>{game.stage}</span>
      </div>
      <div className="matchup">
        <TeamBlock team={game.awayTeam} />
        <div className="scoreColumn">
          <ScoreBlock game={game} />
          <span className="time">{getGameDetailTimeLabel(game)}</span>
        </div>
        <TeamBlock team={game.homeTeam} align="right" />
      </div>
      <WinProbabilityBar game={game} prediction={prediction} />
      <div className="featuredMeta">
        <span>{broadcasts}</span>
        {game.seriesText ? <span>{game.seriesText}</span> : null}
      </div>
    </Link>
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
      <SiteHeader games={games} />
      <div className="contentContainer">
        {isRefreshing ? <div className="refreshSkeleton" aria-hidden="true" /> : null}
        <TodayHighlights games={games} predictions={predictions} />
        {children}
      </div>
    </>
  );
}
