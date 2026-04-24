import {
  formatGameDateLong,
  getGameStatusLabel
} from "@/lib/nba-game-format";
import { GameNewsArticle } from "@/lib/news-api";
import { NbaGame, NbaGameStats, NbaTeam, getTeamLogo } from "@/lib/nba-api";
import { YouTubeHighlightVideo } from "@/lib/youtube-api";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { AdBanner, PageWithAds } from "@/components/layout/page-with-ads";
import { SiteHeader } from "@/components/site-header";

type GameDetailViewProps = {
  game: NbaGame;
  todayGames: NbaGame[];
  stats: NbaGameStats | null;
  news: GameNewsArticle[];
  highlightVideo: YouTubeHighlightVideo | null;
  broadcasts: string;
};

function formatPercentage(value: number) {
  const percentage = value <= 1 ? value * 100 : value;

  return `${percentage.toFixed(percentage % 1 === 0 ? 0 : 1)}%`;
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
      <span>{getGameStatusLabel(game)}</span>
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
        <StatCompare label="Pontos" awayValue={stats.away.points} homeValue={stats.home.points} />
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
        <StatCompare label="Roubos" awayValue={stats.away.steals} homeValue={stats.home.steals} />
        <StatCompare label="Tocos" awayValue={stats.away.blocks} homeValue={stats.home.blocks} />
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
                // News providers vary by domain, so this stays as a plain img.
                // eslint-disable-next-line @next/next/no-img-element
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

export function GameDetailView({
  game,
  todayGames,
  stats,
  news,
  highlightVideo,
  broadcasts
}: GameDetailViewProps) {
  return (
    <main className="gameDetailShell">
      <SiteHeader games={todayGames} />
      <PageWithAds mainColumnClassName="gameDetailContainer">
        <div className="gameDetailTopbar">
          <Link className="backLink" href="/nba">
            <span aria-hidden="true">&lt;</span>
            NBA
          </Link>
        </div>

        <section className="gameDetailHero">
          <div className="gameDetailHeader">
            <div>
              <span className={`status ${game.status}`}>{getGameStatusLabel(game)}</span>
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

        <AdBanner className="adBanner adBannerMiddle" ariaLabel="Publicidade central" />

        <section className="gameDetailGrid">
          <div className="gameInfoPanel">
            <span className="eyebrow">Detalhes</span>
            <dl>
              <div>
                <dt>Data</dt>
                <dd>{formatGameDateLong(game.date)}</dd>
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

        <AdBanner className="adBanner adBannerBottom" ariaLabel="Publicidade inferior" />
      </PageWithAds>
    </main>
  );
}
