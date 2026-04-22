import { NbaGame } from "@/lib/nba-api";

export type GameNewsArticle = {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  description: string;
  imageUrl?: string;
};

const GOOGLE_NEWS_RSS_URL = "https://news.google.com/rss/search";

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

function stripTags(value: string) {
  return decodeHtml(value.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function getTagValue(item: string, tag: string) {
  const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));

  return match ? decodeHtml(match[1]) : "";
}

function getSource(item: string) {
  const source = getTagValue(item, "source");

  if (source) {
    return source;
  }

  const title = getTagValue(item, "title");
  const [, sourceFromTitle] = title.split(" - ");

  return sourceFromTitle?.trim() || "Google News";
}

function getAttributeValue(value: string, attribute: string) {
  const match = value.match(new RegExp(`${attribute}=["']([^"']+)["']`, "i"));

  return match ? decodeHtml(match[1]) : "";
}

function getImageUrl(item: string) {
  const mediaMatch = item.match(/<media:(?:content|thumbnail)[^>]*>/i);

  if (mediaMatch) {
    const mediaUrl = getAttributeValue(mediaMatch[0], "url");

    if (mediaUrl) {
      return mediaUrl;
    }
  }

  const description = getTagValue(item, "description");
  const imageMatch = description.match(/<img[^>]*>/i);

  if (!imageMatch) {
    return undefined;
  }

  return getAttributeValue(imageMatch[0], "src") || undefined;
}

function getPublishedTimestamp(article: GameNewsArticle) {
  const timestamp = new Date(article.publishedAt).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getNewsCutoff(game: NbaGame) {
  const now = Date.now();
  const gameDate = new Date(`${game.date}T00:00:00Z`).getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  const recentWindow = game.status === "scheduled" ? 7 * oneDay : 14 * oneDay;
  const dateWindow = game.status === "scheduled" ? gameDate - oneDay : gameDate - 2 * oneDay;

  return Math.max(now - recentWindow, dateWindow);
}

function parseGoogleNewsFeed(xml: string): GameNewsArticle[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

  return items
    .map((item) => {
      const title = getTagValue(item, "title");
      const link = getTagValue(item, "link");
      const publishedAt = getTagValue(item, "pubDate");
      const description = stripTags(getTagValue(item, "description"));

      return {
        title: title.replace(/\s-\s[^-]+$/, ""),
        url: link,
        source: getSource(item),
        publishedAt,
        description,
        imageUrl: getImageUrl(item)
      };
    })
    .filter((article) => article.title && article.url);
}

function buildGameNewsQuery(game: NbaGame, language: "pt" | "en") {
  const away = `${game.awayTeam.city} ${game.awayTeam.name}`;
  const home = `${game.homeTeam.city} ${game.homeTeam.name}`;
  const separator = language === "pt" ? "x" : "vs";
  const context = language === "pt" ? "NBA resultado OR resumo" : "NBA recap OR highlights";

  return `"${away}" ${separator} "${home}" ${context}`;
}

async function fetchGoogleNews(query: string, language: "pt" | "en") {
  const params = new URLSearchParams({
    q: query,
    hl: language === "pt" ? "pt-BR" : "en-US",
    gl: language === "pt" ? "BR" : "US",
    ceid: language === "pt" ? "BR:pt-419" : "US:en"
  });

  const response = await fetch(`${GOOGLE_NEWS_RSS_URL}?${params.toString()}`, {
    next: {
      revalidate: 60 * 60 * 3
    }
  });

  if (!response.ok) {
    return [];
  }

  return parseGoogleNewsFeed(await response.text());
}

export async function getGameNews(game: NbaGame) {
  try {
    const portugueseNews = await fetchGoogleNews(buildGameNewsQuery(game, "pt"), "pt");
    const cutoff = getNewsCutoff(game);
    const recentPortugueseNews = portugueseNews
      .filter((article) => getPublishedTimestamp(article) >= cutoff)
      .sort((a, b) => getPublishedTimestamp(b) - getPublishedTimestamp(a));

    if (recentPortugueseNews.length >= 3) {
      return recentPortugueseNews.slice(0, 3);
    }

    const englishNews = await fetchGoogleNews(buildGameNewsQuery(game, "en"), "en");
    const articlesByUrl = new Map<string, GameNewsArticle>();

    recentPortugueseNews.forEach((article) => {
      articlesByUrl.set(article.url, article);
    });

    englishNews.forEach((article) => {
      if (getPublishedTimestamp(article) >= cutoff) {
        articlesByUrl.set(article.url, article);
      }
    });

    const portugueseArticles = Array.from(articlesByUrl.values()).filter((article) =>
      recentPortugueseNews.some((portugueseArticle) => portugueseArticle.url === article.url)
    );
    const englishArticles = Array.from(articlesByUrl.values())
      .filter(
        (article) =>
          !recentPortugueseNews.some(
            (portugueseArticle) => portugueseArticle.url === article.url
          )
      )
      .sort((a, b) => getPublishedTimestamp(b) - getPublishedTimestamp(a));

    return [...portugueseArticles, ...englishArticles].slice(0, 3);
  } catch {
    return [];
  }
}
