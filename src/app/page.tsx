import { AdBanner, PageWithAds } from "@/components/layout/page-with-ads";
import { SiteHeader } from "@/components/site-header";
import { leagues } from "@/lib/leagues";
import { getTodayGames } from "@/lib/nba-api";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const todayGames = await getTodayGames();
  const liveGames = todayGames.filter((game) => game.status === "live").length;
  const finishedGames = todayGames.filter((game) => game.status === "final").length;

  return (
    <main className="pageShell">
      <SiteHeader games={todayGames} />
      <PageWithAds>
          <section className="homeIntro">
            <div>
              <span className="eyebrow">Inicio</span>
              <h1>ArenaDash</h1>
              <p>
                Um painel esportivo em tempo real para acompanhar jogos,
                transmissoes, estatisticas e conteudos relacionados.
              </p>
            </div>

            <div className="homeStats">
              <div>
                <span>{todayGames.length}</span>
                <strong>Jogos NBA hoje</strong>
              </div>
              <div>
                <span>{liveGames}</span>
                <strong>Ao vivo agora</strong>
              </div>
              <div>
                <span>{finishedGames}</span>
                <strong>Finalizados</strong>
              </div>
            </div>
          </section>

          <section className="sportsHub">
            <div className="sectionHeader">
              <div>
                <span className="eyebrow">Esportes</span>
                <h2>Escolha uma liga</h2>
              </div>
              <p>
                A NBA ja esta ativa. As proximas ligas ficam reservadas para a
                expansao do ArenaDash.
              </p>
            </div>

            <div className="sportsHubGrid">
              {leagues.map((league) => (
                <Link className="sportHubCard" href={`/${league.slug}`} key={league.slug}>
                  <span>{league.status}</span>
                  <strong>{league.name}</strong>
                  <p>{league.description}</p>
                </Link>
              ))}
            </div>
          </section>

          <AdBanner className="adBanner adBannerBottom" ariaLabel="Publicidade inferior" />
      </PageWithAds>
    </main>
  );
}
