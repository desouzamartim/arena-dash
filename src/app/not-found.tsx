import { AdBanner, PageWithAds } from "@/components/layout/page-with-ads";
import { SiteHeader } from "@/components/site-header";
import { leagues } from "@/lib/leagues";
import { getTodayGames } from "@/lib/nba-api";
import Link from "next/link";

const quickLinks = [
  {
    href: "/",
    label: "Inicio",
    description: "Volte para a visao geral com acessos para todas as ligas.",
    status: "Principal"
  },
  {
    href: "/nba",
    label: "NBA",
    description: "Abra a cobertura ativa com jogos, filtros e detalhes da rodada.",
    status: "Disponivel"
  }
];

export default async function NotFound() {
  const todayGames = await getTodayGames();

  return (
    <main className="pageShell">
      <SiteHeader games={todayGames} />
      <PageWithAds>
        <section className="notFoundHero">
          <div className="notFoundCopy">
            <span className="eyebrow">Erro de rota</span>
            <div className="notFoundCode">404</div>
            <h1>Pagina nao encontrada</h1>
            <p className="notFoundLead">
              O caminho que voce tentou abrir nao existe ou saiu de jogo. Use um dos
              atalhos abaixo para voltar ao fluxo do Arena Dash.
            </p>
          </div>

          <div className="notFoundHighlights">
            <div>
              <span>{todayGames.length}</span>
              <strong>Jogos no painel de hoje</strong>
            </div>
            <div>
              <span>{leagues.length}</span>
              <strong>Ligas mapeadas no hub</strong>
            </div>
            <div>
              <span>Arena Dash</span>
              <strong>Volte para a navegacao principal</strong>
            </div>
          </div>
        </section>

        <section className="sportsHub">
          <div className="sectionHeader">
            <div>
              <span className="eyebrow">Recuperar rota</span>
              <h2>Escolha para onde seguir</h2>
            </div>
            <p>
              Os atalhos abaixo levam de volta para as areas mais uteis do produto sem
              mudar o comportamento atual das rotas.
            </p>
          </div>

          <div className="notFoundActionsGrid">
            {quickLinks.map((link) => (
              <Link className="sportHubCard notFoundCard" href={link.href} key={link.href}>
                <span>{link.status}</span>
                <strong>{link.label}</strong>
                <p>{link.description}</p>
              </Link>
            ))}

            {leagues.map((league) => (
              <Link className="sportHubCard notFoundCard" href={`/${league.slug}`} key={league.slug}>
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
