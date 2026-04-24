import { AdvancedGamesFilter } from "@/components/advanced-games-filter";
import { AdBanner, PageWithAds } from "@/components/layout/page-with-ads";
import { LiveGamesDashboard } from "@/components/live-games-dashboard";
import { getWinProbabilities, WinProbability } from "@/lib/odds-api";
import {
  getDefaultGameWindow,
  getScheduleTeams,
  getTodayGames
} from "@/lib/nba-api";

export const dynamic = "force-dynamic";

export default async function NbaPage() {
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
      <PageWithAds>
          <LiveGamesDashboard
            initialGames={todayGames}
            predictions={predictionsByGameId}
          >
            <AdBanner
              className="adBanner adBannerMiddle"
              ariaLabel="Publicidade entre secoes"
            />
            <AdvancedGamesFilter initialGames={defaultGames} teams={teams} />
          </LiveGamesDashboard>

          <AdBanner className="adBanner adBannerBottom" ariaLabel="Publicidade inferior" />
      </PageWithAds>
    </main>
  );
}
