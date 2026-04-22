import { SiteHeader } from "@/components/site-header";
import { GameNewsArticle, getGameNews } from "@/lib/news-api";
import { getGameHighlightVideo, YouTubeHighlightVideo } from "@/lib/youtube-api";
import {
  getGameById,
  getGameStatsById,
  getTeamLogo,
  getTodayGames,
  NbaGame,
  NbaGameStats,
  NbaTeam
} from "@/lib/nba-api";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

type GamePageProps = {
  params: Promise<{
    gameId: string;
  }>;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${date}T00:00:00Z`));
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
    return "Finalizado";
  }

  return `${game.timeBr} BRT`;
}

function formatPercentage(value: number) {
  const percentage = value <= 1 ? value * 100 : value;

  return `${percentage.toFixed(percentage % 1 === 0 ? 0 : 1)}%`;
}

function TeamPanel({ team, align = "left" }: { team: NbaTeam; align?: "left" | "right" }) {
  return (
    <div className={`gameDetailTeam gameDetailTeam-${align}`}>
      <div
        className="gameDetailLogo"
        style={{ "--team-color": team.color } as CSSProperties}
      >
        <Image
          src={getTeamLogo(team.id)}
          alt={`Logo ${team.city} ${team.name}`}
          width={86}
          height={86}
          priority
        />
      </div>
      <div>
        <span>{team.city}</span>
        <strong>{team.name}</strong>
        <small>{team.abbreviation}</small>
      </div>
    </div>
  );
}

function GameScore({ game }: { game: NbaGame }) {
  if (game.status === "scheduled") {
    return (
      <div className="gameDetailScore">
        <strong>vs</strong>
        <span>{game.timeBr} BRT</span>
      </div>
    );
  }

  const awayWon = game.awayTeam.score > game.homeTeam.score;
  const homeWon = game.homeTeam.score > game.awayTeam.score;

  return (
    <div className="gameDetailScore">
      <strong>
        <span className={awayWon ? "winner" : ""}>{game.awayTeam.score}</span>
        <small>x</small>
        <span className={homeWon ? "winner" : ""}>{game.homeTeam.score}</span>
      </strong>
      <span>{getStatusLabel(game)}</span>
    </div>
  );
}

function StatCompare({
  label,
  awayValue,
  homeValue
}: {
  label: string;
  awayValue: string | number;
  homeValue: string | number;
}) {
  return (
    <div className="statCompare">
      <strong>{awayValue}</strong>
      <span>{label}</span>
      <strong>{homeValue}</strong>
    </div>
  );
}

function GameStatsPanel({
  game,
  stats
}: {
  game: NbaGame;
  stats: NbaGameStats;
}) {
  return (
    <section className="gameStatsPanel">
      <div className="gameStatsHeader">
        <div>
          <span className="eyebrow">Numeros</span>
          <h2>Estatisticas da partida</h2>
        </div>
        <div>
          <span>{game.awayTeam.abbreviation}</span>
          <span>{game.homeTeam.abbreviation}</span>
        </div>
      </div>

      <div className="statsList">
        <StatCompare
          label="Pontos"
          awayValue={stats.away.points}
          homeValue={stats.home.points}
        />
        <StatCompare
          label="Rebotes"
          awayValue={stats.away.rebounds}
          homeValue={stats.home.rebounds}
        />
        <StatCompare
          label="Assistencias"
          awayValue={stats.away.assists}
          homeValue={stats.home.assists}
        />
        <StatCompare
          label="Roubos"
          awayValue={stats.away.steals}
          homeValue={stats.home.steals}
        />
        <StatCompare
          label="Tocos"
          awayValue={stats.away.blocks}
          homeValue={stats.home.blocks}
        />
        <StatCompare
          label="Erros"
          awayValue={stats.away.turnovers}
          homeValue={stats.home.turnovers}
        />
        <StatCompare
          label="Aproveit. FG"
          awayValue={formatPercentage(stats.away.fieldGoalPercentage)}
          homeValue={formatPercentage(stats.home.fieldGoalPercentage)}
        />
        <StatCompare
          label="Aproveit. 3PT"
          awayValue={formatPercentage(stats.away.threePointPercentage)}
          homeValue={formatPercentage(stats.home.threePointPercentage)}
        />
      </div>
    </section>
  );
}

function formatNewsDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Agora";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(parsedDate);
}

function GameNewsPanel({ articles }: { articles: GameNewsArticle[] }) {
  return (
    <section className="gameNewsPanel">
      <div className="gameNewsHeader">
        <div>
          <span className="eyebrow">Noticias</span>
          <h2>Ao redor do jogo</h2>
        </div>
        <p>Materias relacionadas ao confronto, coletadas automaticamente.</p>
      </div>

      {articles.length > 0 ? (
        <div className="gameNewsGrid">
          {articles.map((article) => (
            <a
              className="newsCard"
              href={article.url}
              key={article.url}
              target="_blank"
              rel="noreferrer"
            >
              {article.imageUrl ? (
                <img src={article.imageUrl} alt="" loading="lazy" />
              ) : null}
              <span>{article.source}</span>
              <strong>{article.title}</strong>
              {article.description ? <p>{article.description}</p> : null}
              <small>{formatNewsDate(article.publishedAt)}</small>
            </a>
          ))}
        </div>
      ) : (
        <div className="emptyNews">
          Nenhuma noticia relacionada encontrada por enquanto.
        </div>
      )}
    </section>
  );
}

function HighlightPanel({
  video
}: {
  video: YouTubeHighlightVideo | null;
}) {
  return (
    <div className="highlightPanel">
      <div>
        <span className="eyebrow">Highlights</span>
        <h2>Video da partida</h2>
      </div>

      <div className="highlightFrame">
        {video ? (
          <iframe
            src={`https://www.youtube.com/embed/${video.videoId}`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div>
            <strong>Highlights ainda indisponiveis</strong>
            <span>
              Quando o video oficial da NBA estiver disponivel, ele sera exibido aqui.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { gameId } = await params;
  const game = await getGameById(gameId);

  if (!game) {
    return {
      title: "Jogo nao encontrado"
    };
  }

  return {
    title: `${game.awayTeam.abbreviation} x ${game.homeTeam.abbreviation}`,
    description: `Detalhes de ${game.awayTeam.city} ${game.awayTeam.name} contra ${game.homeTeam.city} ${game.homeTeam.name}.`
  };
}

