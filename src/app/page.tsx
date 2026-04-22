import { AdvancedGamesFilter } from "@/components/advanced-games-filter";
import { LiveGamesDashboard } from "@/components/live-games-dashboard";
import { getWinProbabilities, WinProbability } from "@/lib/odds-api";
import {
  getDefaultGameWindow,
  getScheduleTeams,
  getTodayGames
} from "@/lib/nba-api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [todayGames, defaultGames, teams] = await Promise.all([
    getTodayGames(),
    getDefaultGameWindow(),
    getScheduleTeams()
  ]);
  const predictions = await getWinProbabilities(todayGames);
  const predictionsByGameId = Object.fromEntries(
    todayGames.map((game) => [
      game.id,
      predictions.get(game.id) ??
        ({
          away: 50,
          home: 50,
          source: "estimativa"
        } satisfies WinProbability)
    ])
  );

  return (
    <main className="pageShell">
      <div className="layoutWithAds">
        <aside className="adRail adRailLeft" aria-label="Publicidade lateral esquerda">
          <div className="adSlot">
            <span>Ad</span>
          </div>
        </aside>

        <div className="mainColumn">
          <LiveGamesDashboard
            initialGames={todayGames}
            predictions={predictionsByGameId}
          >
            <div className="adBanner adBannerMiddle" aria-label="Publicidade entre secoes">
              <span>Ad</span>
            </div>
            <AdvancedGamesFilter initialGames={defaultGames} teams={teams} />
          </LiveGamesDashboard>

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
