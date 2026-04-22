import { NbaGame } from "@/lib/nba-api";

export type YouTubeHighlightVideo = {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
};

type YouTubeSearchResponse = {
  items?: {
    id?: {
      videoId?: string;
    };
    snippet?: {
      title?: string;
      publishedAt?: string;
      thumbnails?: {
        high?: {
          url?: string;
        };
        medium?: {
          url?: string;
        };
      };
    };
  }[];
};

type YouTubeRssVideo = {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
};

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const YOUTUBE_CHANNEL_RSS_URL = "https://www.youtube.com/feeds/videos.xml";
const YOUTUBE_RESULTS_URL = "https://www.youtube.com/results";
const NBA_YOUTUBE_CHANNEL_ID = "UCWJ2lWNubArHWmf3FIHbfcQ";

function addDays(date: string, days: number) {
  const parsedDate = new Date(`${date}T00:00:00Z`);

  parsedDate.setUTCDate(parsedDate.getUTCDate() + days);

  return parsedDate.toISOString();
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function decodeHtml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function getTagValue(item: string, tag: string) {
  const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));

  return match ? decodeHtml(match[1]) : "";
}

function getAttributeValue(value: string, attribute: string) {
  const match = value.match(new RegExp(`${attribute}=["']([^"']+)["']`, "i"));

  return match ? decodeHtml(match[1]) : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getText(value: unknown): string {
  if (!isRecord(value)) {
    return "";
  }

  const simpleText = value.simpleText;

  if (typeof simpleText === "string") {
    return simpleText;
  }

  const runs = value.runs;

  if (!Array.isArray(runs)) {
    return "";
  }

  return runs
    .map((run) => (isRecord(run) && typeof run.text === "string" ? run.text : ""))
    .join("")
    .trim();
}

function isPastGame(game: NbaGame) {
  return new Date(`${game.date}T23:59:59-03:00`).getTime() < Date.now();
}

function canHaveHighlights(game: NbaGame) {
  return game.status === "final" || isPastGame(game);
}

function getMatchScore(title: string, game: NbaGame) {
  const normalizedTitle = normalize(title);
  const teams = [
    game.awayTeam.name,
    game.homeTeam.name,
    game.awayTeam.city,
    game.homeTeam.city,
    game.awayTeam.abbreviation,
    game.homeTeam.abbreviation
  ].map(normalize);

  const teamMatches = teams.filter((team) => team && normalizedTitle.includes(team)).length;
  const highlightMatches = [
    "full game highlights",
    "game highlights",
    "highlights",
    "game recap"
  ].filter((term) => normalizedTitle.includes(term)).length;
  const nbaMatch = normalizedTitle.includes("nba") ? 1 : 0;

  return teamMatches + highlightMatches * 2 + nbaMatch;
}

function buildSearchQueries(game: NbaGame) {
  const gameYear = game.date.slice(0, 4);

  return [
    `${game.awayTeam.name} ${game.homeTeam.name} NBA Full Game Highlights ${gameYear}`,
    `${game.awayTeam.abbreviation} ${game.homeTeam.abbreviation} NBA Full Game Highlights ${gameYear}`,
    `${game.awayTeam.name} at ${game.homeTeam.name} Full Game Highlights ${gameYear}`,
    `${game.awayTeam.city} ${game.homeTeam.city} NBA Highlights ${gameYear}`
  ];
}

function parseYouTubeRss(xml: string): YouTubeRssVideo[] {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];

  return entries
    .map((entry) => {
      const videoId = getTagValue(entry, "yt:videoId");
      const title = getTagValue(entry, "title");
      const publishedAt = getTagValue(entry, "published");
      const thumbnailMatch = entry.match(/<media:thumbnail[^>]*>/i);

      return {
        videoId,
        title,
        publishedAt,
        thumbnailUrl: thumbnailMatch ? getAttributeValue(thumbnailMatch[0], "url") : ""
      };
    })
    .filter((video) => video.videoId && video.title);
}

function isPublishedNearGame(video: Pick<YouTubeHighlightVideo, "publishedAt">, game: NbaGame) {
  const publishedAt = new Date(video.publishedAt).getTime();
  const after = new Date(addDays(game.date, -1)).getTime();
  const before = new Date(addDays(game.date, 8)).getTime();

  return publishedAt >= after && publishedAt <= before;
}

function extractInitialData(html: string) {
  const match =
    html.match(/var ytInitialData = ([\s\S]*?);<\/script>/) ??
    html.match(/ytInitialData"\s*:\s*({[\s\S]*?})\s*,\s*"ytcfg"/);

  if (!match?.[1]) {
    return null;
  }

  try {
    return JSON.parse(match[1]) as unknown;
  } catch {
    return null;
  }
}

function collectVideoRenderers(value: unknown, renderers: Record<string, unknown>[] = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectVideoRenderers(item, renderers));
    return renderers;
  }

  if (!isRecord(value)) {
    return renderers;
  }

  const videoRenderer = value.videoRenderer;

  if (isRecord(videoRenderer)) {
    renderers.push(videoRenderer);
  }

  Object.values(value).forEach((item) => collectVideoRenderers(item, renderers));

  return renderers;
}

