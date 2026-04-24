import { AdBanner, PageWithAds } from "@/components/layout/page-with-ads";
import { HomeOverview } from "@/components/home/home-overview";
import { SiteHeader } from "@/components/site-header";
import { leagues } from "@/lib/leagues";
import { getHomeGameFeedItems } from "@/lib/home-feed";
import { getLeagueBreakingNews } from "@/lib/news-api";
import { getTodayGames } from "@/lib/nba-api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const todayGames = await getTodayGames();
  const liveGames = todayGames.filter((game) => game.status === "live").length;
  const finishedGames = todayGames.filter((game) => game.status === "final").length;
  const [gameFeedItems, breakingNews] = await Promise.all([
    Promise.resolve(getHomeGameFeedItems(todayGames, 4)),
    getLeagueBreakingNews(leagues, 4)
  ]);

  return (
    <main className="pageShell">
      <SiteHeader games={todayGames} />
      <PageWithAds>
        <HomeOverview
          totalGamesToday={todayGames.length}
          liveGamesNow={liveGames}
          finishedGames={finishedGames}
          gameFeedItems={gameFeedItems}
          breakingNews={breakingNews}
        />

        <AdBanner className="adBanner adBannerBottom" ariaLabel="Publicidade inferior" />
      </PageWithAds>
    </main>
  );
}
