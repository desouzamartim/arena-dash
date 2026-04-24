import { GameDetailView } from "@/components/game-detail/game-detail-view";
import { LeaguePlaceholderView } from "@/components/league/league-placeholder-view";
import { getBroadcastLabel } from "@/lib/nba-game-format";
import { getLeagueBySlug } from "@/lib/leagues";
import { getGameById, getGameStatsById, getTodayGames } from "@/lib/nba-api";
import { getGameHighlightVideo } from "@/lib/youtube-api";
import { getGameNews } from "@/lib/news-api";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function isGameSlug(slug: string) {
  return slug.startsWith("nba-");
}

function getGameIdFromSlug(slug: string) {
  return slug.slice(4);
}

function isPlaceholderLeagueSlug(slug: string) {
  return slug === "nfl" || slug === "nhl" || slug === "mlb";
}

async function renderLeaguePlaceholderPage(slug: string) {
  const league = getLeagueBySlug(slug);

  if (!league) {
    notFound();
  }

  const todayGames = await getTodayGames();

  return <LeaguePlaceholderView league={league} todayGames={todayGames} />;
}

async function renderGameDetailPage(gameId: string) {
  const [game, todayGames, stats] = await Promise.all([
    getGameById(gameId),
    getTodayGames(),
    getGameStatsById(gameId)
  ]);

  if (!game) {
    notFound();
  }

  const [news, highlightVideo] = await Promise.all([
    getGameNews(game),
    getGameHighlightVideo(game)
  ]);

  return (
    <GameDetailView
      game={game}
      todayGames={todayGames}
      stats={stats}
      news={news}
      highlightVideo={highlightVideo}
      broadcasts={getBroadcastLabel(game.broadcastsBrazil)}
    />
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (isGameSlug(slug)) {
    const game = await getGameById(getGameIdFromSlug(slug));

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

  const league = getLeagueBySlug(slug);

  if (!league) {
    return {
      title: "Pagina nao encontrada"
    };
  }

  return {
    title: league.name,
    description: league.description
  };
}

export default async function SlugPage({ params }: PageProps) {
  const { slug } = await params;

  if (isGameSlug(slug)) {
    return renderGameDetailPage(getGameIdFromSlug(slug));
  }

  if (isPlaceholderLeagueSlug(slug)) {
    return renderLeaguePlaceholderPage(slug);
  }

  notFound();
}
