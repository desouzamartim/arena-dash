import { HomeGameFeedItem } from "@/lib/home-feed";
import { LeagueBreakingNewsArticle } from "@/lib/news-api";
import Link from "next/link";

type HomeOverviewProps = {
  totalGamesToday: number;
  liveGamesNow: number;
  finishedGames: number;
  gameFeedItems: HomeGameFeedItem[];
  breakingNews: LeagueBreakingNewsArticle[];
};

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

export function HomeOverview({
  totalGamesToday,
  liveGamesNow,
  finishedGames,
  gameFeedItems,
  breakingNews
}: HomeOverviewProps) {
  return (
    <>
      <section className="homeIntro">
        <div>
          <span className="eyebrow">Inicio</span>
          <h1>ArenaDash</h1>
          <p>
            Um painel esportivo em tempo real para acompanhar jogos, transmissoes,
            estatisticas e conteudos relacionados.
          </p>
        </div>

        <div className="homeStats">
          <div>
            <span>{totalGamesToday}</span>
            <strong>Jogos monitorados hoje</strong>
          </div>
          <div>
            <span>{liveGamesNow}</span>
            <strong>Ao vivo agora</strong>
          </div>
          <div>
            <span>{finishedGames}</span>
            <strong>Encerrados hoje</strong>
          </div>
        </div>
      </section>

      <section className="sportsHub homeNowSection">
        <div className="sectionHeader">
          <div>
            <span className="eyebrow">Agora</span>
            <h2>O que esta rolando agora</h2>
          </div>
          <p>
            Fluxo compacto de jogos ordenado pelo horario de inicio para leitura rapida.
          </p>
        </div>

        {gameFeedItems.length > 0 ? (
          <div className="homeNowGrid">
            {gameFeedItems.map((game) => (
              <Link className="homeNowCard" href={game.href} key={game.id}>
                <div className="homeNowCardTop">
                  <span className={`homeNowLeagueTag is-${game.leagueSlug}`}>{game.leagueName}</span>
                  <span className={`homeNowStatus is-${game.status}`}>{game.statusLabel}</span>
                </div>

                <div className="homeNowMatchup">
                  <div>
                    <strong>{game.awayTeam}</strong>
                    <small>Visitante</small>
                  </div>
                  <div className="homeNowScore">
                    {game.status === "scheduled" ? (
                      <span>{game.startLabel}</span>
                    ) : (
                      <span>
                        {game.awayScore} - {game.homeScore}
                      </span>
                    )}
                  </div>
                  <div>
                    <strong>{game.homeTeam}</strong>
                    <small>Casa</small>
                  </div>
                </div>

                <div className="homeNowMeta">
                  <span>{game.stage}</span>
                  <span>{game.startLabel}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="emptyResults">Nenhum jogo disponivel no momento.</div>
        )}
      </section>

      <section className="sportsHub homeBreakingSection">
        <div className="sectionHeader">
          <div>
            <span className="eyebrow">Ultima hora</span>
            <h2>Noticias das ligas</h2>
          </div>
          <p>Manchetes curtas com prioridade para pt-BR nas ligas acompanhadas no Arena Dash.</p>
        </div>

        {breakingNews.length > 0 ? (
          <div className="homeBreakingList">
            {breakingNews.map((article) => (
              <a
                className="homeBreakingItem"
                href={article.url}
                key={article.url}
                target="_blank"
                rel="noreferrer"
              >
                <span className={`homeNowLeagueTag is-${article.leagueSlug}`}>
                  {article.leagueName}
                </span>
                <strong>{article.title}</strong>
                <div>
                  <span>{article.source}</span>
                  <span>{formatNewsDate(article.publishedAt)}</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="emptyResults">Nenhuma manchete disponivel no momento.</div>
        )}
      </section>
    </>
  );
}