export default async function GamePage({ params }: GamePageProps) {
  const { gameId } = await params;
  const [game, todayGames, stats] = await Promise.all([
    getGameById(gameId),
    getTodayGames(),
    getGameStatsById(gameId)
  ]);

  if (!game) {
    notFound();
  }

  const broadcasts =
    game.broadcastsBrazil.length > 0
      ? game.broadcastsBrazil.join(" + ")
      : "NBA League Pass";
  const [news, highlightVideo] = await Promise.all([
    getGameNews(game),
    getGameHighlightVideo(game)
  ]);

  return (
    <main className="gameDetailShell">
      <SiteHeader games={todayGames} />
      <div className="layoutWithAds">
        <aside className="adRail adRailLeft" aria-label="Publicidade lateral esquerda">
          <div className="adSlot">
            <span>Ad</span>
          </div>
        </aside>

        <div className="gameDetailContainer">
          <div className="gameDetailTopbar">
            <Link className="backLink" href="/">
              <span aria-hidden="true">&lt;</span>
              Painel
            </Link>
          </div>

          <section className="gameDetailHero">
            <div className="gameDetailHeader">
              <div>
                <span className={`status ${game.status}`}>{getStatusLabel(game)}</span>
                <h1>
                  {game.awayTeam.abbreviation} x {game.homeTeam.abbreviation}
                </h1>
              </div>
              <p>{game.stage}</p>
            </div>

            <div className="gameDetailMatchup">
              <TeamPanel team={game.awayTeam} />
              <GameScore game={game} />
              <TeamPanel team={game.homeTeam} align="right" />
            </div>
          </section>

          {stats && game.status !== "scheduled" ? (
            <GameStatsPanel game={game} stats={stats} />
          ) : null}

          <div className="adBanner adBannerMiddle" aria-label="Publicidade central">
            <span>Ad</span>
          </div>

          <section className="gameDetailGrid">
            <div className="gameInfoPanel">
              <span className="eyebrow">Detalhes</span>
              <dl>
                <div>
                  <dt>Data</dt>
                  <dd>{formatDate(game.date)}</dd>
                </div>
                <div>
                  <dt>Horario</dt>
                  <dd>{game.timeBr} BRT</dd>
                </div>
                <div>
                  <dt>Transmissao</dt>
                  <dd>{broadcasts}</dd>
                </div>
                {game.seriesText ? (
                  <div>
                    <dt>Serie</dt>
                    <dd>{game.seriesText}</dd>
                  </div>
                ) : null}
              </dl>
            </div>

            <HighlightPanel video={highlightVideo} />
          </section>

          <GameNewsPanel articles={news} />

          <div className="adBanner adBannerBottom" aria-label="Publicidade inferior">
            <span>Ad</span>
          </div>
        </div>

        <aside className="adRail adRailRight" aria-label="Publicidade lateral direita">
          <div className="adSlot">
            <span>Ad</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