function parseYouTubeSearchPage(html: string, game: NbaGame) {
  const initialData = extractInitialData(html);

  if (!initialData) {
    return [];
  }

  return collectVideoRenderers(initialData)
    .map((renderer) => {
      const videoId = renderer.videoId;
      const title = getText(renderer.title);
      const ownerText = getText(renderer.ownerText);
      const thumbnail =
        isRecord(renderer.thumbnail) && Array.isArray(renderer.thumbnail.thumbnails)
          ? renderer.thumbnail.thumbnails
              .map((item) =>
                isRecord(item) && typeof item.url === "string" ? item.url : ""
              )
              .filter(Boolean)
              .at(-1) ?? ""
          : "";

      if (typeof videoId !== "string" || !title) {
        return null;
      }

      return {
        videoId,
        title,
        thumbnailUrl: thumbnail,
        publishedAt: "",
        ownerText,
        score: getMatchScore(title, game)
      };
    })
    .filter(
      (
        video
      ): video is YouTubeHighlightVideo & { ownerText: string; score: number } =>
        Boolean(video)
    );
}

async function searchHighlightsWithApi(
  game: NbaGame
): Promise<YouTubeHighlightVideo | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const results = await Promise.all(
      buildSearchQueries(game).map(async (query) => {
        const params = new URLSearchParams({
          key: apiKey,
          part: "snippet",
          channelId: NBA_YOUTUBE_CHANNEL_ID,
          maxResults: "8",
          order: "relevance",
          q: query,
          type: "video",
          videoEmbeddable: "true",
          publishedAfter: addDays(game.date, -1),
          publishedBefore: addDays(game.date, 8)
        });

        const response = await fetch(`${YOUTUBE_SEARCH_URL}?${params.toString()}`, {
          next: {
            revalidate: 60 * 60 * 6
          }
        });

        if (!response.ok) {
          return [];
        }

        const data = (await response.json()) as YouTubeSearchResponse;

        return (
          data.items
            ?.map((item) => {
              const videoId = item.id?.videoId;
              const title = item.snippet?.title ?? "";

              if (!videoId || !title) {
                return null;
              }

              return {
                videoId,
                title,
                thumbnailUrl:
                  item.snippet?.thumbnails?.high?.url ??
                  item.snippet?.thumbnails?.medium?.url ??
                  "",
                publishedAt: item.snippet?.publishedAt ?? "",
                score: getMatchScore(title, game)
              };
            })
            .filter((video): video is YouTubeHighlightVideo & { score: number } =>
              Boolean(video)
            ) ?? []
        );
      })
    );

    const candidates = results
      .flat()
      .filter((video) => isPublishedNearGame(video, game))
      .sort((a, b) => b.score - a.score);

    const [bestVideo] = candidates;

    if (!bestVideo || bestVideo.score < 4) {
      return null;
    }

    return {
      videoId: bestVideo.videoId,
      title: bestVideo.title,
      thumbnailUrl: bestVideo.thumbnailUrl,
      publishedAt: bestVideo.publishedAt
    };
  } catch {
    return null;
  }
}

async function searchHighlightsWithRss(
  game: NbaGame
): Promise<YouTubeHighlightVideo | null> {
  try {
    const params = new URLSearchParams({
      channel_id: NBA_YOUTUBE_CHANNEL_ID
    });
    const response = await fetch(`${YOUTUBE_CHANNEL_RSS_URL}?${params.toString()}`, {
      next: {
        revalidate: 60 * 30
      }
    });

    if (!response.ok) {
      return null;
    }

    const candidates = parseYouTubeRss(await response.text())
      .map((video) => ({
        ...video,
        score: getMatchScore(video.title, game)
      }))
      .filter((video) => isPublishedNearGame(video, game))
      .sort((a, b) => b.score - a.score);

    const [bestVideo] = candidates;

    if (!bestVideo || bestVideo.score < 4) {
      return null;
    }

    return {
      videoId: bestVideo.videoId,
      title: bestVideo.title,
      thumbnailUrl: bestVideo.thumbnailUrl,
      publishedAt: bestVideo.publishedAt
    };
  } catch {
    return null;
  }
}

async function searchHighlightsWithWeb(
  game: NbaGame
): Promise<YouTubeHighlightVideo | null> {
  try {
    const results = await Promise.all(
      buildSearchQueries(game).map(async (query) => {
        const params = new URLSearchParams({
          search_query: `${query} NBA`
        });
        const response = await fetch(`${YOUTUBE_RESULTS_URL}?${params.toString()}`, {
          headers: {
            "accept-language": "en-US,en;q=0.9,pt-BR;q=0.8",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36"
          },
          next: {
            revalidate: 60 * 60 * 12
          }
        });

        if (!response.ok) {
          return [];
        }

        return parseYouTubeSearchPage(await response.text(), game);
      })
    );

    const candidates = results
      .flat()
      .filter((video) => normalize(video.ownerText) === "nba")
      .sort((a, b) => b.score - a.score);

    const [bestVideo] = candidates;

    if (!bestVideo || bestVideo.score < 5) {
      return null;
    }

    return {
      videoId: bestVideo.videoId,
      title: bestVideo.title,
      thumbnailUrl: bestVideo.thumbnailUrl,
      publishedAt: bestVideo.publishedAt
    };
  } catch {
    return null;
  }
}

export async function getGameHighlightVideo(
  game: NbaGame
): Promise<YouTubeHighlightVideo | null> {
  if (!canHaveHighlights(game)) {
    return null;
  }

  return (
    (await searchHighlightsWithApi(game)) ??
    (await searchHighlightsWithRss(game)) ??
    searchHighlightsWithWeb(game)
  );
}
