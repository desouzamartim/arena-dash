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
              <Link className={`homeNowCard is-${game.leagueSlug}`} href={game.href} key={game.id}>
                <div className="homeNowCardTop">
                  <span className={`homeNowLeagueTag is-${game.leagueSlug}`}>{game.leagueName}</span>
                  <span className={`homeNowStatus is-${game.status}`}>{game.statusLabel}</span>
                </div>

                <div className="homeNowMatchup">
                  <div className="homeNowTeam">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="homeNowTeamLogo" src={game.awayTeamLogo} alt={game.awayTeam} width={26} height={26} />
                    <strong>{game.awayTeam}</strong>
                  </div>
                  <div className="homeNowScore">
                    <span>
                      {game.status === "scheduled" ? game.startLabel : `${game.awayScore}–${game.homeScore}`}
                    </span>
                  </div>
                  <div className="homeNowTeam homeNowTeamHome">
                    <strong>{game.homeTeam}</strong>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="homeNowTeamLogo" src={game.homeTeamLogo} alt={game.homeTeam} width={26} height={26} />
                  </div>
                </div>

                <div className="homeNowBroadcast">
                  <span>{game.broadcasts.length > 0 ? game.broadcasts.join(" · ") : "NBA League Pass"}</span>
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
