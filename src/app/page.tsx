import { AdvancedGamesFilter } from "@/components/advanced-games-filter";
import {
  getDefaultGameWindow,
  getScheduleTeams,
  getTeamLogo,
  getTodayGames,
  NbaGame,
  NbaTeam
} from "@/lib/nba-api";
import Image from "next/image";

export const dynamic = "force-dynamic";

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

function TeamBlock({ team, align = "left" }: { team: NbaTeam; align?: "left" | "right" }) {
  return (
    <div className={`gameTeam team-${align}`}>
      <TeamLogo team={team} />
      <div>
        <span className="teamCity">{team.city}</span>
        <strong>{team.name}</strong>
        {team.seed ? <small>Classif. {team.seed}</small> : null}
      </div>
    </div>
  );
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
              <Image
                src={getTeamLogo(game.awayTeam.id)}
                alt=""
                width={26}
                height={26}
              />
              <span>{game.awayTeam.abbreviation}</span>
              <strong>
                {game.status === "scheduled"
                  ? game.timeBr
                  : `${game.awayTeam.score}-${game.homeTeam.score}`}
              </strong>
              <span>{game.homeTeam.abbreviation}</span>
              <Image
                src={getTeamLogo(game.homeTeam.id)}
                alt=""
                width={26}
                height={26}
              />
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

function FeaturedGame({ game }: { game: NbaGame }) {
  const broadcasts =
    game.broadcastsBrazil.length > 0
      ? game.broadcastsBrazil.join(" + ")
      : "Transmissao BR a confirmar";

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
      <div className="broadcastLine">
        <span>Transmissao</span>
        <strong>{broadcasts}</strong>
      </div>
      {game.seriesText ? <p className="note">{game.seriesText}</p> : null}
    </article>
  );
}

function TodayHighlights({ games }: { games: NbaGame[] }) {
  return (
    <section className="todayHighlights">
      <div className="sectionHeader">
        <div>
          <span className="eyebrow">Hoje</span>
          <h2>Jogos em destaque</h2>
        </div>
        <p>Dados da NBA CDN gratuita, com horario de Brasilia, placar ao vivo e transmissao no Brasil cruzada por jogo.</p>
      </div>
      <div className="featuredCarousel">
        {games.map((game) => (
          <FeaturedGame key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}

export default async function Home() {
  const [todayGames, defaultGames, teams] = await Promise.all([
    getTodayGames(),
    getDefaultGameWindow(),
    getScheduleTeams()
  ]);

  return (
    <main className="pageShell">
      <Ticker games={todayGames} />

      <div className="contentContainer">
        <TodayHighlights games={todayGames} />
        <AdvancedGamesFilter initialGames={defaultGames} teams={teams} />
      </div>
    </main>
  );
}
