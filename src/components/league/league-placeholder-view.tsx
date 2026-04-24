import { PageWithAds } from "@/components/layout/page-with-ads";
import { SiteHeader } from "@/components/site-header";
import { LeagueDefinition, leagues } from "@/lib/leagues";
import { NbaGame } from "@/lib/nba-api";
import Link from "next/link";

type LeaguePlaceholderViewProps = {
  league: LeagueDefinition;
  todayGames: NbaGame[];
};

export function LeaguePlaceholderView({
  league,
  todayGames
}: LeaguePlaceholderViewProps) {
  return (
    <main className="pageShell">
      <SiteHeader games={todayGames} />
      <PageWithAds>
        <section className="homeIntro">
          <div>
            <span className="eyebrow">Liga</span>
            <h1>{league.name}</h1>
            <p>{league.description}</p>
          </div>

          <div className="homeStats">
            <div>
              <span>{league.status}</span>
              <strong>Status</strong>
            </div>
            <div>
              <span>0</span>
              <strong>Jogos ativos</strong>
            </div>
            <div>
              <span>1</span>
              <strong>Pagina da liga</strong>
            </div>
          </div>
        </section>

        <section className="sportsHub">
          <div className="sectionHeader">
            <div>
              <span className="eyebrow">Navegacao</span>
              <h2>Outras ligas do ArenaDash</h2>
            </div>
            <p>
              Esta area ja segue o padrao final de rotas por liga. A cobertura
              detalhada desta liga chega numa proxima etapa.
            </p>
          </div>

          <div className="sportsHubGrid">
            {leagues.map((item) => (
              <Link className="sportHubCard" href={`/${item.slug}`} key={item.slug}>
                <span>{item.status}</span>
                <strong>{item.name}</strong>
                <p>{item.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </PageWithAds>
    </main>
  );
}
